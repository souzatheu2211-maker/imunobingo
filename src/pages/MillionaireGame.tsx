"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, SPECIAL_QUESTIONS, MillionaireQuestion } from '@/data/millionaireQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Timer, 
  Users, 
  LogOut, 
  Monitor, 
  Sparkles, 
  CheckCircle2,
  Zap,
  Loader2,
  Send,
  XCircle,
  Ghost,
  AlertCircle,
  Lightbulb,
  Repeat,
  ShieldCheck,
  HandMetal,
  Split,
  Skull,
  Flame,
  UserMinus
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const PRIZES = [
  1000, 2000, 3000, 5000, 10000, 
  20000, 30000, 50000, 100000, 200000, 
  300000, 500000, 700000, 900000, 1000000
];

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
  
  // Estados das Ajudas
  const [used5050, setUsed5050] = useState(false);
  const [usedDouble, setUsedDouble] = useState(false);
  const [usedTip, setUsedTip] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [doubleChanceActive, setDoubleChanceActive] = useState(false);
  const [firstWrongDone, setFirstWrongDone] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  const isSpecialPhase = room?.phase?.startsWith('special_');
  let currentQuestion: MillionaireQuestion;

  if (room?.phase === 'special_professor') {
    currentQuestion = SPECIAL_QUESTIONS.professor;
  } else if (room?.phase === 'special_surprise') {
    currentQuestion = SPECIAL_QUESTIONS.surprise;
  } else if (room?.phase === 'special_malice') {
    currentQuestion = {
      id: 'malice',
      difficulty: 'special',
      question: "O quão ganancioso você é? Você pode eliminar uma pessoa do jogo e receber todo valor dela pra subir ainda mais no jogo, deseja eliminar alguém?",
      options: { A: "SIM", B: "NÃO", C: "", D: "" },
      correct: "B",
      explanation: "NÃO SEJA GANANCIOSO. UM CORPO NÃO FUNCIONA SOZINHO SEM O TRABALHO EM CONJUNTO DE TODAS AS CÉLULAS.",
      tip: ""
    };
  } else {
    const currentQuestionId = room?.question_ids?.[room?.current_question_index];
    currentQuestion = MILLIONAIRE_QUESTIONS.find(q => q.id === currentQuestionId) || MILLIONAIRE_QUESTIONS[0];
  }
  
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index && a.phase === room?.phase);

  useEffect(() => {
    if (room?.phase?.includes('question') || room?.phase?.startsWith('special_')) {
      const updateTimer = () => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0 && room.host_id === currentUserId && room.phase !== 'reveal') {
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

    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      
      let newValue = player.current_value;
      let eliminated = false;

      if (room.phase === 'special_professor') {
        if (isCorrect) newValue += 10000;
        else {
          newValue = Math.max(0, newValue - 3000);
          eliminated = true;
        }
      } else if (room.phase === 'special_surprise') {
        if (isCorrect) newValue += 40000;
        else newValue = Math.max(0, newValue - 10000);
      } else if (room.phase === 'question') {
        if (isCorrect) {
          newValue += PRIZES[room.current_question_index];
        } else {
          if (room.current_question_index < 4) {
            newValue = Math.max(0, newValue - 2000);
          } else if (room.current_question_index < 9) {
            newValue = Math.max(0, newValue - 10000);
          } else {
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

    if (room.phase === 'special_surprise') {
      const { data: currentPlayers } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_eliminated', false)
        .order('current_value', { ascending: true });
      
      if (currentPlayers && currentPlayers.length > 0) {
        await supabase.from('millionaire_players').update({ is_eliminated: true }).eq('id', currentPlayers[0].id);
      }
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

      // Lógica de Sequência Estrita
      if (room.phase === 'special_professor') {
        nextIndex = 2; // Vai para Q3
      } else if (room.phase === 'special_surprise') {
        nextIndex = 5; // Vai para Q6
      } else if (room.phase === 'special_malice') {
        nextIndex = 9; // Vai para Q10
      } else {
        if (room.current_question_index === 1) {
          nextPhase = 'special_professor';
        } else if (room.current_question_index === 4) {
          nextPhase = 'special_surprise';
        } else if (room.current_question_index === 8) {
          nextPhase = 'special_malice';
        } else {
          nextIndex++;
          if (nextIndex >= 15) nextPhase = 'finished';
        }
      }

      await supabase.from('millionaire_rooms').update({
        current_question_index: nextIndex,
        phase: nextPhase === 'finished' ? 'finished' : nextPhase,
        status: nextPhase === 'finished' ? 'finished' : 'playing',
        question_started_at: new Date().toISOString()
      }).eq('id', roomId);

      if (nextPhase === 'finished') confetti();
    }, 5000);
  };

  // Lógica das Ajudas
  const use5050 = () => {
    if (used5050 || isSpecialPhase || !!myAnswer) return;
    const wrongOptions = Object.keys(currentQuestion.options).filter(key => key !== currentQuestion.correct && currentQuestion.options[key as keyof typeof currentQuestion.options]);
    const toHide = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toHide);
    setUsed5050(true);
    showSuccess("50/50 Ativado!");
  };

  const useDoubleChance = () => {
    if (usedDouble || isSpecialPhase || !!myAnswer) return;
    setDoubleChanceActive(true);
    setUsedDouble(true);
    showSuccess("Dupla Chance Ativada!");
  };

  const useTipHelp = () => {
    if (usedTip || isSpecialPhase || !!myAnswer) return;
    setShowTip(true);
    setUsedTip(true);
    showSuccess("Dica Revelada!");
  };

  const handleChoiceClick = (key: string) => {
    if (myPlayer?.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)) return;
    if (room.phase === 'special_malice' && !isFirstPlace) return;

    if (doubleChanceActive && key !== currentQuestion.correct && !firstWrongDone) {
      setFirstWrongDone(true);
      setHiddenOptions(prev => [...prev, key]);
      showError("Primeira chance errada! Você ainda tem mais uma.");
      return;
    }

    setSelectedChoice(key);
  };

  const submitAnswer = async () => {
    if (!selectedChoice || myPlayer?.is_eliminated || !!myAnswer) return;
    setSubmitting(true);

    const isCorrect = selectedChoice === currentQuestion.correct;

    try {
      if (room.phase === 'special_malice') {
        if (selectedChoice === 'A') {
          setSelectedChoice('PICKING');
        } else {
          await supabase.from('millionaire_answers').insert({
            room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
            answer: 'B', is_correct: true, phase: room.phase
          });
          showSuccess("Você escolheu a humildade!");
        }
      } else {
        await supabase.from('millionaire_answers').insert({
          room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
          answer: selectedChoice, is_correct: isCorrect, phase: room.phase
        });
        showSuccess("Resposta enviada!");
      }
    } catch (error) {
      showError("Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaliceElimination = async (targetId: string) => {
    const target = players.find(p => p.id === targetId);
    if (!target) return;

    const confirmed = window.confirm(`Tem certeza que deseja eliminar ${target.name} e roubar seus R$ ${target.current_value.toLocaleString()}?`);
    if (!confirmed) return;

    try {
      await supabase.from('millionaire_players').update({ is_eliminated: true, current_value: 0 }).eq('id', myPlayer.id);
      await supabase.from('millionaire_players').update({ current_value: target.current_value + myPlayer.current_value }).eq('id', target.id);
      
      await supabase.from('millionaire_answers').insert({
        room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
        answer: 'A', is_correct: false, phase: room.phase
      });

      showError("A GANÂNCIA TE DESTRUIU!");
    } catch (e) {
      showError("Erro na transação.");
    }
  };

  const startGame = async () => {
    if (room.host_id !== currentUserId) return;
    const questionIds = MILLIONAIRE_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 15).map(q => q.id);
    await supabase.from('millionaire_rooms').update({
      status: 'playing', phase: 'question', current_question_index: 0,
      question_ids: questionIds, question_started_at: new Date().toISOString()
    }).eq('id', roomId);
  };

  const openProjector = () => {
    window.open(`/millionaire/${roomId}/presentation`, '_blank');
  };

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
    const channel = supabase.channel(`millionaire_game_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.phase?.includes('question') || payload.new.phase?.startsWith('special_')) {
          setSelectedChoice(null); setHiddenOptions([]); setShowTip(false); setDoubleChanceActive(false); setFirstWrongDone(false);
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

  if (loading || !room || !myPlayer) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  const isFirstPlace = players.sort((a, b) => b.current_value - a.current_value)[0]?.id === myPlayer.id;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      {/* Ranking Lateral */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Ranking do Lab</h3>
            <Users className="w-3 h-3 text-blue-400" />
          </div>
          <div className="p-4 space-y-3">
            {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
              <div key={p.id} className={cn(
                "flex items-center justify-between p-2 rounded-xl transition-all",
                p.is_eliminated ? "opacity-40 grayscale bg-red-500/5" : "bg-white/5",
                i < 3 && !p.is_eliminated && "ring-1 ring-yellow-500/30"
              )}>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarFallback className="bg-slate-800 text-[10px] font-black">{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={cn("text-[11px] font-bold", p.is_eliminated ? "text-slate-600 line-through" : "text-white")}>
                      {i === 0 && !p.is_eliminated && "👑 "}{p.name}
                    </span>
                    {p.is_eliminated && <span className="text-[7px] text-red-500 font-black uppercase">Eliminado</span>}
                  </div>
                </div>
                <span className="text-[10px] font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Painel de Ajudas */}
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Ajudas Disponíveis</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={use5050}
              disabled={used5050 || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated}
              className={cn(
                "flex flex-col h-16 gap-1 border-white/10",
                used5050 ? "opacity-30 grayscale" : "hover:bg-emerald-500/10 hover:border-emerald-500/30"
              )}
            >
              <Split className="w-4 h-4" />
              <span className="text-[8px] font-black">50/50</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={useDoubleChance}
              disabled={usedDouble || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated}
              className={cn(
                "flex flex-col h-16 gap-1 border-white/10",
                usedDouble ? "opacity-30 grayscale" : "hover:bg-blue-500/10 hover:border-blue-500/30"
              )}
            >
              <Repeat className="w-4 h-4" />
              <span className="text-[8px] font-black">DUPLA</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={useTipHelp}
              disabled={usedTip || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated}
              className={cn(
                "flex flex-col h-16 gap-1 border-white/10",
                usedTip ? "opacity-30 grayscale" : "hover:bg-yellow-500/10 hover:border-yellow-500/30"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-[8px] font-black">DICA</span>
            </Button>
          </div>
        </Card>

        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Prêmios Acumulativos</h3>
          </div>
          <div className="p-2 space-y-1">
            {PRIZES.map((prize, idx) => (
              <div key={idx} className={cn(
                "flex justify-between px-4 py-1 rounded-lg text-[10px] font-black",
                room.current_question_index === idx ? "bg-yellow-600 text-white" : "text-slate-500"
              )}>
                <span>Q{idx + 1}</span>
                <span>+ R$ {prize.toLocaleString()}</span>
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
            <span className="font-black text-white tracking-tight">SALA #{room.code}</span>
          </div>
          <div className="flex items-center gap-2">
            {room.host_id === currentUserId && (
              <Button variant="outline" size="sm" className="border-white/10 text-slate-400 hover:bg-white/5" onClick={openProjector}>
                <Monitor className="w-4 h-4 mr-2" /> PROJETOR
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400" onClick={() => navigate('/millionaire')}>
              <LogOut className="w-4 h-4 mr-2" /> SAIR
            </Button>
          </div>
        </div>

        {room.phase === 'waiting' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Sparkles className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
            <h2 className="text-4xl font-black text-white">Pronto para o Milhão?</h2>
            {room.host_id === currentUserId && (
              <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl">INICIAR DESAFIO</Button>
            )}
          </Card>
        ) : room.phase === 'special_malice' && selectedChoice === 'PICKING' ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <h2 className="text-3xl font-black text-white text-center">ESCOLHA SUA VÍTIMA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.filter(p => p.id !== myPlayer.id && !p.is_eliminated).map(p => (
                <Button 
                  key={p.id} 
                  onClick={() => handleMaliceElimination(p.id)}
                  className="h-24 bg-white/5 border-white/10 hover:bg-red-600/20 rounded-3xl flex items-center justify-between px-8"
                >
                  <div className="flex items-center gap-4">
                    <Avatar><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                    <div className="text-left">
                      <p className="font-black text-white">{p.name}</p>
                      <p className="text-xs text-yellow-500">R$ {p.current_value.toLocaleString()}</p>
                    </div>
                  </div>
                  <UserMinus className="text-red-500" />
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setSelectedChoice(null)} className="w-full text-slate-500">VOLTAR</Button>
          </div>
        ) : (room.phase?.includes('question') || room.phase?.startsWith('special_')) && room.phase !== 'reveal' ? (
          <div className="space-y-8">
            <Card className={cn(
              "rounded-[3rem] p-12 shadow-2xl relative overflow-hidden transition-all duration-1000",
              room.phase === 'special_professor' ? "bg-red-950/90 border-red-500/50" :
              room.phase === 'special_surprise' ? "bg-blue-950/90 border-blue-500/50" :
              room.phase === 'special_malice' ? "bg-purple-950/90 border-purple-500/50" :
              "bg-white/90 border-white/20"
            )}>
              {room.phase === 'special_professor' && <div className="absolute top-4 left-1/2 -translate-x-1/2 text-red-500 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">PERGUNTA PEGADINHA - ELIMINAÇÃO IMEDIATA</div>}
              {room.phase === 'special_surprise' && <div className="absolute top-4 left-1/2 -translate-x-1/2 text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">RODADA BÔNUS - ÚLTIMO LUGAR SERÁ ELIMINADO</div>}
              
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-orange-600/20 px-4 py-1.5 rounded-full border border-orange-500/30">
                <Timer className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-black text-lg">{timeLeft}s</span>
              </div>

              <h2 className={cn(
                "text-3xl md:text-5xl font-black text-center leading-tight tracking-tight mt-8",
                room.phase?.startsWith('special_') ? "text-white" : "text-slate-950"
              )}>
                {room.phase === 'special_malice' && !isFirstPlace ? "AGUARDE O LÍDER DECIDIR O DESTINO DO JOGO..." : currentQuestion.question}
              </h2>

              {showTip && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-600 font-bold text-center animate-in slide-in-from-top">
                  💡 DICA: {currentQuestion.tip}
                </div>
              )}
            </Card>

            {(room.phase !== 'special_malice' || isFirstPlace) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentQuestion.options).map(([key, val]) => val && (
                  <Button
                    key={key}
                    disabled={myPlayer.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)}
                    onClick={() => handleChoiceClick(key)}
                    className={cn(
                      "h-20 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8",
                      selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10",
                      hiddenOptions.includes(key) && "opacity-0 pointer-events-none"
                    )}
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                    {val}
                  </Button>
                ))}
              </div>
            )}

            {selectedChoice && !submitting && (
              <div className="flex justify-center">
                <Button onClick={submitAnswer} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-900/20">
                  CONFIRMAR DECISÃO
                </Button>
              </div>
            )}
          </div>
        ) : room.phase === 'reveal' ? (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl text-center">
              <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-4">Resposta Correta</h2>
              <div className="bg-emerald-500 text-white p-8 rounded-3xl text-4xl font-black shadow-xl">
                {currentQuestion.correct}: {currentQuestion.options[currentQuestion.correct as keyof typeof currentQuestion.options]}
              </div>
              <p className="mt-8 text-slate-600 font-medium italic">"{currentQuestion.explanation}"</p>
            </Card>
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            <Button onClick={() => navigate('/modes')} className="h-16 px-12 rounded-2xl font-black text-lg bg-yellow-600">VOLTAR AO MENU</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default MillionaireGame;