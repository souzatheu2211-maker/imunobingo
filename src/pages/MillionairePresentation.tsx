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
      const { data: roomData } = await supabase
        .from('millionaire_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomData) setRoom(roomData);

      const { data: playersData } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', roomId);
      
      if (playersData) setPlayers(playersData);
    };

    fetchData();

    // Inscrição Realtime robusta
    const channel = supabase.channel(`presentation_room_${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'millionaire_rooms', 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        console.log("Mudança na sala detectada:", payload.new);
        setRoom(payload.new);
        // Reinicia o cronômetro sempre que a pergunta mudar ou o jogo começar
        setTimeLeft(20);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'millionaire_players', 
        filter: `room_id=eq.${roomId}` 
      }, (payload) => {
        console.log("Mudança nos jogadores detectada:", payload);
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        console.log("Status da conexão Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Lógica do cronômetro sincronizada com o status da sala
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.status === 'playing' && timeLeft > 0 && !room.show_answer) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, room?.status, room?.show_answer]);

  if (!room) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando com o Servidor...</p>
    </div>
  );

  const currentQuestion = MILLIONAIRE_QUESTIONS[room.current_question_index];

  return (
    <div className="min-h-screen bg-slate-950 p-12 flex flex-col gap-12 overflow-hidden">
      {/* Header Gigante */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-tighter">
            IMUNO<span className="text-yellow-500">MILIONÁRIO</span>
          </h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30 px-4 py-1 text-sm font-black">
              ARENA DE CONHECIMENTO
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Código de Acesso</p>
            <p className="text-white text-5xl font-black tracking-tighter">{room.code}</p>
          </div>
          
          <div className={cn(
            "p-8 rounded-[2.5rem] border-4 flex items-center gap-6 transition-all duration-500",
            timeLeft <= 5 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-yellow-600/10 border-yellow-500/30"
          )}>
            <Timer className={cn("w-12 h-12", timeLeft <= 5 ? "text-red-500" : "text-yellow-500")} />
            <span className={cn("text-7xl font-black tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-yellow-500")}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 flex-1">
        {/* Área da Pergunta */}
        <div className="col-span-8 flex flex-col gap-8">
          {room.status === 'playing' ? (
            <div className="space-y-8 animate-in zoom-in duration-700">
              <Card className="bg-white border-none rounded-[4rem] p-16 shadow-[0_0_100px_rgba(234,179,8,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-yellow-500" />
                <h2 className="text-5xl md:text-6xl font-black text-slate-950 text-center leading-tight tracking-tight">
                  {currentQuestion.question}
                </h2>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                {Object.entries(currentQuestion.options).map(([key, val]) => (
                  <div 
                    key={key}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-4 text-3xl font-black transition-all duration-700 flex items-center gap-6",
                      room.show_answer && key === currentQuestion.correct 
                        ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-[0_0_60px_rgba(16,185,129,0.4)]" 
                        : room.show_answer && key !== currentQuestion.correct
                        ? "bg-white/5 border-white/10 text-slate-700 opacity-40"
                        : "bg-white/5 border-white/10 text-white"
                    )}
                  >
                    <span className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl">{key}</span>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          ) : room.status === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in fade-in duration-1000">
              <div className="relative">
                <div className="absolute -inset-12 bg-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                <Trophy className="w-72 h-72 text-yellow-500 relative" />
              </div>
              <h2 className="text-8xl font-black text-white tracking-tighter text-center">
                DESAFIO <br /> <span className="text-yellow-500">CONCLUÍDO</span>
              </h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Sparkles className="w-32 h-32 text-yellow-500 animate-pulse" />
              <h2 className="text-5xl font-black text-white tracking-tight uppercase">Aguardando Início da Rodada...</h2>
              <p className="text-slate-500 text-xl font-bold">Preparem seus conhecimentos imunológicos!</p>
            </div>
          )}
        </div>

        {/* Ranking Lateral */}
        <div className="col-span-4">
          <Card className="bg-white/5 border-white/10 rounded-[3rem] h-full overflow-hidden backdrop-blur-xl border-t-white/20 shadow-2xl">
            <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Ranking do Lab</h3>
              </div>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                {players.length} JOGADORES
              </Badge>
            </div>
            
            <div className="p-8 space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border transition-all duration-500",
                  p.is_eliminated ? "opacity-30 bg-red-500/5 border-red-500/10 grayscale" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-2xl font-black w-8",
                      i === 0 ? "text-yellow-500" : "text-slate-600"
                    )}>{i + 1}º</span>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white tracking-tight">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {p.is_eliminated ? (
                          <span className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Eliminado
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ativo no Jogo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Prêmio Atual</p>
                  </div>
                </div>
              ))}
              
              {players.length === 0 && (
                <div className="text-center py-20 text-slate-600 italic font-bold">
                  Nenhum candidato conectado...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MillionairePresentation;