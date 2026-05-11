"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Monitor, 
  Sparkles, 
  CheckCircle2,
  Eye,
  Zap,
  Loader2,
  ChevronRight,
  Send,
  AlertCircle,
  XCircle
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const myPlayer = players.find(p => p.user_id === currentUserId);
  const currentQuestion = MILLIONAIRE_QUESTIONS[room?.current_question_index || 0];
  const myAnswer = answers.find(a => a.player_id === myPlayer?.id && a.question_index === room?.current_question_index);

  // Sincronização do Timer
  useEffect(() => {
    if (room?.phase === 'question' && room?.question_started_at) {
      const updateTimer = () => {
        const startedAt = new Date(room.question_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setTimeLeft(remaining);

        // Host gerencia a transição para Reveal
        if (remaining === 0 && room.host_id === currentUserId) {
          handleRevealPhase();
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.phase, room?.question_started_at, room?.host_id, currentUserId]);

  // Lógica do Host para Revelar Respostas
  const handleRevealPhase = async () => {
    if (room.host_id !== currentUserId) return;

    // 1. Buscar todas as respostas da rodada
    const { data: roundAnswers } = await supabase
      .from('millionaire_answers')
      .select('*')
      .eq('room_id', roomId)
      .eq('question_index', room.current_question_index);

    // 2. Atualizar status de cada jogador
    for (const player of players) {
      if (player.is_eliminated) continue;

      const playerAns = roundAnswers?.find(a => a.player_id === player.id);
      const isCorrect = playerAns?.is_correct || false;
      
      let newValue = player.current_value;
      let eliminated = !isCorrect;

      if (isCorrect) {
        newValue = PRIZES[room.current_question_index];
      } else {
        // Patamares de segurança
        if (room.current_question_index >= 10) newValue = 200000;
        else if (room.current_question_index >= 5) newValue = 10000;
        else newValue = 0;
      }

      await supabase.from('millionaire_players').update({
        current_value: newValue,
        is_eliminated: eliminated,
        last_answered_index: room.current_question_index
      }).eq('id', player.id);
    }

    // 3. Mudar fase da sala
    await supabase.from('millionaire_rooms').update({ phase: 'reveal' }).eq('id', roomId);

    // 4. Agendar próxima rodada ou fim
    setTimeout(async () => {
      const { data: activePlayers } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_eliminated', false);

      const nextIndex = room.current_question_index + 1;
      
      if (!activePlayers || activePlayers.length === 0 || nextIndex >= PRIZES.length) {
        await supabase.from('millionaire_rooms').update({ 
          phase: 'finished', 
          status: 'finished' 
        }).eq('id', roomId);
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
      showSuccess("Resposta enviada! Aguarde o fim do tempo.");
    } catch (error) {
      showError("Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const startGame = async () => {
    if (room.host_id !== currentUserId) return;
    await supabase.from('millionaire_rooms').update({
      status: 'playing',
      phase: 'question',
      current_question_index: 0,
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

  if (loading || !room || !myPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando com o Lab...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      {/* Coluna Lateral: Ranking e Prêmios */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Prêmios</h3>
          </div>
          <div className="p-2 space-y-1">
            {[...PRIZES].reverse().map((prize, idx) => {
              const levelIdx = PRIZES.length - 1 - idx;
              const isCurrent = room.current_question_index === levelIdx;
              return (
                <div key={idx} className={cn(
                  "flex justify-between px-4 py-1.5 rounded-xl text-[11px] font-black",
                  isCurrent ? "bg-yellow-600 text-white scale-105 shadow-lg" : "text-slate-500"
                )}>
                  <span>{levelIdx + 1}</span>
                  <span>R$ {prize.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Candidatos</h3>
            <Users className="w-3 h-3 text-blue-400" />
          </div>
          <div className="p-4 space-y-3">
            {players.sort((a, b) => b.current_value - a.current_value).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", p.is_eliminated ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                  <span className={cn("text-xs font-bold", p.is_eliminated ? "text-slate-600 line-through" : "text-white")}>{p.name}</span>
                </div>
                <span className="text-[10px] font-black text-yellow-500">R$ {p.current_value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Área Principal do Jogo */}
      <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            <span className="font-black text-white tracking-tight">SALA #{room.code}</span>
          </div>
          <div className="flex items-center gap-4">
            {myPlayer.is_eliminated && room.status === 'playing' && (
              <Badge className="bg-red-600/20 text-red-500 border-red-500/30 flex items-center gap-2 px-3 py-1">
                <Eye className="w-3 h-3" /> MODO ESPECTADOR
              </Badge>
            )}
            {room.host_id === currentUserId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                onClick={() => window.open(`/millionaire/${roomId}/presentation`, '_blank')}
              >
                <Monitor className="w-4 h-4 mr-2" /> MODO PROJETOR
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
            <p className="text-slate-400 font-medium">Aguardando o Host iniciar a rodada...</p>
            {room.host_id === currentUserId && (
              <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl">
                INICIAR DESAFIO
              </Button>
            )}
          </Card>
        ) : room.phase === 'question' ? (
          <div className="space-y-8">
            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
              <div className="absolute top-4 right-8 flex items-center gap-2 bg-orange-600/20 px-4 py-1.5 rounded-full border border-orange-500/30">
                <Timer className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-black text-lg">{timeLeft}s</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight tracking-tight mt-4">
                {currentQuestion.question}
              </h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion.options).map(([key, val]) => (
                <Button
                  key={key}
                  disabled={myPlayer.is_eliminated || !!myAnswer || submitting}
                  onClick={() => setSelectedChoice(key)}
                  className={cn(
                    "h-20 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8",
                    myAnswer?.answer === key ? "bg-yellow-600 border-yellow-400 text-white shadow-lg" :
                    selectedChoice === key ? "bg-blue-600 border-blue-400 text-white" :
                    "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                  {val}
                </Button>
              ))}
            </div>

            {!myAnswer && !myPlayer.is_eliminated && (
              <div className="flex justify-center">
                <Button 
                  onClick={submitAnswer}
                  disabled={!selectedChoice || submitting}
                  className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-900/20"
                >
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                  CONFIRMAR RESPOSTA
                </Button>
              </div>
            )}

            {myAnswer && (
              <div className="text-center animate-pulse">
                <p className="text-emerald-400 font-black uppercase tracking-widest">Resposta enviada! Aguarde os outros jogadores...</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-3xl p-6">
                <h3 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Acertaram
                </h3>
                <div className="space-y-2">
                  {players.filter(p => p.last_answered_index === room.current_question_index && !p.is_eliminated).map(p => (
                    <div key={p.id} className="text-white font-bold flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-emerald-400">+ R$ {PRIZES[room.current_question_index].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20 rounded-3xl p-6">
                <h3 className="text-red-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Eliminados
                </h3>
                <div className="space-y-2">
                  {players.filter(p => p.is_eliminated && p.last_answered_index === room.current_question_index).map(p => (
                    <div key={p.id} className="text-slate-400 font-bold flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-red-500">ELIMINADO</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {myPlayer.is_eliminated && myPlayer.last_answered_index === room.current_question_index && (
              <div className="bg-red-600 p-8 rounded-[2rem] text-center animate-bounce">
                <h2 className="text-3xl font-black text-white tracking-tighter">VOCÊ FOI ELIMINADO!</h2>
                <p className="text-white/80 font-bold">Agora você é um espectador.</p>
              </div>
            )}
          </div>
        ) : room.phase === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-6xl font-black text-white tracking-tighter">FIM DE JOGO</h2>
            <div className="max-w-md mx-auto space-y-4">
              {players.sort((a, b) => b.current_value - a.current_value).map((p, i) => (
                <div key={p.id} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border",
                  i === 0 ? "bg-yellow-600/20 border-yellow-500" : "bg-white/5 border-white/10"
                )}>
                  <span className="font-black text-white text-xl">{i + 1}º {p.name}</span>
                  <span className="text-yellow-500 font-black text-xl">R$ {p.current_value.toLocaleString()}</span>
                </div>
              ))}
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