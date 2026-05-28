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
  Trophy, Timer, Users, LogOut, Monitor, Sparkles, CheckCircle2,
  Zap, Loader2, Send, XCircle, Ghost, AlertCircle, Lightbulb,
  Repeat, ShieldCheck, HandMetal, Coins, Skull, UserMinus, HeartOff
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

  // Pergunta da Maldade
  const [maliceTargetId, setMaliceTargetId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  // Lógica de Sequência de Perguntas
  const getQuestionAt = (index: number) => {
    if (!room?.question_ids) return null;
    const qId = room.question_ids[index];
    if (qId === 'MALICE_ROUND') return { id: 'MALICE_ROUND', is_special: true, special_type: 'malice' } as any;
    return MILLIONAIRE_QUESTIONS.find(q => q.id === qId);
  };

  const currentQuestion = getQuestionAt(room?.current_question_index || 0);
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index);

  useEffect(() => {
    if (room?.phase === 'question' && room?.question_started_at && currentQuestion?.id !== 'MALICE_ROUND') {
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
  }, [room?.phase, room?.question_started_at, room?.host_id, currentUserId, currentQuestion?.id]);

  const handleRevealPhase = async () => {
    if (room.host_id !== currentUserId) return;

    const { data: roundAnswers } = await supabase
      .from('millionaire_answers')
      .select('*')
      .eq('room_id', roomId)
      .eq('question_index', room.current_question_index);

    const sortedPlayers = [...players].sort((a, b) => b.current_value - a.current_value);
    const lastPlaceId = sortedPlayers[sortedPlayers.length - 1]?.id;

    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      
      let newValue = player.current_value;
      let eliminated = false;

      // Lógica de Pontuação e Penalidade
      if (currentQuestion?.special_type === 'professor') {
        if (isCorrect) newValue += (room.current_question_index + 1) * 1000;
        else { newValue = Math.max(0, newValue - 3000); eliminated = true; }
      } else if (currentQuestion?.special_type === 'surprise') {
        if (isCorrect) newValue += 40000;
        else newValue = Math.max(0, newValue - 10000);
        // Eliminação do último colocado após a rodada surpresa
        if (player.id === lastPlaceId) eliminated = true;
      } else {
        // Rodada Normal
        if (isCorrect) {
          newValue += (room.current_question_index + 1) * 1000;
        } else {
          if (room.current_question_index < 5) newValue = Math.max(0, newValue - 2000);
          else if (room.current_question_index < 10) newValue = Math.max(0, newValue - 10000);
          else { newValue = Math.max(0, newValue - 20000); eliminated = true; }
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

      const nextIndex = room.current_question_index + 1;
      
      if (!activePlayers || activePlayers.length === 0 || nextIndex >= room.question_ids.length) {
        await supabase.from('millionaire_rooms').update({ phase: 'finished', status: 'finished' }).eq('id', roomId);
        confetti();
      } else {
        await supabase.from('millionaire_rooms').update({
          current_question_index: nextIndex,
          phase: 'question',
          question_started_at: new Date().toISOString()
        }).eq('id', roomId);
      }
    }, 5000);
  };

  const handleMaliceDecision = async (decision: 'SIM' | 'NÃO') => {
    if (decision === 'NÃO') {
      if (room.host_id === currentUserId) {
        await supabase.from('millionaire_rooms').update({
          current_question_index: room.current_question_index + 1,
          phase: 'question',
          question_started_at: new Date().toISOString()
        }).eq('id', roomId);
      }
      return;
    }

    if (!maliceTargetId) return showError("Escolha um alvo primeiro!");

    // PEGADINHA: O 1º lugar é eliminado e o dinheiro vai para o alvo
    const targetPlayer = players.find(p => p.id === maliceTargetId);
    const firstPlacePlayer = players.sort((a, b) => b.current_value - a.current_value)[0];

    await supabase.from('millionaire_players').update({
      current_value: targetPlayer.current_value + firstPlacePlayer.current_value,
    }).eq('id', targetPlayer.id);

    await supabase.from('millionaire_players').update({
      current_value: 0,
      is_eliminated: true
    }).eq('id', firstPlacePlayer.id);

    showError("NÃO SEJA GANANCIOSO. UM CORPO NÃO FUNCIONA SOZINHO.");
    
    if (room.host_id === currentUserId) {
      setTimeout(async () => {
        await supabase.from('millionaire_rooms').update({
          current_question_index: room.current_question_index + 1,
          phase: 'question',
          question_started_at: new Date().toISOString()
        }).eq('id', roomId);
      }, 5000);
    }
  };

  const submitAnswer = async () => {
    if (!selectedChoice || myPlayer?.is_eliminated || room?.phase !== 'question' || myAnswer) return;
    setSubmitting(true);
    const isCorrect = selectedChoice === currentQuestion.correct;
    try {
      await supabase.from('millionaire_answers').insert({
        room_id: roomId,
        player_id: myPlayer.id,
        question_index: room.current_question_index,
        answer: selectedChoice,
        is_correct: isCorrect
      });
      showSuccess("Resposta enviada!");
    } catch (error) {
      showError("Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const startGame = async () => {
    if (room.host_id !== currentUserId) return;

    const easy = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'easy' && !q.is_special).sort(() => Math.random() - 0.5).slice(0, 5);
    const medium = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'medium' && !q.is_special).sort(() => Math.random() - 0.5).slice(0, 5);
    const hard = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'hard' && !q.is_special).sort(() => Math.random() - 0.5).slice(0, 5);
    
    const prof = MILLIONAIRE_QUESTIONS.find(q => q.special_type === 'professor')?.id;
    const surp = MILLIONAIRE_QUESTIONS.find(q => q.special_type === 'surprise')?.id;

    // Ordem: q1, q2, PROFESSOR, q3, q4, q5, SURPRESA, q6, q7, q8, q9, MALDADE, q10, q11, q12, q13, q14, q15
    const questionIds = [
      easy[0].id, easy[1].id, prof!, 
      easy[2].id, easy[3].id, easy[4].id, surp!,
      medium[0].id, medium[1].id, medium[2].id, medium[3].id, 'MALICE_ROUND',
      medium[4].id, hard[0].id, hard[1].id, hard[2].id, hard[3].id, hard[4].id
    ];

    await supabase.from('millionaire_rooms').update({
      status: 'playing',
      phase: 'question',
      current_question_index: 0,
      question_ids: questionIds,
      question_started_at: new Date().toISOString()
    }).eq('id', roomId);
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
    const channel = supabase.channel(`millionaire_realtime_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.phase === 'question') {
          setSelectedChoice(null);
          setHiddenOptions([]);
          setShowTip(false);
          setDoubleChanceActive(false);
          setFirstWrongDone(false);
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
  const isSpecialRound = currentQuestion?.is_special;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      {/* Ranking Lateral com Avatares */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Ranking Realtime</h3>
            <Users className="w-3 h-3 text-blue-400" />
          </div>
          <div className="p-4 space-y-3">
            {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
              <div key={p.id} className={cn(
                "flex items-center justify-between p-2 rounded-xl transition-all duration-500",
                p.is_eliminated ? "bg-red-500/5 opacity-50 grayscale" : "bg-white/5 hover:bg-white/10"
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 w-4">{i + 1}º</span>
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarFallback className="bg-slate-800 text-[10px] font-black">{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-bold", p.is_eliminated ? "line-through" : "text-white")}>{p.name}</span>
                    {p.is_eliminated && <span className="text-[7px] text-red-500 font-black uppercase">Eliminado</span>}
                  </div>
                </div>
                <span className="text-[10px] font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</span>
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
          <div className="flex items-center gap-4">
            {isSpecialRound && (
              <Badge className="bg-red-600/20 text-red-500 border-red-500/30 animate-pulse px-3 py-1 font-black text-[10px]">
                RODADA ESPECIAL: AJUDAS BLOQUEADAS
              </Badge>
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
              <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl">
                INICIAR DESAFIO
              </Button>
            )}
          </Card>
        ) : currentQuestion?.id === 'MALICE_ROUND' ? (
          <div className="space-y-8 animate-in zoom-in duration-700">
            <Card className="bg-red-600/10 border-red-500/30 rounded-[3rem] p-12 text-center space-y-6">
              <Skull className="w-20 h-20 text-red-500 mx-auto animate-bounce" />
              <h2 className="text-4xl font-black text-white">RODADA DA MALDADE</h2>
              
              {isFirstPlace ? (
                <div className="space-y-8">
                  <p className="text-2xl font-bold text-slate-300">"O quão ganancioso você é? Você pode eliminar uma pessoa e receber todo o valor dela."</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {players.filter(p => p.id !== myPlayer.id && !p.is_eliminated).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setMaliceTargetId(p.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                          maliceTargetId === p.id ? "bg-red-600 border-red-400 text-white" : "bg-white/5 border-white/10 text-slate-400"
                        )}
                      >
                        <Avatar><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                        <div className="text-left">
                          <p className="font-black">{p.name}</p>
                          <p className="text-xs">R$ {p.current_value.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => handleMaliceDecision('SIM')} className="bg-red-600 hover:bg-red-500 font-black px-12 h-16 rounded-2xl">SIM, ELIMINAR</Button>
                    <Button onClick={() => handleMaliceDecision('NÃO')} variant="outline" className="border-white/10 font-black px-12 h-16 rounded-2xl">NÃO, CONTINUAR</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xl text-slate-400">O líder está decidindo o destino de alguém...</p>
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                </div>
              )}
            </Card>
          </div>
        ) : room.phase === 'question' ? (
          <div className="space-y-8">
            {/* Ajudas */}
            {!myPlayer.is_eliminated && (
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={use5050} disabled={used5050 || !!myAnswer || isSpecialRound} className={cn("h-14 px-6 rounded-2xl font-black", used5050 || isSpecialRound ? "bg-slate-800 opacity-50" : "bg-violet-600")}>50/50</Button>
                <Button onClick={useDoubleChance} disabled={usedDouble || !!myAnswer || isSpecialRound} className={cn("h-14 px-6 rounded-2xl font-black", usedDouble || isSpecialRound ? "bg-slate-800 opacity-50" : "bg-blue-600")}>DUPLA CHANCE</Button>
                <Button onClick={useTip} disabled={usedTip || !!myAnswer || isSpecialRound} className={cn("h-14 px-6 rounded-2xl font-black", usedTip || isSpecialRound ? "bg-slate-800 opacity-50" : "bg-emerald-600")}>DICA</Button>
              </div>
            )}

            {currentQuestion?.special_type === 'surprise' && (
              <div className="bg-yellow-500/20 border border-yellow-500/40 p-6 rounded-3xl text-center animate-pulse">
                <p className="text-yellow-500 font-black uppercase tracking-widest">ATENÇÃO: Rodada bônus surpresa! O último colocado será eliminado.</p>
              </div>
            )}

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative">
              <div className="absolute top-4 right-8 flex items-center gap-2 bg-orange-600/20 px-4 py-1.5 rounded-full">
                <Timer className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-black text-lg">{timeLeft}s</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight">{currentQuestion?.question}</h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion?.options || {}).map(([key, val]) => (
                <Button
                  key={key}
                  disabled={myPlayer.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)}
                  onClick={() => setSelectedChoice(key)}
                  className={cn(
                    "h-20 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8",
                    selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white",
                    hiddenOptions.includes(key) && "opacity-0 pointer-events-none"
                  )}
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                  {val as string}
                </Button>
              ))}
            </div>

            {!myAnswer && !myPlayer.is_eliminated && (
              <div className="flex justify-center">
                <Button onClick={submitAnswer} disabled={!selectedChoice || submitting} className="h-16 px-12 bg-emerald-600 font-black rounded-2xl text-lg">CONFIRMAR</Button>
              </div>
            )}
          </div>
        ) : room.phase === 'reveal' ? (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl text-center">
              <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-4">Resposta Correta</h2>
              <div className="bg-emerald-500 text-white p-8 rounded-3xl text-4xl font-black">{currentQuestion?.correct}: {currentQuestion?.options[currentQuestion?.correct as keyof typeof currentQuestion.options]}</div>
              <p className="mt-8 text-slate-600 font-medium italic">"{currentQuestion?.explanation}"</p>
            </Card>
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            <div className="max-w-md mx-auto space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn("flex items-center justify-between p-6 rounded-3xl border", i === 0 ? "bg-yellow-600/20 border-yellow-500" : "bg-white/5 border-white/10")}>
                  <span className="font-black text-white text-xl">{i + 1}º {p.name}</span>
                  <span className="text-yellow-500 font-black text-xl">R$ {p.current_value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/modes')} className="h-16 px-12 rounded-2xl font-black text-lg">VOLTAR AO MENU</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default MillionaireGame;