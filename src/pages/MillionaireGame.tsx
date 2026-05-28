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
  UserMinus,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Clock
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
  const [processingResults, setProcessingResults] = useState(false);
  
  const [used5050, setUsed5050] = useState(false);
  const [usedDouble, setUsedDouble] = useState(false);
  const [usedTip, setUsedTip] = useState(false);
  const [helpUsedThisRound, setHelpUsedThisRound] = useState(false);
  
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [doubleChanceActive, setDoubleChanceActive] = useState(false);
  const [firstWrongDone, setFirstWrongDone] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  const getActiveQuestion = () => {
    if (!room) return MILLIONAIRE_QUESTIONS[0];

    const isProfessor = room.phase === 'special_professor' || room.phase === 'reveal_special_professor';
    const isSurprise = room.phase === 'special_surprise' || room.phase === 'reveal_special_surprise';
    const isMalice = room.phase === 'special_malice' || room.phase === 'reveal_special_malice';

    if (isProfessor) return SPECIAL_QUESTIONS.professor;
    if (isSurprise) return SPECIAL_QUESTIONS.surprise;
    if (isMalice) return {
      id: 'malice',
      difficulty: 'special',
      question: "O quão ganancioso você é? Você pode eliminar uma pessoa do jogo e receber todo valor dela pra subir ainda mais no jogo, deseja eliminar alguém?",
      options: { A: "SIM", B: "NÃO", C: "", D: "" },
      correct: "B",
      explanation: "NÃO SEJA GANANCIOSO. UM CORPO NÃO FUNCIONA SOZINHO SEM O TRABALHO EM CONJUNTO DE TODAS AS CÉLULAS.",
      tip: ""
    } as MillionaireQuestion;

    const currentQuestionId = room.question_ids?.[room.current_question_index];
    return MILLIONAIRE_QUESTIONS.find(q => q.id === currentQuestionId) || MILLIONAIRE_QUESTIONS[0];
  };

  const currentQuestion = getActiveQuestion();
  const isSpecialPhase = room?.phase?.startsWith('special_');
  
  const myAnswer = answers.find(a => 
    a.player_id === myPlayer?.id && 
    a.question_index === room?.current_question_index && 
    (a.phase === room?.phase || a.phase?.replace('reveal_', '') === room?.phase?.replace('reveal_', ''))
  );

  useEffect(() => {
    if (room?.phase?.includes('question') || room?.phase?.startsWith('special_')) {
      const updateTimer = () => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0 && room.host_id === currentUserId && !room.phase.startsWith('reveal') && !processingResults) {
          setProcessingResults(true);
          console.log("[HOST] Tempo esgotado. Iniciando processamento em 3s...");
          setTimeout(() => handleRevealPhase(), 3000);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProcessingResults(false);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.phase, room?.question_started_at, room?.host_id, currentUserId, processingResults]);

  const handleRevealPhase = async () => {
    if (room.host_id !== currentUserId) return;

    const currentPhase = room.phase;
    const qIndex = room.current_question_index;
    const isSpecial = currentPhase.startsWith('special_');
    let roundQuestion: any = currentQuestion;

    console.log(`[HOST] --- PROCESSANDO RODADA ${qIndex} ---`);

    // Busca TODAS as respostas da rodada atual para garantir que nada escape
    const { data: roundAnswers, error: fetchError } = await supabase
      .from('millionaire_answers')
      .select('*')
      .eq('room_id', roomId)
      .eq('question_index', qIndex);

    if (fetchError) {
      console.error("[HOST] Erro ao buscar respostas:", fetchError);
      return;
    }

    const { data: currentPlayersData } = await supabase
      .from('millionaire_players')
      .select('*')
      .eq('room_id', roomId);

    if (!currentPlayersData) return;

    for (const player of currentPlayersData) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      
      // Comparação ultra-segura
      const pChoice = (playerAns?.answer || "").trim().toUpperCase();
      const cChoice = (roundQuestion.correct || "").trim().toUpperCase();
      const isCorrect = pChoice === cChoice && pChoice !== "";

      console.log(`[HOST] Jogador: ${player.name} | Resposta: ${pChoice} | Correto: ${cChoice} | Veredito: ${isCorrect}`);

      if (playerAns) {
        await supabase.from('millionaire_answers').update({ is_correct: isCorrect }).eq('id', playerAns.id);
      }
      
      let newValue = player.current_value;
      let eliminated = false;

      if (currentPhase === 'special_professor') {
        if (isCorrect) newValue += 10000;
        else { newValue = Math.max(0, newValue - 3000); eliminated = true; }
      } else if (currentPhase === 'special_surprise') {
        if (isCorrect) newValue += 40000;
        else newValue = Math.max(0, newValue - 10000);
      } else if (currentPhase === 'question') {
        if (isCorrect) newValue += PRIZES[qIndex];
        else {
          if (qIndex < 4) newValue = Math.max(0, newValue - 2000);
          else if (qIndex < 9) newValue = Math.max(0, newValue - 10000);
          else { newValue = Math.max(0, newValue - 20000); eliminated = true; }
        }
      }

      await supabase.from('millionaire_players').update({
        current_value: newValue,
        is_eliminated: eliminated,
        last_answered_index: qIndex
      }).eq('id', player.id);
    }

    if (currentPhase === 'special_surprise') {
      const { data: activePlayersAfterUpdate } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_eliminated', false)
        .order('current_value', { ascending: true });
      
      if (activePlayersAfterUpdate && activePlayersAfterUpdate.length > 1) {
        await supabase.from('millionaire_players').update({ is_eliminated: true }).eq('id', activePlayersAfterUpdate[0].id);
      }
    }

    await supabase.from('millionaire_rooms').update({ 
      phase: isSpecial ? `reveal_${currentPhase}` : 'reveal' 
    }).eq('id', roomId);

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
      let nextIndex = qIndex;

      if (currentPhase === 'special_professor') nextIndex = 2;
      else if (currentPhase === 'special_surprise') nextIndex = 5;
      else if (currentPhase === 'special_malice') nextIndex = 9;
      else {
        if (qIndex === 1) nextPhase = 'special_professor';
        else if (qIndex === 4) nextPhase = 'special_surprise';
        else if (qIndex === 8) nextPhase = 'special_malice';
        else {
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
    }, 7000);
  };

  const submitAnswer = async () => {
    if (!selectedChoice || myPlayer?.is_eliminated || !!myAnswer || submitting) return;
    setSubmitting(true);

    const pChoice = selectedChoice.trim().toUpperCase();
    const cChoice = currentQuestion.correct.trim().toUpperCase();
    const isCorrect = pChoice === cChoice;

    console.log(`[PLAYER] Enviando: ${pChoice} | Correto: ${cChoice}`);

    try {
      if (room.phase === 'special_malice') {
        if (selectedChoice === 'A') {
          setSelectedChoice('PICKING');
          setSubmitting(false);
        } else {
          const { error } = await supabase.from('millionaire_answers').insert({
            room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
            answer: 'B', is_correct: true, phase: room.phase
          });
          if (error) throw error;
          showSuccess("Você escolheu a humildade!");
        }
      } else {
        const { error } = await supabase.from('millionaire_answers').insert({
          room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
          answer: pChoice, is_correct: isCorrect, phase: room.phase
        });
        if (error) throw error;
        showSuccess("Resposta salva no laboratório!");
      }
    } catch (error: any) {
      console.error("[PLAYER] Erro ao salvar:", error);
      showError("Falha na conexão: " + error.message);
      setSubmitting(false);
    }
  };

  const handleMaliceElimination = async (targetId: string) => {
    const target = players.find(p => p.id === targetId);
    if (!target) return;

    const confirmed = window.confirm(`Tem certeza que deseja eliminar ${target.name} e roubar seus R$ ${target.current_value.toLocaleString()}?`);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await supabase.from('millionaire_players').update({ is_eliminated: true, current_value: 0 }).eq('id', target.id);
      await supabase.from('millionaire_players').update({ current_value: target.current_value + myPlayer.current_value }).eq('id', myPlayer.id);
      
      await supabase.from('millionaire_answers').insert({
        room_id: roomId, player_id: myPlayer.id, question_index: room.current_question_index,
        answer: 'A', is_correct: false, phase: room.phase
      });

      showError("A GANÂNCIA TE DESTRUIU!");
    } catch (e) {
      showError("Erro na transação.");
      setSubmitting(false);
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
        if (payload.new.phase === 'question' || payload.new.phase.startsWith('special_')) {
          setSelectedChoice(null); 
          setHiddenOptions([]); 
          setShowTip(false); 
          setDoubleChanceActive(false); 
          setFirstWrongDone(false);
          setHelpUsedThisRound(false);
          setSubmitting(false);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_answers', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAnswers(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setAnswers(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  if (loading || !room || !myPlayer) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  const isFirstPlace = players.sort((a, b) => b.current_value - a.current_value)[0]?.id === myPlayer.id;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
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

        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Ajudas Disponíveis</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => { if (!helpUsedThisRound && !used5050 && !isSpecialPhase && !myAnswer) {
                const wrongOptions = Object.keys(currentQuestion.options).filter(key => key !== currentQuestion.correct && currentQuestion.options[key as keyof typeof currentQuestion.options]);
                const toHide = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
                setHiddenOptions(toHide);
                setUsed5050(true);
                setHelpUsedThisRound(true);
                showSuccess("50/50 Ativado!");
              }}}
              disabled={helpUsedThisRound || used5050 || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated || submitting}
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
              onClick={() => { if (!helpUsedThisRound && !usedDouble && !isSpecialPhase && !myAnswer) {
                setDoubleChanceActive(true);
                setUsedDouble(true);
                setHelpUsedThisRound(true);
                showSuccess("Dupla Chance Ativada!");
              }}}
              disabled={helpUsedThisRound || usedDouble || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated || submitting}
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
              onClick={() => { if (!helpUsedThisRound && !usedTip && !isSpecialPhase && !myAnswer) {
                setShowTip(true);
                setUsedTip(true);
                setHelpUsedThisRound(true);
                showSuccess("Dica Revelada!");
              }}}
              disabled={helpUsedThisRound || usedTip || isSpecialPhase || !!myAnswer || myPlayer.is_eliminated || submitting}
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
                  disabled={submitting}
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
        ) : (room.phase === 'question' || room.phase.startsWith('special_')) ? (
          <div className="space-y-8">
            <Card className={cn(
              "rounded-[3rem] p-12 shadow-2xl relative overflow-hidden transition-all duration-1000",
              room.phase === 'special_professor' ? "bg-red-950/90 border-red-500/50 animate-pulse" :
              room.phase === 'special_surprise' ? "bg-blue-950/90 border-blue-500/50" :
              room.phase === 'special_malice' ? "bg-purple-950/90 border-purple-500/50" :
              "bg-white/90 border-white/20"
            )}>
              {room.phase === 'special_professor' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.3em]">
                  <ShieldAlert className="w-4 h-4" /> Eliminação Imediata em caso de Erro
                </div>
              )}
              {room.phase === 'special_surprise' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
                  <Skull className="w-4 h-4" /> O último do ranking será eliminado
                </div>
              )}

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
                      (selectedChoice === key || myAnswer?.answer === key) ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10",
                      hiddenOptions.includes(key) && "opacity-0 pointer-events-none"
                    )}
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                    {val}
                  </Button>
                ))}
              </div>
            )}

            {selectedChoice && !submitting && !myAnswer && (
              <div className="flex justify-center">
                <Button onClick={submitAnswer} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-900/20">
                  CONFIRMAR DECISÃO
                </Button>
              </div>
            )}

            {(submitting || !!myAnswer) && (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5" /> Resposta Registrada
                </div>
                <p className="text-slate-500 text-xs font-bold">Aguardando processamento do laboratório...</p>
              </div>
            )}
          </div>
        ) : room.phase.startsWith('reveal') ? (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resposta Correta Global */}
              <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl text-center flex flex-col justify-center">
                <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-4">Resposta Correta</h2>
                <div className="bg-emerald-500 text-white p-8 rounded-3xl text-4xl font-black shadow-xl">
                  {currentQuestion.correct}: {currentQuestion.options[currentQuestion.correct as keyof typeof currentQuestion.options]}
                </div>
                <p className="mt-8 text-slate-600 font-medium italic">"{currentQuestion.explanation}"</p>
              </Card>

              {/* Veredito Individual */}
              <Card className={cn(
                "rounded-[3rem] p-12 shadow-2xl text-center flex flex-col items-center justify-center border-4",
                myAnswer?.is_correct ? "bg-emerald-950/90 border-emerald-500" : "bg-red-950/90 border-red-500"
              )}>
                {myAnswer?.is_correct ? (
                  <>
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
                    <h2 className="text-4xl font-black text-white mb-2">VOCÊ ACERTOU!</h2>
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-2xl">
                      <TrendingUp className="w-6 h-6" /> + R$ {PRIZES[room.current_question_index].toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-4xl font-black text-white mb-2">VOCÊ ERROU!</h2>
                    <div className="flex items-center gap-2 text-red-400 font-black text-2xl">
                      <TrendingDown className="w-6 h-6" /> Penalidade Aplicada
                    </div>
                    {myPlayer.is_eliminated && (
                      <Badge variant="destructive" className="mt-4 px-6 py-2 text-lg font-black rounded-full">ELIMINADO</Badge>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            <div className="max-w-md mx-auto space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="font-black text-white">{i + 1}º {p.name}</span>
                  <span className="text-yellow-500 font-black">R$ {p.current_value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/modes')} className="h-16 px-12 rounded-2xl font-black text-lg bg-yellow-600">VOLTAR AO MENU</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default MillionaireGame;