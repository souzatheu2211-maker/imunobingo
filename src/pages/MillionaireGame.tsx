"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/data/millionaireQuestions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MillionaireRanking from '@/components/MillionaireRanking';
import { 
  Trophy, Timer, Users, LogOut, Monitor, Sparkles, CheckCircle2, 
  Loader2, Send, Split, Lightbulb, Repeat, ShieldCheck, Ghost,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const PRIZES = [
  1000, 2000, 2500, 3000, 5000, 10000, 
  50000, 60000, 70000, 80000, 100000, 
  110000, 200000, 300000, 500000, 700000, 900000, 1000000
];

const CHECKPOINTS = [5, 10];

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
  const [scoreChange, setScoreChange] = useState<{ type: 'up' | 'down', value: number } | null>(null);
  
  const [used5050, setUsed5050] = useState(false);
  const [usedDouble, setUsedDouble] = useState(false);
  const [usedTip, setUsedTip] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [doubleChanceActive, setDoubleChanceActive] = useState(false);
  const [firstWrongDone, setFirstWrongDone] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevScoreRef = useRef<number>(0);
  
  const myPlayer = players.find(p => p.user_id === currentUserId);
  const currentQuestionId = room?.question_ids?.[room?.current_question_index];
  const currentQuestion = MILLIONAIRE_QUESTIONS.find(q => q.id === currentQuestionId) || MILLIONAIRE_QUESTIONS[0];
  
  const myAnswer = answers.find(a => 
    a.player_id === myPlayer?.id && 
    Number(a.question_index) === Number(room?.current_question_index)
  );

  // Monitora mudanças de pontuação para animação
  useEffect(() => {
    if (myPlayer) {
      if (myPlayer.current_value > prevScoreRef.current) {
        setScoreChange({ type: 'up', value: myPlayer.current_value - prevScoreRef.current });
        setTimeout(() => setScoreChange(null), 3000);
      } else if (myPlayer.current_value < prevScoreRef.current) {
        setScoreChange({ type: 'down', value: prevScoreRef.current - myPlayer.current_value });
        setTimeout(() => setScoreChange(null), 3000);
      }
      prevScoreRef.current = myPlayer.current_value;
    }
  }, [myPlayer?.current_value]);

  useEffect(() => {
    if (room?.phase === 'question' && room?.question_started_at) {
      const updateTimer = () => {
        if (!room) return;
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setTimeLeft(remaining);
        
        if (remaining === 0 && room?.host_id === currentUserId) {
          setTimeout(() => handleRevealPhase(), 2000);
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
    if (!room || room.host_id !== currentUserId) return;
    
    const { data: roundAnswers } = await supabase
      .from('millionaire_answers')
      .select('*')
      .eq('room_id', roomId)
      .eq('question_index', room.current_question_index);

    const sortedPlayers = [...players].sort((a, b) => b.current_value - a.current_value);
    const lastPlayer = sortedPlayers.filter(p => !p.is_eliminated).pop();

    for (const player of players) {
      if (player.is_eliminated) continue;
      
      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns ? playerAns.is_correct : false;
      
      let newValue = player.current_value;
      let eliminated = false;

      if (isCorrect) {
        if (currentQuestion.isAntibody) newValue += 40000;
        else if (!currentQuestion.isGreed) newValue += PRIZES[room.current_question_index];
      } else {
        if (currentQuestion.isProfessor) { 
          eliminated = true; 
          newValue = Math.max(0, player.current_value - 3000); 
        } else if (currentQuestion.isAntibody) {
          newValue = Math.max(0, player.current_value - 10000);
        } else {
          if (room.current_question_index < 6) newValue = Math.max(0, player.current_value - 2000);
          else if (room.current_question_index < 12) newValue = Math.max(0, player.current_value - 10000);
          else { 
            newValue = Math.max(0, player.current_value - 20000); 
            eliminated = true; 
          }
        }
      }
      
      if (currentQuestion.isAntibody && player.id === lastPlayer?.id) eliminated = true;

      await supabase.from('millionaire_players')
        .update({ 
          current_value: newValue, 
          is_eliminated: eliminated, 
          last_answered_index: room.current_question_index 
        })
        .eq('id', player.id);
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
        
        setSelectedChoice(null);
        setHiddenOptions([]);
        setShowTip(false);
        setDoubleChanceActive(false);
        setFirstWrongDone(false);
      }
    }, 5000);
  };

  const handleChoiceClick = (key: string) => {
    if (myPlayer?.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)) return;
    
    if (doubleChanceActive && key !== currentQuestion.correct && !firstWrongDone) {
      setFirstWrongDone(true);
      setHiddenOptions(prev => [...prev, key]);
      showError("Primeira chance errada! Você ainda tem mais uma.");
      return;
    }
    
    setSelectedChoice(key);
  };

  const submitAnswer = async () => {
    if (!selectedChoice) {
      showError("Selecione uma opção primeiro!");
      return;
    }

    if (!myPlayer) {
      showError("Aguarde a identificação do seu perfil...");
      return;
    }

    setSubmitting(true);
    try {
      const isCorrect = selectedChoice === currentQuestion.correct;
      
      const { error } = await supabase.from('millionaire_answers').insert({ 
        room_id: roomId, 
        player_id: myPlayer.id, 
        question_index: room.current_question_index, 
        answer: selectedChoice, 
        is_correct: isCorrect 
      });
      
      if (error) throw error;

      setAnswers(prev => [...prev, {
        player_id: myPlayer.id,
        question_index: room.current_question_index,
        answer: selectedChoice,
        is_correct: isCorrect
      }]);

      showSuccess("Resposta confirmada!");
    } catch (error: any) { 
      showError("Falha ao registrar resposta."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const startGame = async () => {
    if (!room || room.host_id !== currentUserId) return;
    
    const easy = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5);
    const medium = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5);
    const hard = MILLIONAIRE_QUESTIONS.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5);
    
    const profBonus = MILLIONAIRE_QUESTIONS.find(q => q.id === 'prof_bonus')!;
    const antibodyBonus = MILLIONAIRE_QUESTIONS.find(q => q.id === 'antibody_bonus')!;
    const greedTrap = MILLIONAIRE_QUESTIONS.find(q => q.id === 'greed_trap')!;

    const questionIds = [
      easy[0].id, easy[1].id, 
      profBonus.id,           
      easy[2].id, easy[3].id, easy[4].id, 
      antibodyBonus.id,       
      medium[0].id, medium[1].id, medium[2].id, medium[3].id, 
      greedTrap.id,           
      medium[4].id,           
      hard[0].id, hard[1].id, hard[2].id, hard[3].id, hard[4].id 
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        setCurrentUserId(user.id);
        
        const { data: roomData, error: roomError } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
        if (roomError || !roomData) return navigate('/millionaire');
        setRoom(roomData);
        
        const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
        const currentPlayers = playersData || [];
        setPlayers(currentPlayers);

        // Tenta encontrar ou criar o jogador
        let currentPlayer = currentPlayers.find(p => p.user_id === user.id);
        if (!currentPlayer) {
          const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
          const { data: newPlayer } = await supabase.from('millionaire_players').insert({
            room_id: roomId,
            user_id: user.id,
            name: profile?.full_name || 'Candidato',
            avatar_url: profile?.avatar_url,
            current_value: 0,
            is_eliminated: false
          }).select().single();
          
          if (newPlayer) {
            setPlayers(prev => [...prev, newPlayer]);
          }
        }
        
        const { data: answersData } = await supabase.from('millionaire_answers').select('*').eq('room_id', roomId);
        setAnswers(answersData || []);
      } catch (err) {
        console.error("Erro no setup:", err);
        showError("Erro ao carregar sala.");
      } finally {
        setLoading(false);
      }
    };
    
    setup();

    const channel = supabase.channel(`millionaire_realtime_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => {
            if (prev.some(p => p.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'millionaire_answers', filter: `room_id=eq.${roomId}` }, (payload) => setAnswers(prev => [...prev, payload.new]))
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6">
        <div className="relative">
          <div className="absolute -inset-4 bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-yellow-500 animate-spin relative" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-xs text-yellow-500 animate-pulse">Sincronizando Arena...</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Aguardando autorização do laboratório</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      {/* Ranking Lateral Estilo Show do Milhão */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Candidatos</h3>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{players.length} Online</span>
            </div>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="p-4">
            <MillionaireRanking players={players} currentUserId={currentUserId} />
          </div>
        </Card>

        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden hidden lg:block">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Prêmios Acumulativos</h3>
          </div>
          <div className="p-2 space-y-1">
            {[...PRIZES].reverse().map((prize, idx) => {
              const levelIdx = PRIZES.length - 1 - idx;
              const isCurrent = room.current_question_index === levelIdx;
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex justify-between px-4 py-1.5 rounded-xl text-[11px] font-black transition-all", 
                    isCurrent 
                      ? "bg-yellow-600 text-white scale-105 shadow-lg z-10" 
                      : CHECKPOINTS.includes(levelIdx) 
                        ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" 
                        : "text-slate-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{levelIdx + 1}</span>
                    {CHECKPOINTS.includes(levelIdx) && <ShieldCheck className="w-3 h-3" />}
                  </div>
                  <span>R$ {prize.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Área Principal do Jogo */}
      <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
        <div className="flex items-center justify-between bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
          {/* Animação de Pontos */}
          {scoreChange && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in duration-500",
              scoreChange.type === 'up' ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              <div className={cn(
                "flex items-center gap-2 text-2xl font-black",
                scoreChange.type === 'up' ? "text-emerald-400" : "text-red-400"
              )}>
                {scoreChange.type === 'up' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                {scoreChange.type === 'up' ? '+' : '-'} R$ {scoreChange.value.toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-2xl">
              <Trophy className="text-yellow-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Show do Milhão</h1>
              <p className="text-xl font-black text-white tracking-tight uppercase">IMUNOLOGIA</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {myPlayer?.is_eliminated && (
              <Badge className="bg-red-600/20 text-red-500 border-red-500/30 flex items-center gap-2 px-4 py-2 animate-pulse rounded-xl">
                <Ghost className="w-4 h-4" /> ESPECTADOR
              </Badge>
            )}
            {room.host_id === currentUserId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl h-11" 
                onClick={() => window.open(`/millionaire/${roomId}/presentation`, '_blank')}
              >
                <Monitor className="w-4 h-4 mr-2" /> PROJETOR
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 h-11 rounded-xl" onClick={() => navigate('/millionaire')}>
              <LogOut className="w-4 h-4 mr-2" /> SAIR
            </Button>
          </div>
        </div>

        {room.phase === 'waiting' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl border-t-white/20">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Pronto para o Milhão?</h2>
              <p className="text-slate-400 font-medium">Aguardando o host iniciar a sessão de perguntas.</p>
            </div>
            {room.host_id === currentUserId && (
              <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl shadow-2xl shadow-yellow-900/40 transition-all active:scale-95">
                INICIAR DESAFIO
              </Button>
            )}
          </Card>
        ) : room.phase === 'question' ? (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => { 
                  setUsed5050(true); 
                  const incorrect = Object.keys(currentQuestion.options).filter(k => k !== currentQuestion.correct); 
                  setHiddenOptions(incorrect.sort(() => Math.random() - 0.5).slice(0, 2)); 
                }} 
                disabled={used5050 || !!myAnswer || currentQuestion.difficulty === 'special' || myPlayer?.is_eliminated} 
                className={cn(
                  "h-14 px-8 rounded-2xl font-black flex items-center gap-2 transition-all", 
                  used5050 || currentQuestion.difficulty === 'special' ? "bg-slate-800 text-slate-600" : "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                )}
              >
                <Split className="w-5 h-5" /> 50/50
              </Button>
              <Button 
                onClick={() => { setUsedDouble(true); setDoubleChanceActive(true); }} 
                disabled={usedDouble || !!myAnswer || currentQuestion.difficulty === 'special' || myPlayer?.is_eliminated} 
                className={cn(
                  "h-14 px-8 rounded-2xl font-black flex items-center gap-2 transition-all", 
                  usedDouble || currentQuestion.difficulty === 'special' ? "bg-slate-800 text-slate-600" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                )}
              >
                <Repeat className="w-5 h-5" /> DUPLA CHANCE
              </Button>
              <Button 
                onClick={() => { setUsedTip(true); setShowTip(true); }} 
                disabled={usedTip || !!myAnswer || currentQuestion.difficulty === 'special' || myPlayer?.is_eliminated} 
                className={cn(
                  "h-14 px-8 rounded-2xl font-black flex items-center gap-2 transition-all", 
                  usedTip || currentQuestion.difficulty === 'special' ? "bg-slate-800 text-slate-600" : "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                )}
              >
                <Lightbulb className="w-5 h-5" /> DICA
              </Button>
            </div>

            {showTip && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-emerald-400 text-center font-bold italic animate-in slide-in-from-top duration-500">
                <Sparkles className="w-4 h-4 inline mr-2" /> "{currentQuestion.tip}"
              </div>
            )}

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
              <div className="absolute top-4 right-8 flex items-center gap-2 bg-orange-600/20 px-5 py-2 rounded-full border border-orange-500/30">
                <Timer className="w-5 h-5 text-orange-600" />
                <span className="text-orange-600 font-black text-xl tabular-nums">{timeLeft}s</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight mt-4 tracking-tight">
                {currentQuestion.question}
              </h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion.options).map(([key, val]) => (
                <Button 
                  key={key} 
                  disabled={myPlayer?.is_eliminated || !!myAnswer || submitting || hiddenOptions.includes(key)} 
                  onClick={() => handleChoiceClick(key)} 
                  className={cn(
                    "h-24 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8", 
                    myAnswer?.answer === key ? "bg-yellow-600 border-yellow-400 text-white" : 
                    selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" : 
                    hiddenOptions.includes(key) ? "opacity-0 pointer-events-none" : 
                    "bg-white/5 border-white/10 text-white hover:bg-white/10", 
                    myPlayer?.is_eliminated && "opacity-60"
                  )}
                >
                  <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mr-5 text-base">{key}</span>
                  {val}
                </Button>
              ))}
            </div>

            {!myAnswer && !myPlayer?.is_eliminated && (
              <div className="flex justify-center">
                <Button 
                  onClick={submitAnswer} 
                  disabled={!selectedChoice || submitting} 
                  className="h-20 px-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2rem] text-xl shadow-2xl shadow-emerald-900/40 transition-all active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin mr-3 w-6 h-6" /> : <Send className="mr-3 w-6 h-6" />}
                  CONFIRMAR RESPOSTA
                </Button>
              </div>
            )}
            
            {myAnswer && (
              <div className="flex justify-center">
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-10 py-5 rounded-[2rem] text-xl font-black animate-pulse">
                  <CheckCircle2 className="mr-3 w-7 h-7" /> RESPOSTA REGISTRADA
                </Badge>
              </div>
            )}
          </div>
        ) : room.phase === 'reveal' ? (
          <div className="space-y-8 animate-in zoom-in duration-700">
            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl text-center">
              <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-6">Resposta Correta</h2>
              <div className="bg-emerald-500 text-white p-10 rounded-[2.5rem] text-4xl md:text-5xl font-black shadow-2xl shadow-emerald-900/20">
                {currentQuestion.correct}: {currentQuestion.options[currentQuestion.correct as keyof typeof currentQuestion.options]}
              </div>
              <div className="mt-10 p-8 bg-slate-100 rounded-3xl border border-slate-200">
                <p className="text-slate-700 text-lg font-bold italic leading-relaxed">
                  "{currentQuestion.explanation}"
                </p>
              </div>
            </Card>
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-10 backdrop-blur-2xl border-t-white/20">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
              <p className="text-slate-400 text-xl font-medium">Confira o ranking final dos imunologistas.</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <MillionaireRanking players={players} currentUserId={currentUserId} />
            </div>
            <Button onClick={() => navigate('/modes')} variant="outline" className="h-16 px-12 rounded-2xl font-black text-lg border-white/10 hover:bg-white/5">
              VOLTAR AO MENU
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default MillionaireGame;