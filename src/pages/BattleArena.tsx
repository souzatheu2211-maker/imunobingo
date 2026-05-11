import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { BATTLE_QUESTIONS, BattleQuestion } from '@/data/battleQuestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Zap, Timer, Trophy, Heart, Activity, MessageSquare } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const BattleArena = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<BattleQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Derivamos o meu jogador da lista de players para garantir reatividade total
  const myPlayer = players.find(p => p.user_id === currentUserId);

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUserId(user.id);

      const { data: roomData } = await supabase.from('battle_rooms').select('*').eq('id', roomId).single();
      if (!roomData) {
        navigate('/battle');
        return;
      }
      setRoom(roomData);

      const { data: playersData } = await supabase.from('battle_players').select('*').eq('battle_room_id', roomId);
      setPlayers(playersData || []);

      if (roomData.status === 'playing') {
        setCurrentQuestion(BATTLE_QUESTIONS[roomData.current_question_index]);
      }

      setLoading(false);
    };

    setup();

    // Canal de sincronização em tempo real
    const channel = supabase.channel(`battle:${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'battle_rooms', 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        setRoom(payload.new);
        if (payload.new.status === 'playing') {
          setCurrentQuestion(BATTLE_QUESTIONS[payload.new.current_question_index]);
          setTimeLeft(10);
          setAnswered(false);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'battle_players', 
        filter: `battle_room_id=eq.${roomId}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => {
            // Evita duplicatas se o evento disparar duas vezes
            if (prev.find(p => p.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (room?.status === 'playing' && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && room?.status === 'playing') {
      handleAnswer(-1);
    }
  }, [timeLeft, room?.status, answered]);

  const startBattle = async () => {
    if (!room || players.length < 2) {
      showError("Aguarde pelo menos 2 jogadores.");
      return;
    }
    await supabase.from('battle_rooms').update({ status: 'playing', current_question_index: 0 }).eq('id', roomId);
  };

  const handleAnswer = async (index: number) => {
    if (answered || !myPlayer || !room) return;
    setAnswered(true);
    
    const isCorrect = index === currentQuestion?.answer;
    const responseTime = (10 - timeLeft) * 1000;

    await supabase.from('battle_answers').insert({
      battle_room_id: roomId,
      player_id: myPlayer.id,
      round: room.current_question_index,
      is_correct: isCorrect,
      response_time_ms: responseTime
    });

    if (isCorrect) {
      const speedBonus = Math.floor(timeLeft * 2);
      const damage = (myPlayer.attack || 10) + speedBonus;
      
      const others = players.filter(p => p.id !== myPlayer.id && p.hp > 0);
      for (const other of others) {
        const newHp = Math.max(0, other.hp - damage);
        await supabase.from('battle_players').update({ hp: newHp }).eq('id', other.id);
      }
      
      setLogs(prev => [`Você acertou e causou ${damage} de dano!`, ...prev.slice(0, 4)]);
      showSuccess("Acerto Crítico!");
    } else {
      const newHp = Math.max(0, myPlayer.hp - 10);
      await supabase.from('battle_players').update({ hp: newHp }).eq('id', myPlayer.id);
      setLogs(prev => [`Você errou e perdeu 10 HP!`, ...prev.slice(0, 4)]);
      showError("Erro de Defesa!");
    }

    // O Host controla o avanço das rodadas
    if (room.host_id === currentUserId) {
      setTimeout(async () => {
        const nextIndex = room.current_question_index + 1;
        if (nextIndex < BATTLE_QUESTIONS.length) {
          await supabase.from('battle_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
        } else {
          await supabase.from('battle_rooms').update({ status: 'finished' }).eq('id', roomId);
          confetti();
        }
      }, 4000);
    }
  };

  if (loading || !room || !myPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Arena...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 p-4 md:p-8">
      {/* Lista de Combatentes */}
      <div className="lg:col-span-4 space-y-4">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Combatentes</h2>
        <div className="space-y-3">
          {players.map((p) => (
            <Card key={p.id} className={cn(
              "bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden transition-all",
              p.hp <= 0 ? "opacity-40 grayscale" : "",
              p.id === myPlayer?.id ? "ring-1 ring-blue-500" : ""
            )}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white">
                      {p.name ? p.name[0] : '?'}
                    </div>
                    <div>
                      <p className="font-black text-sm text-white">{p.name}</p>
                      <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{p.class}</p>
                    </div>
                  </div>
                  {p.hp <= 0 && <Badge variant="destructive" className="text-[8px]">ELIMINADO</Badge>}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                    <span>Integridade Celular</span>
                    <span>{p.hp}/{p.max_hp}</span>
                  </div>
                  <Progress value={(p.hp / p.max_hp) * 100} className="h-2 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Log de Combate */}
        <Card className="bg-slate-900/50 border-white/10 rounded-2xl h-40 overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Log de Combate</span>
          </div>
          <div className="p-4 space-y-2">
            {logs.map((log, i) => (
              <p key={i} className="text-[10px] font-bold text-slate-300 animate-in slide-in-from-left duration-300">
                {log}
              </p>
            ))}
            {logs.length === 0 && <p className="text-[10px] text-slate-600 italic">Aguardando ações...</p>}
          </div>
        </Card>
      </div>

      {/* Área Central da Arena */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-blue-500" />
            <span className="font-black text-white tracking-tight">ARENA #{room.code}</span>
          </div>
          <div className="flex items-center gap-4">
            {room.status === 'playing' && (
              <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/20">
                <Timer className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-black text-sm">{timeLeft}s</span>
              </div>
            )}
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 uppercase font-black text-[9px]">
              {room.status}
            </Badge>
          </div>
        </div>

        {room.status === 'waiting' ? (
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Zap className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Aguardando Jogadores</h2>
              <p className="text-slate-400">A batalha começará assim que o host autorizar.</p>
            </div>
            {room.host_id === currentUserId && (
              <Button onClick={startBattle} size="lg" className="bg-blue-600 hover:bg-blue-500 font-black px-12 h-16 rounded-2xl shadow-xl shadow-blue-900/20">
                INICIAR COMBATE
              </Button>
            )}
          </Card>
        ) : room.status === 'playing' && currentQuestion ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <Card className="bg-gradient-to-br from-blue-600/20 to-transparent border-white/10 rounded-[2.5rem] p-8 md:p-12">
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight text-center">
                {currentQuestion.question}
              </h2>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, i) => (
                <Button
                  key={i}
                  disabled={answered || myPlayer.hp <= 0}
                  onClick={() => handleAnswer(i)}
                  className={cn(
                    "h-20 rounded-2xl font-black text-lg transition-all border-2",
                    answered && i === currentQuestion.answer ? "bg-emerald-600 border-emerald-400 text-white" :
                    answered && i !== currentQuestion.answer ? "bg-white/5 border-white/10 text-slate-500" :
                    "bg-white/5 border-white/10 text-white hover:bg-blue-600 hover:border-blue-400"
                  )}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        ) : room.status === 'finished' ? (
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-12 text-center space-y-8">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-5xl font-black text-white tracking-tighter">BATALHA ENCERRADA</h2>
            <div className="max-w-md mx-auto space-y-4">
              {players.sort((a, b) => b.hp - a.hp).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="font-black text-white">{i + 1}º {p.name}</span>
                  <span className="text-blue-400 font-black">{p.hp} HP RESTANTE</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/modes')} variant="outline" className="border-white/10 hover:bg-white/5 h-14 px-8 rounded-xl font-black">
              VOLTAR AO MENU
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default BattleArena;