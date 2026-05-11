"use client";

import React, { useState, useEffect } from 'react';
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
  HelpCircle, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Sparkles,
  LogOut
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const PRIZES = [
  1000, 2000, 3000, 5000, 10000, 
  20000, 30000, 50000, 100000, 200000, 
  300000, 500000, 700000, 900000, 1000000
];

const CHECKPOINTS = [4, 9]; // Índices 4 (10k) e 9 (200k)

const MillionaireGame = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    askLab: true,
    consultBook: true,
    skip: true
  });
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [labStats, setLabStats] = useState<any>(null);
  const [showTip, setShowTip] = useState(false);

  const myPlayer = players.find(p => p.user_id === currentUserId);
  const currentQuestion = MILLIONAIRE_QUESTIONS[room?.current_question_index || 0];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'playing': return 'Em Jogo';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        setCurrentUserId(user.id);

        const { data: roomData } = await supabase.from('millionaire_rooms').select('*').eq('id', roomId).single();
        if (!roomData) return navigate('/millionaire');
        setRoom(roomData);

        const { data: playersData } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId);
        setPlayers(playersData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    setup();

    const channel = supabase.channel(`millionaire:${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'millionaire_rooms', 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        if (payload.new && Object.keys(payload.new).length > 0) {
          setRoom(payload.new);
          setTimeLeft(20);
          setAnswered(false);
          setRemovedOptions([]);
          setLabStats(null);
          setShowTip(false);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'millionaire_players', 
        filter: `room_id=eq.${roomId}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  useEffect(() => {
    if (room?.status === 'playing' && timeLeft > 0 && !answered && !myPlayer?.is_eliminated) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && room?.status === 'playing' && !myPlayer?.is_eliminated) {
      handleAnswer('TIMEOUT');
    }
  }, [timeLeft, room?.status, answered, myPlayer?.is_eliminated]);

  const startLevel = async () => {
    if (!room) return;
    
    // Forçamos a atualização no banco
    const { error } = await supabase
      .from('millionaire_rooms')
      .update({ 
        status: 'playing', 
        current_question_index: 0 
      })
      .eq('id', roomId);

    if (error) {
      showError("Erro ao iniciar: " + error.message);
    } else {
      showSuccess("O desafio começou!");
      // Atualização local imediata para evitar delay do Realtime
      setRoom(prev => ({ ...prev, status: 'playing', current_question_index: 0 }));
    }
  };

  const handleAnswer = async (choice: string) => {
    if (answered || myPlayer?.is_eliminated) return;
    setAnswered(true);

    const isCorrect = choice === currentQuestion.correct;
    let newValue = 0;
    let eliminated = false;

    if (isCorrect) {
      newValue = PRIZES[room.current_question_index];
      showSuccess("Resposta Correta!");
    } else {
      eliminated = true;
      if (room.current_question_index > 9) newValue = 200000;
      else if (room.current_question_index > 4) newValue = 10000;
      else newValue = 0;
      showError("Você foi eliminado!");
    }

    await supabase.from('millionaire_players').update({
      current_value: newValue,
      is_eliminated: eliminated,
      last_answered_index: room.current_question_index
    }).eq('id', myPlayer.id);

    if (room.host_id === currentUserId) {
      setTimeout(async () => {
        const { data: survivors } = await supabase.from('millionaire_players').select('*').eq('room_id', roomId).eq('is_eliminated', false);
        
        if (!survivors || survivors.length === 0) {
          await supabase.from('millionaire_rooms').update({ status: 'finished' }).eq('id', roomId);
          confetti();
        } else {
          const nextIndex = room.current_question_index + 1;
          if (nextIndex >= PRIZES.length) {
            await supabase.from('millionaire_rooms').update({ status: 'finished' }).eq('id', roomId);
            confetti();
          } else {
            await supabase.from('millionaire_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
          }
        }
      }, 3000);
    }
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || answered) return;
    const options = ['A', 'B', 'C', 'D'].filter(o => o !== currentQuestion.correct);
    const toRemove = options.sort(() => 0.5 - Math.random()).slice(0, 2);
    setRemovedOptions(toRemove);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };

  const useAskLab = () => {
    if (!lifelines.askLab || answered) return;
    const stats: any = { A: 5, B: 5, C: 5, D: 5 };
    const isAccurate = Math.random() < 0.7;
    const target = isAccurate ? currentQuestion.correct : ['A', 'B', 'C', 'D'].find(o => o !== currentQuestion.correct);
    stats[target!] = 70;
    setLabStats(stats);
    setLifelines(prev => ({ ...prev, askLab: false }));
  };

  const useConsultBook = () => {
    if (!lifelines.consultBook || answered) return;
    setShowTip(true);
    setLifelines(prev => ({ ...prev, consultBook: false }));
  };

  const useSkip = async () => {
    if (!lifelines.skip || answered || room.host_id !== currentUserId) return;
    const nextIndex = room.current_question_index + 1;
    await supabase.from('millionaire_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
    setLifelines(prev => ({ ...prev, skip: false }));
  };

  if (loading || !room || !myPlayer) return <div className="text-white text-center py-20">Sincronizando Laboratório...</div>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 animate-in fade-in duration-700">
      
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <Card className="bg-slate-900/80 border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Escada de Prêmios</h3>
          </div>
          <div className="p-2 space-y-1">
            {[...PRIZES].reverse().map((prize, idx) => {
              const levelIdx = PRIZES.length - 1 - idx;
              const isCurrent = room.current_question_index === levelIdx;
              const isCheckpoint = CHECKPOINTS.includes(levelIdx) || levelIdx === 14;
              return (
                <div key={idx} className={cn(
                  "flex justify-between px-4 py-1.5 rounded-xl text-[11px] font-black transition-all",
                  isCurrent ? "bg-yellow-600 text-white scale-105 shadow-lg" : 
                  isCheckpoint ? "text-yellow-500/80" : "text-slate-500"
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
            {players.map(p => (
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

      <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
        
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            <span className="font-black text-white tracking-tight">SALA #{room.code}</span>
          </div>
          <div className="flex items-center gap-4">
            {room.status === 'playing' && !myPlayer.is_eliminated && (
              <div className="flex items-center gap-2 bg-yellow-600/20 px-4 py-1.5 rounded-full border border-yellow-500/20">
                <Timer className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black text-lg">{timeLeft}s</span>
              </div>
            )}
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 uppercase font-black text-[9px]">
              {getStatusLabel(room.status)}
            </Badge>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400" onClick={() => navigate('/millionaire')}>
              <LogOut className="w-4 h-4 mr-2" /> SAIR
            </Button>
          </div>
        </div>

        {room.status === 'waiting' ? (
          <Card className="bg-white/5 border-white/10 rounded-[3rem] p-16 text-center space-y-8 backdrop-blur-2xl">
            <div className="w-24 h-24 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white">Pronto para o Milhão?</h2>
              <p className="text-slate-400 text-lg">Aguardando o host iniciar a rodada de perguntas.</p>
            </div>
            {room.host_id === currentUserId && (
              <Button onClick={startLevel} size="lg" className="bg-yellow-600 hover:bg-yellow-500 font-black px-16 h-20 rounded-3xl text-xl shadow-2xl shadow-yellow-900/40">
                INICIAR DESAFIO
              </Button>
            )}
          </Card>
        ) : room.status === 'playing' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <Button 
                disabled={!lifelines.fiftyFifty || answered || myPlayer.is_eliminated} 
                onClick={useFiftyFifty}
                className={cn("h-16 rounded-2xl font-black border-2 transition-all", lifelines.fiftyFifty ? "bg-white/5 border-white/10 hover:bg-yellow-600" : "opacity-30 bg-slate-800")}
              >
                50/50
              </Button>
              <Button 
                disabled={!lifelines.askLab || answered || myPlayer.is_eliminated} 
                onClick={useAskLab}
                className={cn("h-16 rounded-2xl font-black border-2 transition-all", lifelines.askLab ? "bg-white/5 border-white/10 hover:bg-blue-600" : "opacity-30 bg-slate-800")}
              >
                LABORATÓRIO
              </Button>
              <Button 
                disabled={!lifelines.consultBook || answered || myPlayer.is_eliminated} 
                onClick={useConsultBook}
                className={cn("h-16 rounded-2xl font-black border-2 transition-all", lifelines.consultBook ? "bg-white/5 border-white/10 hover:bg-emerald-600" : "opacity-30 bg-slate-800")}
              >
                LIVRO
              </Button>
              <Button 
                disabled={!lifelines.skip || answered || myPlayer.is_eliminated || room.host_id !== currentUserId} 
                onClick={useSkip}
                className={cn("h-16 rounded-2xl font-black border-2 transition-all", lifelines.skip ? "bg-white/5 border-white/10 hover:bg-purple-600" : "opacity-30 bg-slate-800")}
              >
                PULAR
              </Button>
            </div>

            <Card className="bg-white/90 border-white/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 text-center leading-tight tracking-tight">
                {currentQuestion.question}
              </h2>
              {showTip && (
                <div className="mt-8 p-4 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-center animate-in slide-in-from-top">
                  <BookOpen className="w-5 h-5 inline mr-2" /> {currentQuestion.tip}
                </div>
              )}
              {labStats && (
                <div className="mt-8 grid grid-cols-4 gap-4">
                  {Object.entries(labStats).map(([opt, val]: any) => (
                    <div key={opt} className="text-center">
                      <div className="h-20 bg-blue-100 rounded-xl relative overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000" style={{ height: `${val}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-600">{opt}: {val}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion.options).map(([key, val]) => {
                const isRemoved = removedOptions.includes(key);
                if (isRemoved) return <div key={key} className="h-20" />;
                
                return (
                  <Button
                    key={key}
                    disabled={answered || myPlayer.is_eliminated}
                    onClick={() => handleAnswer(key)}
                    className={cn(
                      "h-20 rounded-3xl font-black text-xl transition-all border-2 text-left justify-start px-8",
                      answered && key === currentQuestion.correct ? "bg-emerald-600 border-emerald-400 text-white scale-105" :
                      answered && key !== currentQuestion.correct ? "bg-white/5 border-white/10 text-slate-500" :
                      "bg-white/5 border-white/10 text-white hover:bg-yellow-600 hover:border-yellow-400"
                    )}
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 text-sm">{key}</span>
                    {val}
                  </Button>
                );
              })}
            </div>

            {myPlayer.is_eliminated && (
              <div className="bg-red-600/20 border border-red-500/30 p-8 rounded-[2.5rem] text-center space-y-4 animate-in zoom-in">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-2xl font-black text-white">VOCÊ FOI ELIMINADO</h3>
                <p className="text-slate-400">Aguarde o fim da rodada para ver o resultado final.</p>
              </div>
            )}
          </div>
        ) : room.status === 'finished' ? (
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