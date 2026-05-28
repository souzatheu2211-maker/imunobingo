"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS } from '@/data/millionaireQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Timer, Users, Sparkles, Skull, Flame, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MillionairePresentation = () => {
  const { id: roomId } = useParams();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      const { data: roomData } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
      if (roomData) setRoom(roomData);
      const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
      if (playersData) setPlayers(playersData);
    };
    fetchData();

    const channel = supabase.channel(`presentation_realtime_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((room?.phase === 'question' || room?.phase.startsWith('special')) && room?.question_started_at) {
      timer = setInterval(() => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        setTimeLeft(Math.max(0, 20 - elapsed));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [room?.phase, room?.question_started_at]);

  if (!room) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  const currentQuestionId = room?.question_ids?.[room?.current_question_index];
  const currentQuestion = MILLIONAIRE_QUESTIONS.find(q => q.id === currentQuestionId) || MILLIONAIRE_QUESTIONS.find(q => q.special_type === room.phase.split('_')[1]);

  return (
    <div className="min-h-screen bg-slate-950 p-12 flex flex-col gap-12 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-7xl font-black text-white tracking-tighter">IMUNO<span className="text-yellow-500">MILIONÁRIO</span></h1>
          <div className="flex gap-4">
            <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30 px-6 py-2 text-lg font-black">ARENA DE CONHECIMENTO</Badge>
            {room.phase.startsWith('special') && <Badge className="bg-red-600 text-white px-6 py-2 text-lg font-black animate-pulse">RODADA ESPECIAL</Badge>}
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Código de Acesso</p>
            <p className="text-white text-6xl font-black tracking-tighter">{room.code}</p>
          </div>
          {(room.phase === 'question' || room.phase.startsWith('special')) && (
            <div className={cn("p-10 rounded-[3rem] border-4 flex items-center gap-8 transition-all duration-500", timeLeft <= 5 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-orange-600/10 border-orange-500/30")}>
              <Timer className={cn("w-16 h-16", timeLeft <= 5 ? "text-red-500" : "text-orange-600")} />
              <span className={cn("text-8xl font-black tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-orange-600")}>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 flex-1">
        <div className="col-span-8 flex flex-col gap-8">
          {room.phase === 'special_malice' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in zoom-in duration-1000">
              <Skull className="w-48 h-48 text-red-600 animate-pulse" />
              <div className="text-center space-y-6">
                <h2 className="text-7xl font-black text-white tracking-tighter">PERGUNTA DA MALDADE</h2>
                <p className="text-3xl text-slate-400 font-bold italic">"O líder está decidindo o destino do grupo..."</p>
              </div>
            </div>
          ) : room.phase === 'question' || room.phase.startsWith('special') || room.phase === 'reveal' ? (
            <div className="space-y-12 animate-in zoom-in duration-700">
              <Card className="bg-white border-none rounded-[4rem] p-20 shadow-[0_0_100px_rgba(234,179,8,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-6 bg-yellow-500" />
                <h2 className="text-6xl md:text-7xl font-black text-slate-950 text-center leading-tight tracking-tight">
                  {currentQuestion?.question}
                </h2>
              </Card>

              <div className="grid grid-cols-2 gap-8">
                {currentQuestion && Object.entries(currentQuestion.options).map(([key, val]) => (
                  <div key={key} className={cn(
                    "p-10 rounded-[3rem] border-4 text-4xl font-black transition-all duration-700 flex items-center gap-8",
                    room.phase === 'reveal' && key === currentQuestion.correct ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-[0_0_80px_rgba(16,185,129,0.4)]" :
                    room.phase === 'reveal' && key !== currentQuestion.correct ? "bg-white/5 border-white/10 text-slate-700 opacity-40" :
                    "bg-white/5 border-white/10 text-white"
                  )}>
                    <span className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">{key}</span>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          ) : room.phase === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in fade-in duration-1000">
              <Trophy className="w-80 h-80 text-yellow-500 animate-bounce" />
              <h2 className="text-9xl font-black text-white tracking-tighter text-center">DESAFIO <br /> <span className="text-yellow-500">CONCLUÍDO</span></h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Sparkles className="w-40 h-40 text-yellow-500 animate-pulse" />
              <h2 className="text-6xl font-black text-white tracking-tight uppercase">Aguardando Início...</h2>
            </div>
          )}
        </div>

        <div className="col-span-4">
          <Card className="bg-slate-900/80 border-white/10 rounded-[4rem] h-full overflow-hidden backdrop-blur-3xl shadow-2xl">
            <div className="p-10 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">Ranking</h3>
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            
            <div className="p-10 space-y-6">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border-4 transition-all duration-500",
                  p.is_eliminated ? "opacity-30 bg-red-500/5 border-red-500/10 grayscale" : "bg-white/5 border-white/10",
                  i === 0 && !p.is_eliminated && "ring-4 ring-yellow-500/30 bg-yellow-500/5 scale-105"
                )}>
                  <div className="flex items-center gap-6">
                    <span className={cn("text-4xl font-black w-12", i === 0 ? "text-yellow-500" : "text-slate-600")}>{i + 1}º</span>
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-white/10">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback className="bg-slate-800 text-2xl font-black">{p.name[0]}</AvatarFallback>
                      </Avatar>
                      {p.is_eliminated && <Skull className="absolute -top-2 -right-2 w-8 h-8 text-red-500 bg-slate-950 rounded-full p-1" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-white tracking-tight">{p.name}</span>
                      <span className={cn("text-xs font-black uppercase", p.is_eliminated ? "text-red-500" : "text-emerald-500")}>
                        {p.is_eliminated ? "Eliminado" : "Ativo"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MillionairePresentation;