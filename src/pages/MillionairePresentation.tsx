"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, SPECIAL_QUESTIONS } from '@/data/millionaireQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Timer, Users, Sparkles, Skull, Flame, AlertTriangle } from 'lucide-react';
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
    const channel = supabase.channel(`presentation_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.phase?.includes('question') || room?.phase?.startsWith('special_')) {
      timer = setInterval(() => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        setTimeLeft(Math.max(0, 20 - elapsed));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [room?.phase, room?.question_started_at]);

  if (!room) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Sparkles className="animate-spin" /></div>;

  const getActiveQuestion = () => {
    const isProfessor = room.phase === 'special_professor' || room.phase === 'reveal_special_professor';
    const isSurprise = room.phase === 'special_surprise' || room.phase === 'reveal_special_surprise';
    const isMalice = room.phase === 'special_malice' || room.phase === 'reveal_special_malice';

    if (isProfessor) return SPECIAL_QUESTIONS.professor;
    if (isSurprise) return SPECIAL_QUESTIONS.surprise;
    if (isMalice) return { question: "O quão ganancioso você é? Deseja eliminar alguém para roubar seus pontos?" };

    const qId = room.question_ids?.[room.current_question_index];
    return MILLIONAIRE_QUESTIONS.find(q => q.id === qId) || MILLIONAIRE_QUESTIONS[0];
  };

  const currentQuestion = getActiveQuestion();

  return (
    <div className={cn(
      "min-h-screen p-12 flex flex-col gap-12 transition-colors duration-1000",
      room.phase === 'special_professor' || room.phase === 'reveal_special_professor' ? "bg-red-950" :
      room.phase === 'special_surprise' || room.phase === 'reveal_special_surprise' ? "bg-blue-950" :
      room.phase === 'special_malice' || room.phase === 'reveal_special_malice' ? "bg-purple-950" :
      "bg-slate-950"
    )}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-tighter">IMUNO<span className="text-yellow-500">MILIONÁRIO</span></h1>
          <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30 px-4 py-1 text-sm font-black">MODO PROJETOR</Badge>
        </div>
        
        {room.phase !== 'waiting' && room.phase !== 'finished' && !room.phase.startsWith('reveal') && (
          <div className={cn(
            "p-8 rounded-[2.5rem] border-4 flex items-center gap-6",
            timeLeft <= 5 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-orange-600/10 border-orange-500/30"
          )}>
            <Timer className={cn("w-12 h-12", timeLeft <= 5 ? "text-red-500" : "text-orange-600")} />
            <span className={cn("text-7xl font-black tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-orange-600")}>{timeLeft}s</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-12 flex-1">
        <div className="col-span-8 flex flex-col gap-8">
          {room.phase === 'question' || room.phase.startsWith('special_') || room.phase.startsWith('reveal') ? (
            <div className="space-y-8 animate-in zoom-in duration-700">
              <Card className={cn(
                "rounded-[4rem] p-16 shadow-2xl relative overflow-hidden border-none",
                room.phase?.startsWith('special_') || room.phase?.startsWith('reveal_special') ? "bg-white/10 text-white" : "bg-white text-slate-950"
              )}>
                <h2 className="text-5xl md:text-6xl font-black text-center leading-tight tracking-tight">
                  {currentQuestion.question}
                </h2>
              </Card>

              {room.phase !== 'special_malice' && room.phase !== 'reveal_special_malice' && (
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(currentQuestion.options || {}).map(([key, val]) => val && (
                    <div key={key} className={cn(
                      "p-8 rounded-[2.5rem] border-4 text-3xl font-black flex items-center gap-6 transition-all duration-500",
                      room.phase.startsWith('reveal') && key === currentQuestion.correct ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-2xl" :
                      room.phase.startsWith('reveal') ? "opacity-20 bg-white/5 border-white/10 text-white" :
                      "bg-white/5 border-white/10 text-white"
                    )}>
                      <span className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl">{key}</span>
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : room.phase === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-12">
              <Trophy className="w-72 h-72 text-yellow-500 animate-bounce" />
              <h2 className="text-8xl font-black text-white tracking-tighter text-center">DESAFIO <span className="text-yellow-500">CONCLUÍDO</span></h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Sparkles className="w-32 h-32 text-yellow-500 animate-pulse" />
              <h2 className="text-5xl font-black text-white tracking-tight uppercase">Aguardando Início...</h2>
            </div>
          )}
        </div>

        <div className="col-span-4">
          <Card className="bg-white/5 border-white/10 rounded-[3rem] h-full overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Ranking em Tempo Real</h3>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="p-8 space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border transition-all duration-500",
                  p.is_eliminated ? "opacity-30 bg-red-500/5 border-red-500/10 grayscale" : "bg-white/5 border-white/10",
                  i === 0 && !p.is_eliminated && "ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-2xl font-black w-8", i === 0 ? "text-yellow-500" : "text-slate-600")}>{i + 1}º</span>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white tracking-tight">{p.name}</span>
                      {p.is_eliminated && <span className="text-[10px] font-black text-red-500 uppercase">Eliminado</span>}
                    </div>
                  </div>
                  <p className="text-3xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
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