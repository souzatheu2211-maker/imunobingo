"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/data/millionaireQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Timer, Users, LogOut, Sparkles, CheckCircle2, 
  Zap, Loader2, Send, XCircle, Ghost, AlertCircle, 
  Lightbulb, Split, Repeat, ShieldCheck, HandMetal, 
  Skull, Flame, TrendingUp, TrendingDown, UserMinus
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
  
  // Ajudas
  const [used5050, setUsed5050] = useState(false);
  const [usedDouble, setUsedDouble] = useState(false);
  const [usedTip, setUsedTip] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [doubleChanceActive, setDoubleChanceActive] = useState(false);
  const [firstWrongDone, setFirstWrongDone] = useState(false);

  // Maldade
  const [maliceTarget, setMaliceTarget] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  const currentQuestionId = room?.question_ids?.[room?.current_question_index];
  const currentQuestion = MILLIONAIRE_QUESTIONS.find(q => q.id === currentQuestionId);
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index && a.phase === room?.phase);

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setCurrentUserId(user.id);

      const { data: roomData } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
      if (!roomData) return navigate('/millionaire');
      setRoom(roomData);

      const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
      setPlayers(playersData || []);

      const { data: answersData } = await supabase.from('millionaire_answers').select('*').eq('room_id', roomId);
      setAnswers(answersData || []);

      setLoading(false);
    };

    setup();

    const channel = supabase.channel(`millionaire_realtime_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.phase.startsWith('question') || payload.new.phase.startsWith('special')) {
          setSelectedChoice(null);
          setHiddenOptions([]);
          setShowTip(false);
          setDoubleChanceActive(false);
          setFirstWrongDone(false);
          setMaliceTarget(null);
        }
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
    if ((room?.phase === 'question' || room?.phase.startsWith('special')) && room?.question_started_at) {
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
      .eq('question_index', room.current_question_index)
      .eq('phase', room.phase);

    const sortedPlayers = [...players].sort((a, b) => b.current_value - a.current_value);
    const lastPlaceId = sortedPlayers.filter(p => !p.is_eliminated).pop()?.id;

    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      
      let newValue = player.current_value;
      let eliminated = player.is_eliminated;

      if (room.phase === 'special_professor') {
        if (isCorrect) newValue += 5000;
        else {
          newValue = Math.max(0, newValue - 3000);
          eliminated = true;
        }
      } else if (room.phase === 'special_surprise') {
        if (isCorrect) newValue += 40000;
        else newValue = Math.max(0, newValue - 10000);
        
        if (player.id === lastPlaceId) eliminated = true;
      } else if (room.phase === 'special_malice') {
        // Lógica de maldade processada no clique do botão
      } else {
        // Rodada Normal
        const qNum = room.current_question_index + 1;
        if (isCorrect) {
          newValue += qNum * 1000;
        } else {
          if (qNum <= 5) newValue = Math.max(0, newValue - 2000);
          else if (qNum <= 10) newValue = Math.max(0, newValue - 10000);
          else {
            newValue = Math.max(0, newValue - 20000);
            eliminated = true;
          }
        }
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

      if (!activePlayers || activePlayers.length === 0) {
        await supabase.from('millionaire_rooms').update({ phase: 'finished', status: 'finished' }).eq('id', roomId);
        return;
      }

      let nextPhase = 'question';
      let nextIndex = room.current_question_index;

      if (room.phase === 'reveal') {
        // Lógica de progressão
        if (nextIndex === 1) nextPhase = 'special_professor';
        else if (nextIndex === 4) nextPhase = 'special_surprise';
        else if (nextIndex === 8) nextPhase = 'special_malice';
        else {
          nextIndex++;
          if (nextIndex >= 15) {
            await supabase.from('millionaire_rooms').update({ phase: 'finished', status: 'finished' }).eq('id', roomId);
            confetti();
            return;
          }
        }
      } else {
        // Voltou de uma especial
        nextIndex++;
      }

      await supabase.from('millionaire_rooms').update({
        current_question_index: nextIndex,
        phase: nextPhase,
        question_started_at: new Date().toISOString()
      }).eq('id', roomId);
    }, 5000);
  };

  const handleChoiceClick = (key: string) => {
    if (myPlayer?.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)) return;
    if (doubleChanceActive && key !== currentQuestion?.correct && !firstWrongDone) {
      setFirstWrongDone(true);
      setHiddenOptions(prev => [...prev, key]);
      showError("Primeira chance errada! Você ainda tem mais uma.");
      return;
    }
    setSelectedChoice(key);
  };

  const submitAnswer = async () => {
    if (!selectedChoice || myPlayer?.is_eliminated || myAnswer) return;
    setSubmitting(true);
    const isCorrect = selectedChoice === currentQuestion?.correct;
    try {
      await supabase.from('millionaire_answers').insert({
        room_id: roomId,
        player_id: myPlayer.id,
        question_index: room.current_question_index,
        answer: selectedChoice,
        is_correct: isCorrect,
        phase: room.phase
      });
      showSuccess("Resposta enviada!");
    } catch (error) {
      showError("Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaliceDecision = async (choice: 'SIM' | 'NÃO') => {
    if (choice === 'NÃO') {
      await supabase.from('millionaire_answers').insert({
        room_id: roomId,
        player_id: myPlayer.id,
        question_index: room.current_question_index,
        answer: 'NÃO',
        is_correct: true,
        phase: 'special_malice'
      });
      showSuccess("Você escolheu o caminho da ética.");
    } else {
      if (!maliceTarget) return showError("Selecione um alvo primeiro.");
      
      // PEGADINHA: O líder é eliminado e o dinheiro vai para o alvo
      const targetPlayer = players.find(p => p.id === maliceTarget);
      const leaderValue = myPlayer.current_value;

      await supabase.from('millionaire_players').update({
        is_eliminated: true,
        current_value: 0
      }).eq('id', myPlayer.id);

      await supabase.from('millionaire_players').update({
        current_value: targetPlayer.current_value + leaderValue
      }).eq('id', targetPlayer.id);

      await supabase.from('millionaire_answers').insert({
        room_id: roomId,
        player_id: myPlayer.id,
        question_index: room.current_question_index,
        answer: 'SIM',
        is_correct: false,
        phase: 'special_malice'
      });

      showError("A GANÂNCIA TE DESTRUIU! Um corpo não funciona sozinho.");
    }
  };

  const startGame = async () => {
    if (room.host_id !== currentUserId) return;
    const normalIds = MILLIONAIRE_QUESTIONS.filter(q => !q.is_special).map(q => q.id);
    await supabase.from('millionaire_rooms').update({
      status: 'playing',
      phase: 'question',
      current_question_index: 0,
      question_ids: normalIds,
      question_started_at: new Date().toISOString()
    }).eq('id', roomId);
  };

  if (loading || !room || !myPlayer) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  const isSpecial = room.phase.startsWith('special');
  const isLeader = [...players].sort((a, b) => b.current_value - a.current_value)[0]?.id === myPlayer.id;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      {/* Ranking Lateral */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Ranking em Tempo Real</h3>
            <TrendingUp className="w-3 h-3 text-blue-400" />
          </div>
          <div className="p-4 space-y-3">
            {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
              <div key={p.id} className={cn(
                "flex items-center justify-between p-3 rounded-2xl transition-all duration-500",
                p.is_eliminated ? "bg-red-500/5 opacity-40 grayscale" : "bg-white/5 hover:bg-white/10",
                i === 0 && !p.is_eliminated && "ring-1 ring-yellow-500/30 bg-yellow-500/5"
              )}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-white/10">
                      <AvatarImage src={p.avatar_url} />
                      <AvatarFallback className="bg-slate-800 text-[10px] font-black">{p.name[0]}</AvatarFallback>
                    </Avatar>
                    {p.is_eliminated && <Skull className="absolute -top-1 -right-1 w-4 h-4 text-red-500 bg-slate-950 rounded-full p-0.5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white truncate max-w-[80px]">{p.name}</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">{i + 1}º LUGAR</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
                  {p.is_eliminated && <span className="text-[7px] text-red-500 font-black uppercase">ELIMINADO</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Prêmios */}
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Escada do Milhão</h3>
          </div>
          <div className="p-4 space-y-1">
            {[15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
              <div key={n} className={cn(
                "flex justify-between px-4 py-1 rounded-lg text-[10px] font-black",
                room.current_question_index + 1 === n ? "bg-yellow-600 text-white scale-105" : "text-slate-600"
              )}>
                <span>{n}</span>
                <span>R$ {(n * 1000).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Área de Jogo */}
      <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            <span className="font-black text-white tracking-tight uppercase">Show do Milhão Imuno</span>
          </div>
          <div className="flex items-center gap-4">
            {room.phase.startsWith('special') && (
              <Badge className="bg-red-600 text-white font-black animate-pulse px-4 py-1 rounded-full">
                RODADA ESPECIAL
              </Badge>
            )}
            <div className="flex items-center gap-2 bg-orange-600/20 px-4 py-1.5 rounded-full border border-orange-500/30">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-black text-lg">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {room.phase === 'waiting' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Sparkles className="w-20 h-20 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-5xl font-black text-white tracking-tighter">O GRANDE DESAFIO</h2>
            <p className="text-slate-400 text-lg font-medium">Prepare seus anticorpos. O milhão está em jogo.</p>
            {room.host_id === currentUserId && (
              <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl shadow-2xl shadow-yellow-900/40">
                INICIAR SHOW
              </Button>
            )}
          </Card>
        ) : room.phase === 'special_malice' ? (
          <div className="space-y-8 animate-in zoom-in duration-700">
            <Card className="bg-red-600 border-none rounded-[3rem] p-12 text-center space-y-6 shadow-2xl">
              <Skull className="w-20 h-20 text-white mx-auto animate-pulse" />
              <h2 className="text-4xl font-black text-white tracking-tighter">PERGUNTA DA MALDADE</h2>
              <p className="text-white/80 text-xl font-bold">"O quão ganancioso você é?"</p>
              <p className="text-white/60 text-sm">Você pode eliminar uma pessoa do jogo e receber todo valor dela para subir ainda mais. Deseja eliminar alguém?</p>
            </Card>

            {isLeader && !myAnswer ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleMaliceDecision('NÃO')} className="h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-2xl rounded-3xl">NÃO</Button>
                  <Button onClick={() => handleMaliceDecision('SIM')} className="h-20 bg-red-950 hover:bg-red-900 text-white font-black text-2xl rounded-3xl">SIM</Button>
                </div>
                
                {maliceTarget && (
                  <div className="text-center p-4 bg-red-500/20 rounded-2xl border border-red-500/30 animate-pulse">
                    <p className="text-red-500 font-black uppercase">ALVO SELECIONADO: {players.find(p => p.id === maliceTarget)?.name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {players.filter(p => p.id !== myPlayer.id && !p.is_eliminated).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setMaliceTarget(p.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        maliceTarget === p.id ? "bg-red-600 border-red-400 scale-105" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <Avatar className="w-12 h-12"><AvatarImage src={p.avatar_url} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                      <span className="text-[10px] font-black text-white uppercase truncate w-full">{p.name}</span>
                      <span className="text-[8px] text-yellow-500 font-bold">R$ {p.current_value.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-white/5 rounded-[3rem] border border-white/10">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-black uppercase tracking-widest">O líder está decidindo o destino do grupo...</p>
              </div>
            )}
          </div>
        ) : room.phase === 'reveal' ? (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <Card className="bg-white border-none rounded-[3rem] p-12 text-center shadow-2xl">
              <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest mb-4">Resposta Correta</h3>
              <div className="bg-emerald-500 text-white p-8 rounded-3xl text-4xl font-black shadow-xl">
                {currentQuestion?.correct}: {currentQuestion?.options[currentQuestion?.correct as keyof typeof currentQuestion.options]}
              </div>
              <p className="mt-8 text-slate-600 font-medium italic text-lg">"{currentQuestion?.explanation}"</p>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-3xl p-6">
                <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sobreviventes</h4>
                <div className="space-y-2">
                  {players.filter(p => !p.is_eliminated).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-white font-bold text-sm">
                      <span>{p.name}</span>
                      <span className="text-emerald-400">R$ {p.current_value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-red-500/10 border-red-500/20 rounded-3xl p-6">
                <h4 className="text-red-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><UserMinus className="w-4 h-4" /> Eliminados</h4>
                <div className="space-y-2">
                  {players.filter(p => p.is_eliminated).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-slate-500 font-bold text-sm">
                      <span className="line-through">{p.name}</span>
                      <span className="text-red-500">OUT</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ajudas */}
            {!myPlayer.is_eliminated && !isSpecial && (
              <div className="flex justify-center gap-4">
                <Button onClick={use5050} disabled={used5050 || !!myAnswer} className={cn("h-14 px-6 rounded-2xl font-black", used5050 ? "bg-slate-800 text-slate-600" : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20")}><Split className="mr-2" /> 50/50</Button>
                <Button onClick={useDoubleChance} disabled={usedDouble || !!myAnswer} className={cn("h-14 px-6 rounded-2xl font-black", usedDouble ? "bg-slate-800 text-slate-600" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20")}><Repeat className="mr-2" /> DUPLA CHANCE</Button>
                <Button onClick={useTip} disabled={usedTip || !!myAnswer} className={cn("h-14 px-6 rounded-2xl font-black", usedTip ? "bg-slate-800 text-slate-600" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20")}><Lightbulb className="mr-2" /> DICA</Button>
              </div>
            )}

            {isSpecial && (
              <div className="bg-red-600/20 border border-red-500/30 p-4 rounded-2xl text-center animate-pulse">
                <p className="text-red-500 font-black uppercase tracking-widest">AJUDAS BLOQUEADAS NESTA RODADA</p>
              </div>
            )}

            {showTip && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 font-bold italic text-center animate-in slide-in-from-top">
                "{currentQuestion?.tip}"
              </div>
            )}

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight tracking-tight">
                {currentQuestion?.question}
              </h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion && Object.entries(currentQuestion.options).map(([key, val]) => (
                <Button
                  key={key}
                  disabled={myPlayer.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)}
                  onClick={() => handleChoiceClick(key)}
                  className={cn(
                    "h-20 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8",
                    myAnswer?.answer === key ? "bg-yellow-600 border-yellow-400 text-white shadow-lg" :
                    selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" :
                    hiddenOptions.includes(key) ? "opacity-0 pointer-events-none" :
                    "bg-white/5 border-white/10 text-white hover:bg-white/10",
                    myPlayer.is_eliminated && "opacity-40 grayscale"
                  )}
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                  {val}
                </Button>
              ))}
            </div>

            {!myAnswer && !myPlayer.is_eliminated && (
              <div className="flex justify-center">
                <Button onClick={submitAnswer} disabled={!selectedChoice || submitting} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-900/20">
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />} CONFIRMAR RESPOSTA
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MillionaireGame;