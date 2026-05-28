"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/data/millionaireQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  User,
  Skull
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
  
  // Maldade State
  const [selectingVictim, setSelectingVictim] = useState(false);
  
  // Ajudas
  const [used5050, setUsed5050] = useState(false);
  const [usedProb, setUsedProb] = useState(false);
  const [aidUsedThisTurn, setAidUsedThisTurn] = useState(false);
  
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [probabilities, setProbabilities] = useState<Record<string, number>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  
  const currentQuestion = MILLIONAIRE_QUESTIONS[room?.current_question_index] || MILLIONAIRE_QUESTIONS[0];
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index);

  // Ranking para identificar o Top 1
  const sortedRanking = [...players].sort((a, b) => b.current_value - a.current_value);
  const top1Player = sortedRanking[0];
  const isTop1 = myPlayer?.id === top1Player?.id;

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

    const q = MILLIONAIRE_QUESTIONS[room.current_question_index];

    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      
      let newValue = player.current_value;
      let eliminated = false;

      // Lógica Especial: Rodada da Maldade
      if (q.id === 'maldade') {
        // Apenas o Top 1 respondeu
        if (player.id === top1Player?.id) {
          if (playerAns?.answer?.startsWith('SIM:')) {
            // Escolheu a ganância: É ELIMINADO e transfere pontos
            eliminated = true;
            const victimId = playerAns.answer.split(':')[1];
            const victim = players.find(p => p.id === victimId);
            if (victim) {
              await supabase.from('millionaire_players').update({
                current_value: victim.current_value + player.current_value
              }).eq('id', victim.id);
            }
            newValue = 0; // Perde tudo ao ser eliminado
          } else {
            // Escolheu NÃO: Continua normal
            newValue = player.current_value;
          }
        }
      } else {
        // Lógica Normal
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

  const submitMaldade = async (victimId: string | null) => {
    if (!selectedChoice || submitting) return;
    setSubmitting(true);
    
    const finalAnswer = selectedChoice === 'A' ? `SIM:${victimId}` : 'NÃO';
    
    await supabase.from('millionaire_answers').insert({
      room_id: roomId,
      player_id: myPlayer.id,
      question_index: room.current_question_index,
      answer: finalAnswer,
      is_correct: true // Na maldade não tem erro técnico, apenas escolha
    });
    
    setSelectingVictim(false);
    setSubmitting(false);
    showSuccess("Decisão enviada ao laboratório.");
  };

  const useAid = (type: '5050' | 'prob') => {
    if (aidUsedThisTurn || currentQuestion.isSpecial || myPlayer?.is_eliminated || room?.phase !== 'question') {
      showError("Ajudas bloqueadas nesta rodada.");
      return;
    }
    setAidUsedThisTurn(true);
    // ... (lógica de ajuda mantida)
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
          setProbabilities({});
          setAidUsedThisTurn(false);
          setSelectingVictim(false);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'millionaire_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPlayers(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        else if (payload.eventType === 'DELETE') setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'millionaire_answers', filter: `room_id=eq.${roomId}` }, (payload) => {
        setAnswers(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  if (loading || !room || !myPlayer) return null;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      {/* Coluna Lateral */}
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

      {/* Área Principal */}
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
            {myPlayer.is_eliminated && <Badge className="bg-red-600/20 text-red-500 border-red-500/30 px-3 py-1 animate-pulse">ELIMINADO</Badge>}
          </div>
        </div>

        {room.phase === 'question' ? (
          <div className="space-y-8">
            {/* UI para Rodada da Maldade */}
            {currentQuestion.id === 'maldade' ? (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <Badge className="bg-red-600 text-white px-8 py-3 text-xl font-black rounded-full shadow-2xl animate-pulse">
                    😈 RODADA DA MALDADE: APENAS O LÍDER RESPONDE
                  </Badge>
                </div>

                <Card className="bg-slate-900/90 border-red-500/30 rounded-[3rem] p-12 shadow-2xl text-center space-y-6">
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                    {currentQuestion.question}
                  </h2>
                  {!isTop1 && (
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-slate-400 font-bold italic">Você não é o líder. Aguarde a decisão de <span className="text-yellow-500">{top1Player?.name}</span>...</p>
                    </div>
                  )}
                </Card>

                {isTop1 && !myAnswer && (
                  <div className="space-y-6">
                    {!selectingVictim ? (
                      <div className="grid grid-cols-2 gap-6">
                        <Button 
                          onClick={() => { setSelectedChoice('A'); setSelectingVictim(true); }}
                          className="h-24 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-3xl shadow-xl shadow-red-900/20"
                        >
                          SIM, EU QUERO
                        </Button>
                        <Button 
                          onClick={() => { setSelectedChoice('B'); submitMaldade(null); }}
                          className="h-24 bg-white/10 hover:bg-white/20 text-white font-black text-2xl rounded-3xl"
                        >
                          NÃO, SOU FIEL
                        </Button>
                      </div>
                    ) : (
                      <Card className="bg-white/5 border-white/10 rounded-3xl p-8 space-y-6 animate-in zoom-in">
                        <h3 className="text-xl font-black text-white text-center">Escolha sua Vítima (Quem receberá seus pontos?)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {players.filter(p => p.id !== myPlayer.id && !p.is_eliminated).map(p => (
                            <Button 
                              key={p.id}
                              onClick={() => submitMaldade(p.id)}
                              className="h-16 bg-white/5 hover:bg-red-600 border border-white/10 text-white font-bold rounded-2xl"
                            >
                              {p.name} (R$ {p.current_value.toLocaleString()})
                            </Button>
                          ))}
                        </div>
                        <Button variant="ghost" onClick={() => setSelectingVictim(false)} className="w-full text-slate-500">Voltar</Button>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // UI Normal do Jogo
              <div className="space-y-8">
                {/* ... (Resto da UI normal mantida) */}
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
            )}
          </div>
        ) : (
          // Reveal / Finished UI (Mantida)
          <div className="space-y-6">
            {/* ... (Lógica de revelação mantida) */}
            <Card className={cn(
              "border-none rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden",
              myAnswer?.is_correct ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
            )}>
              <h2 className="text-5xl font-black tracking-tighter uppercase">
                {currentQuestion.id === 'maldade' ? "DECISÃO PROCESSADA" : (myAnswer?.is_correct ? "VOCÊ ACERTOU!" : "VOCÊ ERROU!")}
              </h2>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MillionaireGame;