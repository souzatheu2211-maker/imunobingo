"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS } from '@/data/millionaireQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Timer, Users, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MillionairePresentation = () => {
  const { id: roomId } = useParams();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      const { data: roomData } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
      setRoom(roomData);
      const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
      setPlayers(playersData || []);
    };

    fetchData();

    const channel = supabase.channel(`presentation:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        setTimeLeft(20);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    if (room?.status === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, room?.status]);

  if (!room) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black">CARREGANDO ARENA...</div>;

  const currentQuestion = MILLIONAIRE_QUESTIONS[room.current_question_index];

  return (
    <div className="min-h-screen bg-slate-950 p-12 flex flex-col gap-12 overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          IMUNO<span className="text-yellow-500">MILIONÁRIO</span>
        </h1>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Código da Sala</span>
            <span className="text-white text-3xl font-black">{room.code}</span>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-500/30 p-6 rounded-3xl flex items-center gap-4">
            <Timer className="w-10 h-10 text-yellow-500" />
            <span className="text-5xl font-black text-yellow-500">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 flex-1">
        <div className="col-span-8 space-y-12">
          {room.status === 'playing' ? (
            <div className="space-y-12 animate-in zoom-in duration-700">
              <Card className="bg-white border-none rounded-[4rem] p-20 shadow-[0_0_100px_rgba(234,179,8,0.1)]">
                <h2 className="text-6xl font-black text-slate-950 text-center leading-tight tracking-tight">
                  {currentQuestion.question}
                </h2>
              </Card>

              <div className="grid grid-cols-2 gap-8">
                {Object.entries(currentQuestion.options).map(([key, val]) => (
                  <div 
                    key={key}
                    className={cn(
                      "p-10 rounded-[2.5rem] border-4 text-4xl font-black transition-all duration-500 flex items-center gap-6",
                      room.show_answer && key === currentQuestion.correct 
                        ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-[0_0_50px_rgba(16,185,129,0.3)]" 
                        : "bg-white/5 border-white/10 text-white"
                    )}
                  >
                    <span className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">{key}</span>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          ) : room.status === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in fade-in duration-1000">
              <Trophy className="w-64 h-64 text-yellow-500 animate-bounce" />
              <h2 className="text-8xl font-black text-white tracking-tighter">DESAFIO CONCLUÍDO</h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Sparkles className="w-32 h-32 text-yellow-500 animate-pulse" />
              <h2 className="text-5xl font-black text-white tracking-tight">AGUARDANDO INÍCIO...</h2>
            </div>
          )}
        </div>

        <div className="col-span-4">
          <Card className="bg-white/5 border-white/10 rounded-[3rem] h-full overflow-hidden backdrop-blur-xl">
            <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Ranking em Tempo Real</h3>
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="p-8 space-y-6">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border transition-all duration-500",
                  p.is_eliminated ? "opacity-40 bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"
                )}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-slate-500">{i + 1}º</span>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white">{p.name}</span>
                      {p.is_eliminated ? (
                        <span className="text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Eliminado
                        </span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-3xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</span>
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