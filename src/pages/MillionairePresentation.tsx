"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS } from '@/data/millionaireQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Timer, 
  Users, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Skull,
  Star,
  TrendingUp,
  Monitor,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

const MillionairePresentation = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('millionaire_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (roomError || !roomData) {
          showError("Arena não localizada.");
          navigate('/home');
          return;
        }
        setRoom(roomData);

        const { data: playersData } = await supabase
          .from('millionaire_players')
          .select('*')
          .eq('room_id', roomId);
        
        if (playersData) setPlayers(playersData);
      } catch (err) {
        console.error(err);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel(`presentation_v2_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        else if (payload.eventType === 'DELETE') setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.phase === 'question' && room?.question_started_at) {
      timer = setInterval(() => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        setTimeLeft(Math.max(0, 20 - elapsed));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [room?.phase, room?.question_started_at]);

  if (loading || !room) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      <p className="font-black uppercase tracking-widest text-[10px] text-slate-500">Sincronizando Transmissão...</p>
    </div>
  );

  const currentQuestion = MILLIONAIRE_QUESTIONS[room.current_question_index] || MILLIONAIRE_QUESTIONS[0];
  const isSpecial = currentQuestion?.isSpecial;

  return (
    <div className="min-h-screen bg-slate-950 p-8 md:p-12 flex flex-col gap-8 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-end relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-xl">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter">
              IMUNO<span className="text-yellow-500">MILIONÁRIO</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/5 text-slate-400 border-white/10 px-4 py-1 text-xs font-black uppercase tracking-widest">
              Transmissão Oficial
            </Badge>
            {isSpecial && (
              <Badge className="bg-red-600 text-white border-none px-4 py-1 text-xs font-black uppercase tracking-widest animate-pulse">
                Rodada Especial
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Acesso à Arena</p>
            <p className="text-white text-5xl font-black tracking-tighter font-mono">{room.code}</p>
          </div>
          
          {room.phase === 'question' && (
            <div className={cn(
              "p-6 rounded-[2rem] border-4 flex items-center gap-6 transition-all duration-500 shadow-2xl",
              timeLeft <= 5 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-white/5 border-white/10"
            )}>
              <Timer className={cn("w-10 h-10", timeLeft <= 5 ? "text-red-500" : "text-yellow-500")} />
              <span className={cn("text-6xl font-black tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-white")}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8 flex-1 relative z-10">
        <div className="col-span-8 flex flex-col gap-6">
          {room.phase === 'question' || room.phase === 'reveal' ? (
            <div className="space-y-6 animate-in zoom-in duration-700">
              {/* Question Card */}
              <Card className={cn(
                "border-none rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden transition-colors duration-500",
                isSpecial ? "bg-slate-900 ring-4 ring-red-600/50" : "bg-white"
              )}>
                {isSpecial && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.5em]">
                    <Skull className="w-4 h-4" /> Perigo Iminente <Skull className="w-4 h-4" />
                  </div>
                )}
                <h2 className={cn(
                  "text-4xl md:text-6xl font-black text-center leading-tight tracking-tight",
                  isSpecial ? "text-white" : "text-slate-950"
                )}>
                  {currentQuestion.question}
                </h2>
              </Card>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentQuestion.options).map(([key, val]) => (
                  <div 
                    key={key}
                    className={cn(
                      "p-6 rounded-[2.5rem] border-4 text-2xl font-black transition-all duration-700 flex items-center gap-6",
                      room.phase === 'reveal' && key === currentQuestion.correct 
                        ? "bg-emerald-500 border-emerald-400 text-white scale-105 shadow-[0_0_50px_rgba(16,185,129,0.3)]" 
                        : room.phase === 'reveal' && key !== currentQuestion.correct
                        ? "bg-white/5 border-white/10 text-slate-700 opacity-30"
                        : "bg-white/5 border-white/10 text-white"
                    )}
                  >
                    <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-lg">{key}</span>
                    <span className="truncate">{val}</span>
                  </div>
                ))}
              </div>

              {/* Reveal Info */}
              {room.phase === 'reveal' && currentQuestion.explanation && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-[2.5rem] animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-2">
                    <Star className="w-4 h-4" /> Nota do Especialista
                  </div>
                  <p className="text-white text-xl font-medium italic leading-relaxed">
                    "{currentQuestion.explanation}"
                  </p>
                </div>
              )}
            </div>
          ) : room.phase === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000">
              <div className="relative">
                <div className="absolute -inset-12 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse" />
                <Trophy className="w-64 h-64 text-yellow-500 relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-8xl font-black text-white tracking-tighter">DESAFIO FINALIZADO</h2>
                <p className="text-yellow-500 font-black text-xl uppercase tracking-[0.5em]">Temos um novo Milionário?</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <Monitor className="w-12 h-12 text-slate-700" />
              </div>
              <h2 className="text-4xl font-black text-slate-500 tracking-widest uppercase">Aguardando Comando do Host</h2>
            </div>
          )}
        </div>

        {/* Sidebar Ranking */}
        <div className="col-span-4">
          <Card className="bg-white/5 border-white/10 rounded-[3rem] h-full overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Ranking Geral</h3>
              </div>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 font-black">
                {players.length} ATIVOS
              </Badge>
            </div>
            
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-500",
                  p.is_eliminated ? "opacity-20 bg-red-500/5 border-red-500/10 grayscale" : "bg-white/5 border-white/10"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-2xl font-black w-8",
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-600"
                    )}>
                      {i + 1}º
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        {p.name}
                        {i === 0 && !p.is_eliminated && <Crown className="w-4 h-4 text-yellow-500" />}
                      </span>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", p.is_eliminated ? "text-red-500" : "text-emerald-500")}>
                        {p.is_eliminated ? "Eliminado do Jogo" : "Em Combate"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {players.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                  <Users className="w-12 h-12" />
                  <p className="font-black uppercase text-[10px] tracking-widest">Nenhum jogador na arena</p>
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