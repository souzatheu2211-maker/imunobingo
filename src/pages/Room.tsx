import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { IMMUNOLOGY_TERMS, BingoTerm } from '@/data/terms';
import BingoCard from '@/components/BingoCard';
import Chat from '@/components/Chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Trophy, 
  Users, 
  Play, 
  RotateCcw, 
  Copy, 
  LogOut, 
  Microscope, 
  Activity, 
  Sparkles, 
  History,
  MessageSquare,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const Room = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [allMarks, setAllMarks] = useState<any[]>([]);
  const [myPlayer, setMyPlayer] = useState<any>(null);
  const [cardTerms, setCardTerms] = useState<string[]>([]);
  const [markedTerms, setMarkedTerms] = useState<string[]>([]);
  const [currentDraw, setCurrentDraw] = useState<BingoTerm | null>(null);
  const [drawHistory, setDrawHistory] = useState<BingoTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const playerId = localStorage.getItem('imuno_player_id');

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate('/');
      return;
    }

    const setup = async () => {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      if (!roomData) {
        showError("Sala não encontrada.");
        navigate('/');
        return;
      }
      setRoom(roomData);

      const { data: playersData } = await supabase.from('players').select('*').eq('room_id', roomId);
      setPlayers(playersData || []);

      const me = playersData?.find(p => p.id === playerId);
      if (!me) {
        navigate('/');
        return;
      }
      setMyPlayer(me);

      const { data: allMarksData } = await supabase.from('marks').select('*').eq('room_id', roomId);
      setAllMarks(allMarksData || []);

      const { data: cardData } = await supabase
        .from('bingo_cards')
        .select('*')
        .eq('player_id', playerId)
        .eq('room_id', roomId)
        .single();

      if (cardData) {
        setCardTerms(cardData.card_data.slice(0, 16));
      } else {
        const shuffled = [...IMMUNOLOGY_TERMS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16).map(t => t.answer);
        await supabase.from('bingo_cards').insert({
          room_id: roomId,
          player_id: playerId,
          card_data: selected
        });
        setCardTerms(selected);
      }

      const myMarks = allMarksData?.filter(m => m.player_id === playerId).map(m => m.term) || [];
      setMarkedTerms(myMarks);

      const { data: drawsData } = await supabase
        .from('draws')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      
      if (drawsData && drawsData.length > 0) {
        setCurrentDraw({ question: drawsData[0].question, answer: drawsData[0].answer });
        setDrawHistory(drawsData.map(d => ({ question: d.question, answer: d.answer })));
      }

      setLoading(false);
    };

    setup();

    const roomChannel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'draws', filter: `room_id=eq.${roomId}` }, (payload) => {
        const newDraw = { question: payload.new.question, answer: payload.new.answer };
        setCurrentDraw(newDraw);
        setDrawHistory(prev => [newDraw, ...prev]);
        showSuccess("Nova carta sorteada!");
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marks', filter: `room_id=eq.${roomId}` }, (payload) => {
        setAllMarks(prev => [...prev, payload.new]);
        if (payload.new.player_id === playerId) {
          setMarkedTerms(prev => [...prev, payload.new.term]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, playerId]);

  const isHost = room?.host_id === playerId;

  const startGame = async () => {
    if (!isHost) return;
    if (players.length < 1) {
      showError("Aguardando jogadores...");
      return;
    }
    await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId);
  };

  const drawCard = async () => {
    if (!isHost) return;
    const drawnAnswers = drawHistory.map(d => d.answer);
    const available = IMMUNOLOGY_TERMS.filter(t => !drawnAnswers.includes(t.answer));
    
    if (available.length === 0) {
      showError("Todas as cartas já foram sorteadas!");
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    await supabase.from('draws').insert({
      room_id: roomId,
      question: random.question,
      answer: random.answer
    });
  };

  const markTerm = async (term: string) => {
    if (room.status !== 'playing') return;
    
    const isCorrect = drawHistory.some(d => d.answer === term);
    if (!isCorrect) {
      showError("Este termo ainda não foi sorteado!");
      return;
    }

    if (markedTerms.includes(term)) return;

    await supabase.from('marks').insert({
      room_id: roomId,
      player_id: playerId,
      term: term
    });

    await supabase.from('players').update({ points: (myPlayer.points || 0) + 10 }).eq('id', playerId);
  };

  const checkBingo = () => {
    const size = 4;
    const grid = [];
    for (let i = 0; i < size; i++) {
      grid.push(cardTerms.slice(i * size, (i + 1) * size));
    }

    const isMarked = (row: number, col: number) => {
      return markedTerms.includes(grid[row][col]);
    };

    for (let i = 0; i < size; i++) {
      if (grid[i].every((_, j) => isMarked(i, j))) return true;
    }
    for (let j = 0; j < size; j++) {
      let colWin = true;
      for (let i = 0; i < size; i++) {
        if (!isMarked(i, j)) colWin = false;
      }
      if (colWin) return true;
    }
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < size; i++) {
      if (!isMarked(i, i)) diag1 = false;
      if (!isMarked(i, size - 1 - i)) diag2 = false;
    }
    return diag1 || diag2;
  };

  const claimBingo = async () => {
    if (checkBingo()) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#3b82f6', '#f43f5e']
      });
      
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId);
      await supabase.from('players').update({ points: (myPlayer.points || 0) + 200 }).eq('id', playerId);
      showSuccess("BINGO! Você venceu!");
    } else {
      showError("Você ainda não completou o Bingo!");
    }
  };

  const resetGame = async () => {
    if (!isHost) return;
    await supabase.from('draws').delete().eq('room_id', roomId);
    await supabase.from('marks').delete().eq('room_id', roomId);
    await supabase.from('rooms').update({ status: 'waiting' }).eq('id', roomId);
    setMarkedTerms([]);
    setDrawHistory([]);
    setCurrentDraw(null);
    setAllMarks([]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    showSuccess("Código copiado!");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando laboratório...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 animate-in fade-in duration-700 relative">
      
      {/* Botão Flutuante do Chat */}
      <div className="fixed bottom-8 right-8 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" className="w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 shadow-2xl shadow-violet-900/40 border-4 border-slate-950 animate-bounce hover:animate-none">
              <MessageSquare className="w-7 h-7 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="p-0 bg-transparent border-none shadow-none mb-4">
            <Chat roomId={roomId!} playerName={localStorage.getItem('imuno_player_name') || 'Anônimo'} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna Principal: Jogo */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header da Sala */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-5 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-3 rounded-xl shadow-xl shadow-violet-600/20">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">IMUNO<span className="text-violet-500">BINGO</span></h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="font-mono text-[10px] text-violet-400 border-violet-400/30 bg-violet-400/5 px-2 py-0.5">
                    {room?.code}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white hover:bg-white/5" onClick={copyCode}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isHost && room.status === 'waiting' && (
                <Button onClick={startGame} size="sm" className="bg-emerald-600 hover:bg-emerald-500 font-black px-4 h-10 rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                  <Play className="mr-2 h-4 w-4" /> INICIAR
                </Button>
              )}
              {isHost && room.status === 'finished' && (
                <Button onClick={resetGame} variant="outline" size="sm" className="border-white/10 hover:bg-white/5 h-10 rounded-lg font-bold">
                  <RotateCcw className="mr-2 h-4 w-4" /> REINICIAR
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 hover:bg-red-400/5 h-10 px-4 rounded-lg font-bold" onClick={() => navigate('/bingo')}>
                <LogOut className="mr-2 h-4 w-4" /> SAIR
              </Button>
            </div>
          </div>

          {/* Painel de Sorteio - Reduzido */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl border-t-white/20">
            <CardHeader className="bg-white/5 border-b border-white/5 py-3 px-6">
              <CardTitle className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity className="w-3 h-3 text-violet-500 animate-pulse" /> Monitor de Sorteio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 text-center min-h-[180px] flex flex-col items-center justify-center relative">
              {currentDraw ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <p className="text-xl md:text-3xl font-black text-white leading-tight max-w-2xl mx-auto tracking-tight">
                      "{currentDraw.question}"
                    </p>
                  </div>
                  
                  {room.status === 'finished' && (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-lg font-black px-6 py-2 rounded-xl shadow-2xl shadow-emerald-500/10">
                      <Trophy className="w-5 h-5" /> RESPOSTA: {currentDraw.answer}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 space-y-3">
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse border border-white/10">
                    <Microscope className="w-7 h-7 text-slate-700" />
                  </div>
                  <p className="text-lg font-black uppercase tracking-[0.2em] opacity-50">Aguardando Sorteio...</p>
                </div>
              )}
              
              {isHost && room.status === 'playing' && (
                <Button 
                  onClick={drawCard} 
                  size="lg" 
                  className="mt-6 bg-violet-600 hover:bg-violet-500 font-black text-lg px-10 py-6 rounded-xl shadow-2xl shadow-violet-600/40 transition-all active:scale-95 group"
                >
                  SORTEAR CARTA
                  <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Descobertas */}
          <Card className="bg-slate-900/60 border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden border-t-white/20">
            <CardHeader className="py-3 px-6 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <History className="w-3 h-3 text-pink-500" /> Descobertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[80px]">
                <div className="flex flex-wrap gap-1.5">
                  {drawHistory.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold py-1 px-3 rounded-lg text-[9px] hover:bg-white/10 transition-colors">
                      {d.answer}
                    </Badge>
                  ))}
                  {drawHistory.length === 0 && (
                    <div className="w-full text-center py-4 text-slate-600 italic text-[10px] font-medium">
                      Nenhuma carta sorteada ainda.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Área da Cartela */}
          <div className="relative py-4">
            <div className="absolute -inset-4 bg-violet-600/5 rounded-[4rem] blur-3xl pointer-events-none" />
            <BingoCard 
              terms={cardTerms} 
              markedTerms={markedTerms} 
              onMark={markTerm}
              disabled={room.status !== 'playing'}
            />
            
            {room.status === 'playing' && (
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={claimBingo}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-3xl px-16 py-10 rounded-[2rem] shadow-2xl shadow-emerald-500/40 animate-bounce transition-all active:scale-90 border-b-8 border-emerald-700"
                >
                  BINGO!
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral: Ranking */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Ranking Atualizado */}
          <Card className="bg-slate-900/60 border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden border-t-white/20">
            <CardHeader className="py-5 px-6 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Users className="w-3 h-3 text-blue-500" /> Ranking do Lab
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-white/5">
                  {players.sort((a, b) => {
                    const marksA = allMarks.filter(m => m.player_id === a.id).length;
                    const marksB = allMarks.filter(m => m.player_id === b.id).length;
                    return marksB - marksA;
                  }).map((p, idx) => {
                    const marksCount = allMarks.filter(m => m.player_id === p.id).length;
                    const isPlayerHost = room.host_id === p.id;
                    return (
                      <div key={p.id} className={cn(
                        "flex items-center justify-between p-5 transition-all",
                        p.id === playerId ? "bg-violet-600/10" : "hover:bg-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-black w-4",
                            idx === 0 ? "text-yellow-500" : "text-slate-600"
                          )}>{idx + 1}º</span>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shadow-inner border relative",
                            p.id === playerId ? "bg-violet-600 border-violet-400 text-white" : "bg-slate-800 border-white/5 text-slate-400"
                          )}>
                            {p.name[0].toUpperCase()}
                            {isPlayerHost && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-0.5 border-2 border-slate-950">
                                <Crown className="w-2.5 h-2.5 text-slate-950" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={cn("font-black text-xs tracking-tight flex items-center gap-1", p.id === playerId ? "text-white" : "text-slate-300")}>
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {p.id === playerId && <span className="text-[8px] text-violet-400 font-black uppercase tracking-widest">Você</span>}
                              {isPlayerHost && <span className="text-[8px] text-yellow-500 font-black uppercase tracking-widest">Host</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 font-black px-3 py-1 rounded-lg border border-emerald-500/20 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {marksCount}/16
                          </Badge>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{p.points || 0} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Room;