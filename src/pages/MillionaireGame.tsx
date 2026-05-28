"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/data/millionaireQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Timer, 
  Users, 
  LogOut, 
  Sparkles, 
  CheckCircle2,
  Zap,
  Loader2,
  XCircle,
  BarChart3,
  Split,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Ghost,
  Wallet,
  Monitor,
  Crown,
  User
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const MillionaireGame = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [used5050, setUsed5050] = useState(false);
  const [usedProb, setUsedProb] = useState(false);
  const [aidUsedThisTurn, setAidUsedThisTurn] = useState(false);
  
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [probabilities, setProbabilities] = useState<Record<string, number>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  const currentQuestion = MILLIONAIRE_QUESTIONS[room?.current_question_index] || MILLIONAIRE_QUESTIONS[0];
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index);

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0 && (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload') {
      navigate('/millionaire');
    }
  }, [navigate]);

  useEffect(() => {
    if (room?.phase === 'question' && room?.question_started_at) {
      const updateTimer = () => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0 && room.host_id === currentUserId) {
          handleRevealPhase();
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.phase, room?.question_started_at, room?.host_id, currentUserId]);

  const handleRevealPhase = async () => {
    if (room.host_id !== currentUserId) return;

    const { data: roundAnswers } = await supabase
      .from('millionaire_answers')
      .select('*')
      .eq('room_id', roomId)
      .eq('question_index', room.current_question_index);

    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      const q = MILLIONAIRE_QUESTIONS[room.current_question_index];
      
      let newValue = player.current_value;
      let eliminated = false;

      if (isCorrect) {
        if (q.id === 'bonus') newValue += 40000;
        else newValue += (q.value || 0);
      } else {
        if (q.id === 'bonus') newValue = Math.max(0, newValue - 10000);
        else if (room.current_question_index <= 5) newValue = Math.max(0, newValue - 2000);
        else if (room.current_question_index <= 14) newValue = Math.max(0, newValue - 10000);
        else newValue = Math.max(0, newValue - 40000);

        if (q.id === 'prof') eliminated = true;
        else if (room.current_question_index >= 15) eliminated = true;
        else if (q.id === 'maldade' && playerAns?.answer === 'A') eliminated = true;
      }

      await supabase.from('millionaire_players').update({
        current_value: newValue,
        is_eliminated: eliminated,
        last_answered_index: room.current_question_index
      }).eq('id', player.id);
    }

    await supabase.from('millionaire_rooms').update({ phase: 'reveal' }).eq('id', roomId);

    setTimeout(async () => {
      const { data: activePlayers } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_eliminated', false);

      const nextIndex = room.current_question_index + 1;
      
      if (!activePlayers || activePlayers.length === 0 || nextIndex >= MILLIONAIRE_QUESTIONS.length) {
        await supabase.from('millionaire_rooms').update({ phase: 'finished', status: 'finished' }).eq('id', roomId);
        confetti();
      } else {
        await supabase.from('millionaire_rooms').update({
          current_question_index: nextIndex,
          phase: 'question',
          question_started_at: new Date().toISOString()
        }).eq('id', roomId);
      }
    }, 8000);
  };

  const useAid = (type: '5050' | 'prob') => {
    if (aidUsedThisTurn || currentQuestion.isSpecial || myPlayer?.is_eliminated || room?.phase !== 'question') {
      showError("Ajudas bloqueadas nesta rodada.");
      return;
    }

    setAidUsedThisTurn(true);

    if (type === '5050') {
      setUsed5050(true);
      const incorrect = Object.keys(currentQuestion.options).filter(key => key !== currentQuestion.correct);
      const toHide = incorrect.sort(() => Math.random() - 0.5).slice(0, 2);
      setHiddenOptions(toHide);
      showSuccess("50/50 Ativado!");
    } else if (type === 'prob') {
      setUsedProb(true);
      const probs: Record<string, number> = {};
      const keys = ['A', 'B', 'C', 'D'];
      let remaining = 100;
      
      const correctProb = Math.floor(Math.random() * 20) + 50;
      probs[currentQuestion.correct] = correctProb;
      remaining -= correctProb;

      const others = keys.filter(k => k !== currentQuestion.correct);
      others.forEach((k, i) => {
        if (i === others.length - 1) probs[k] = remaining;
        else {
          const p = Math.floor(Math.random() * remaining);
          probs[k] = p;
          remaining -= p;
        }
      });
      setProbabilities(probs);
      showSuccess("Probabilidades calculadas!");
    }
  };

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setCurrentUserId(user.id);

      const { data: roomData } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
      if (!roomData) return navigate('/millionaire');
      setRoom(roomData);

      const { data: playersData } = await supabase
        .from('millionaire_players')
        .select('*, profiles(avatar_url)')
        .eq('room_id', roomId);
      
      setPlayers(playersData?.map(p => ({ ...p, avatar_url: p.profiles?.avatar_url })) || []);

      const { data: answersData } = await supabase.from('millionaire_answers').select('*').eq('room_id', roomId);
      setAnswers(answersData || []);

      setLoading(false);
    };

    setup();

    const channel = supabase.channel(`millionaire_realtime_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.phase === 'question') {
          setSelectedChoice(null);
          setHiddenOptions([]);
          setProbabilities({});
          setAidUsedThisTurn(false);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', payload.new.user_id).single();
          const newPlayer = { ...payload.new, avatar_url: profile?.avatar_url };
          
          setPlayers(prev => {
            const exists = prev.find(p => p.id === payload.new.id);
            if (exists) return prev.map(p => p.id === payload.new.id ? newPlayer : p);
            return [...prev, newPlayer];
          });
        } else if (payload.eventType === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'millionaire_answers', filter: `room_id=eq.${roomId}` }, (payload) => {
        setAnswers(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  if (loading || !room || !myPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Arena...</p>
      </div>
    );
  }

  const getDelta = () => {
    if (!myAnswer) return 0;
    const q = currentQuestion;
    if (myAnswer.is_correct) {
      if (q.id === 'bonus') return 40000;
      return q.value || 0;
    } else {
      if (q.id === 'bonus') return -10000;
      if (room.current_question_index <= 5) return -2000;
      if (room.current_question_index <= 14) return -10000;
      return -40000;
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Escada de Prêmios</h3>
          </div>
          <div className="p-2 space-y-1">
            {MILLIONAIRE_QUESTIONS.map((q, idx) => (
              <div key={idx} className={cn(
                "flex justify-between px-4 py-1.5 rounded-xl text-[10px] font-black",
                room.current_question_index === idx ? "bg-yellow-600 text-white scale-105 shadow-lg" : 
                q.isSpecial ? "text-violet-400 bg-violet-500/5" : "text-slate-500"
              )}>
                <span>{idx + 1}</span>
                <span>{q.isSpecial ? q.id.toUpperCase() : `R$ ${q.value?.toLocaleString()}`}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            <div className="flex flex-col">
              <span className="font-black text-white tracking-tight leading-none">SALA #{room.code}</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Arena Imuno</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-yellow-600/20 px-5 py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-3 shadow-lg shadow-yellow-900/10">
              <Wallet className="w-4 h-4 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-yellow-500 uppercase tracking-[0.2em] leading-none mb-1">Seu Saldo</span>
                <span className="text-sm font-black text-white leading-none">R$ {myPlayer.current_value.toLocaleString()}</span>
              </div>
            </div>

            {room.host_id === currentUserId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 h-10 px-4 rounded-xl font-black text-[10px]"
                onClick={() => window.open(`/millionaire/${roomId}/presentation`, '_blank')}
              >
                <Monitor className="w-4 h-4 mr-1.5" /> ABRIR PAINEL
              </Button>
            )}

            {myPlayer.is_eliminated && <Badge className="bg-red-600/20 text-red-500 border-red-500/30 px-3 py-1 animate-pulse">ELIMINADO</Badge>}
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400" onClick={() => navigate('/millionaire')}>
              <LogOut className="w-4 h-4 mr-2" /> SAIR
            </Button>
          </div>
        </div>

        {room.phase === 'question' ? (
          <div className="space-y-8">
            {!myPlayer.is_eliminated && !currentQuestion.isSpecial && (
              <div className="flex justify-center gap-4">
                <Button onClick={() => useAid('5050')} disabled={used5050 || aidUsedThisTurn || !!myAnswer} className={cn("h-14 px-6 rounded-2xl font-black", used5050 ? "bg-slate-800" : "bg-violet-600")}>
                  <Split className="w-5 h-5 mr-2" /> 50/50
                </Button>
                <Button onClick={() => useAid('prob')} disabled={usedProb || aidUsedThisTurn || !!myAnswer} className={cn("h-14 px-6 rounded-2xl font-black", usedProb ? "bg-slate-800" : "bg-blue-600")}>
                  <BarChart3 className="w-5 h-5 mr-2" /> PROBABILIDADES
                </Button>
              </div>
            )}

            {currentQuestion.isSpecial && (
              <div className="flex justify-center animate-bounce">
                <Badge className={cn(
                  "px-6 py-2 text-lg font-black rounded-full shadow-2xl",
                  currentQuestion.id === 'prof' ? "bg-red-600 text-white" : 
                  currentQuestion.id === 'bonus' ? "bg-emerald-600 text-white" : "bg-violet-600 text-white"
                )}>
                  {currentQuestion.id === 'prof' && "⚠️ RODADA DO PROFESSOR: ERRO = ELIMINAÇÃO"}
                  {currentQuestion.id === 'bonus' && "🎁 RODADA SURPRESA: ÚLTIMO ELIMINADO"}
                  {currentQuestion.id === 'maldade' && "😈 RODADA DA GANÂNCIA"}
                </Badge>
              </div>
            )}

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-8 flex items-center gap-2 bg-orange-600/20 px-4 py-1.5 rounded-full">
                <Timer className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-black text-lg">{timeLeft}s</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight">
                {currentQuestion.question}
              </h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion.options).map(([key, val]) => (
                <Button
                  key={key}
                  disabled={myPlayer.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)}
                  onClick={() => setSelectedChoice(key)}
                  className={cn(
                    "h-24 rounded-3xl font-black text-xl transition-all border-2 text-left justify-between px-8",
                    selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" :
                    hiddenOptions.includes(key) ? "opacity-0 pointer-events-none" :
                    "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center">
                    <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                    {val}
                  </div>
                  {probabilities[key] && (
                    <span className="text-xs font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">
                      {probabilities[key]}%
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {!myAnswer && !myPlayer.is_eliminated && (
              <div className="flex justify-center">
                <Button onClick={async () => {
                  if (!selectedChoice) return;
                  setSubmitting(true);
                  await supabase.from('millionaire_answers').insert({
                    room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
                    answer: selectedChoice, is_correct: selectedChoice === currentQuestion.correct
                  });
                  setSubmitting(false);
                }} disabled={!selectedChoice || submitting} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg">
                  CONFIRMAR RESPOSTA
                </Button>
              </div>
            )}
          </div>
        ) : room.phase === 'reveal' ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <Card className={cn(
              "border-none rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden",
              myAnswer?.is_correct ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
            )}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  {myAnswer?.is_correct ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>
                <h2 className="text-5xl font-black tracking-tighter uppercase">
                  {myAnswer?.is_correct ? "VOCÊ ACERTOU!" : "VOCÊ ERROU!"}
                </h2>
                <div className="flex items-center gap-3 bg-black/20 px-8 py-4 rounded-2xl border border-white/10">
                  {getDelta() >= 0 ? <TrendingUp className="w-6 h-6 text-emerald-300" /> : <TrendingDown className="w-6 h-6 text-red-300" />}
                  <span className="text-3xl font-black">
                    {getDelta() >= 0 ? "+" : ""} R$ {getDelta().toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-10 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Resposta Correta</p>
                  <div className="inline-block bg-slate-950 text-yellow-500 px-8 py-4 rounded-2xl text-2xl font-black border-2 border-yellow-500/30">
                    {currentQuestion.correct}: {currentQuestion.options[currentQuestion.correct as keyof typeof currentQuestion.options]}
                  </div>
                </div>
                {currentQuestion.explanation && (
                  <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest mb-3">
                      <Sparkles className="w-4 h-4 text-violet-600" /> Explicação do Lab
                    </div>
                    <p className="text-slate-700 text-lg font-medium leading-relaxed italic">"{currentQuestion.explanation}"</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            <div className="max-w-md mx-auto space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-6 rounded-3xl border bg-white/5 border-white/10">
                  <span className="font-black text-white text-xl">{i + 1}º {p.name}</span>
                  <span className="text-yellow-500 font-black text-xl">R$ {p.current_value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/modes')} className="h-16 px-12 rounded-2xl font-black text-lg bg-white text-slate-950">VOLTAR AO MENU</Button>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            <Card className="bg-white/5 border-white/10 rounded-[3rem] p-8 md:p-12 text-center space-y-8 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">LOBBY DE ESPERA</h2>
                <p className="text-slate-400 font-medium">Aguardando o host iniciar o desafio...</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Users className="w-3 h-3" /> Jogadores Conectados ({players.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                          <AvatarImage src={p.avatar_url} className="object-cover" />
                          <AvatarFallback className="bg-slate-800 text-xs font-black">
                            {p.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-black text-white text-sm flex items-center gap-1">
                            {p.name}
                            {room.host_id === p.user_id && <Crown className="w-3 h-3 text-yellow-500" />}
                          </p>
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</p>
                        </div>
                      </div>
                      {room.host_id === p.user_id && (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[8px] font-black">HOST</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {room.host_id === currentUserId && (
                <div className="pt-8">
                  <Button 
                    onClick={async () => {
                      await supabase.from('millionaire_rooms').update({
                        status: 'playing', phase: 'question', current_question_index: 0, question_started_at: new Date().toISOString()
                      }).eq('id', roomId);
                    }} 
                    className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl shadow-2xl shadow-yellow-900/40 animate-bounce hover:animate-none transition-all active:scale-95"
                  >
                    INICIAR DESAFIO
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MillionaireGame;