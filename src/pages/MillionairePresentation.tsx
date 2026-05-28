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
  Crown,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

const MillionairePresentation = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      navigate('/home');
      return;
    }

    const fetchData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('millionaire_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (roomError || !roomData) throw new Error("Arena não localizada.");
        setRoom(roomData);

        const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
        if (playersData) setPlayers(playersData);

        const { data: answersData } = await supabase.from('millionaire_answers').select('*').eq('room_id', roomId);
        if (answersData) setAnswers(answersData);

      } catch (err: any) {
        console.error(err);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel(`presentation_v4_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.new) setRoom(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'millionaire_answers', filter: `room_id=eq.${roomId}` }, (payload) => {
        setAnswers(prev => [...prev, payload.new]);
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

  if (loading || !room) return null;

  const currentQuestion = MILLIONAIRE_QUESTIONS[room.current_question_index] || MILLIONAIRE_QUESTIONS[0];
  const isMaldade = currentQuestion.id === 'maldade';
  
  const sortedRanking = [...players].sort((a, b) => b.current_value - a.current_value);
  const top1Player = sortedRanking[0];
  const maldadeAnswer = answers.find(a => a.player_id === top1Player?.id && a.question_index === room.current_question_index);

  return (
    <div className="min-h-screen bg-slate-950 p-8 md:p-12 flex flex-col gap-8 overflow-hidden relative">
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
          <Badge className={cn("px-4 py-1 text-xs font-black uppercase tracking-widest", isMaldade ? "bg-red-600 animate-pulse" : "bg-white/5 text-slate-400")}>
            {isMaldade ? "RODADA DA MALDADE" : "TRANSMISSÃO OFICIAL"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Acesso à Arena</p>
            <p className="text-white text-5xl font-black tracking-tighter font-mono">{room.code}</p>
          </div>
          {room.phase === 'question' && (
            <div className={cn("p-6 rounded-[2rem] border-4 flex items-center gap-6", timeLeft <= 5 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-white/5 border-white/10")}>
              <Timer className={cn("w-10 h-10", timeLeft <= 5 ? "text-red-500" : "text-yellow-500")} />
              <span className={cn("text-6xl font-black tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-white")}>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8 flex-1 relative z-10">
        <div className="col-span-8 flex flex-col gap-6">
          {room.phase === 'question' || room.phase === 'reveal' ? (
            <div className="space-y-6 animate-in zoom-in duration-700">
              <Card className={cn(
                "border-none rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden",
                isMaldade ? "bg-slate-900 ring-4 ring-red-600/50" : "bg-white"
              )}>
                {isMaldade && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.5em]">
                    <Skull className="w-4 h-4" /> O DESTINO ESTÁ NAS MÃOS DO LÍDER <Skull className="w-4 h-4" />
                  </div>
                )}
                <h2 className={cn("text-4xl md:text-6xl font-black text-center leading-tight tracking-tight", isMaldade ? "text-white" : "text-slate-950")}>
                  {currentQuestion.question}
                </h2>
              </Card>

              {isMaldade ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/10 w-full justify-center">
                    <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-slate-950">
                      <Crown className="w-10 h-10 text-slate-950" />
                    </div>
                    <div className="text-left">
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Líder Atual</p>
                      <p className="text-4xl font-black text-white">{top1Player?.name}</p>
                    </div>
                  </div>
                  
                  {room.phase === 'reveal' && maldadeAnswer && (
                    <div className={cn(
                      "p-10 rounded-[3rem] border-4 w-full text-center animate-in zoom-in",
                      maldadeAnswer.answer.startsWith('SIM:') ? "bg-red-600/20 border-red-500" : "bg-emerald-600/20 border-emerald-500"
                    )}>
                      <h3 className="text-5xl font-black text-white mb-4">
                        {maldadeAnswer.answer.startsWith('SIM:') ? "ESCOLHEU A GANÂNCIA!" : "ESCOLHEU A LEALDADE!"}
                      </h3>
                      <p className="text-xl text-slate-300 font-bold">
                        {maldadeAnswer.answer.startsWith('SIM:') 
                          ? `O líder foi eliminado e seus pontos foram para ${players.find(p => p.id === maldadeAnswer.answer.split(':')[1])?.name}!` 
                          : "O grupo permanece intacto. O líder provou seu valor."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(currentQuestion.options).map(([key, val]) => (
                    <div key={key} className={cn(
                      "p-6 rounded-[2.5rem] border-4 text-2xl font-black flex items-center gap-6",
                      room.phase === 'reveal' && key === currentQuestion.correct ? "bg-emerald-500 border-emerald-400 text-white scale-105" : "bg-white/5 border-white/10 text-white"
                    )}>
                      <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-lg">{key}</span>
                      <span className="truncate">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : room.phase === 'finished' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Trophy className="w-64 h-64 text-yellow-500" />
              <h2 className="text-8xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <Monitor className="w-12 h-12 text-slate-700" />
              <h2 className="text-4xl font-black text-slate-500 tracking-widest uppercase">Aguardando Host</h2>
            </div>
          )}
        </div>

        {/* Sidebar Ranking */}
        <div className="col-span-4">
          <Card className="bg-white/5 border-white/10 rounded-[3rem] h-full overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Ranking</h3>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {sortedRanking.map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-5 rounded-[2rem] border",
                  p.is_eliminated ? "opacity-20 bg-red-500/5 border-red-500/10" : "bg-white/5 border-white/10"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-2xl font-black w-8", i === 0 ? "text-yellow-500" : "text-slate-600")}>{i + 1}º</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white flex items-center gap-2">
                        {p.name} {i === 0 && !p.is_eliminated && <Crown className="w-4 h-4 text-yellow-500" />}
                      </span>
                      <span className={cn("text-[8px] font-black uppercase", p.is_eliminated ? "text-red-500" : "text-emerald-500")}>
                        {p.is_eliminated ? "Eliminado" : "Ativo"}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
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