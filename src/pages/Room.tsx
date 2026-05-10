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
import { Trophy, Users, Play, RotateCcw, Copy, LogOut, Dna, Microscope, Activity } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const Room = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
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

      const { data: cardData } = await supabase
        .from('bingo_cards')
        .select('*')
        .eq('player_id', playerId)
        .eq('room_id', roomId)
        .single();

      if (cardData) {
        setCardTerms(cardData.card_data);
      } else {
        const shuffled = [...IMMUNOLOGY_TERMS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 25).map(t => t.answer);
        await supabase.from('bingo_cards').insert({
          room_id: roomId,
          player_id: playerId,
          card_data: selected
        });
        setCardTerms(selected);
      }

      const { data: marksData } = await supabase
        .from('marks')
        .select('term')
        .eq('player_id', playerId)
        .eq('room_id', roomId);
      setMarkedTerms(marksData?.map(m => m.term) || []);

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
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, playerId]);

  const isHost = room?.host_id === playerId;

  const startGame = async () => {
    if (players.length < 2) {
      showError("Mínimo de 2 jogadores para iniciar.");
      return;
    }
    await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId);
  };

  const drawCard = async () => {
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

    const newMarked = [...markedTerms, term];
    setMarkedTerms(newMarked);
    
    await supabase.from('marks').insert({
      room_id: roomId,
      player_id: playerId,
      term: term
    });

    await supabase.from('players').update({ points: myPlayer.points + 10 }).eq('id', playerId);
  };

  const checkBingo = () => {
    const size = 5;
    const grid = [];
    for (let i = 0; i < size; i++) {
      grid.push(cardTerms.slice(i * size, (i + 1) * size));
    }

    const isMarked = (row: number, col: number) => {
      if (row === 2 && col === 2) return true;
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
      await supabase.from('players').update({ points: myPlayer.points + 200 }).eq('id', playerId);
      showSuccess("BINGO! Você venceu!");
    } else {
      showError("Você ainda não completou o Bingo!");
    }
  };

  const resetGame = async () => {
    await supabase.from('draws').delete().eq('room_id', roomId);
    await supabase.from('marks').delete().eq('room_id', roomId);
    await supabase.from('rooms').update({ status: 'waiting' }).eq('id', roomId);
    setMarkedTerms([]);
    setDrawHistory([]);
    setCurrentDraw(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    showSuccess("Código copiado!");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando laboratório...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Game Board */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
                <Microscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">IMUNO<span className="text-violet-500">BINGO</span></h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-violet-400 border-violet-400/30 bg-violet-400/5">
                    {room?.code}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/5" onClick={copyCode}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isHost && room.status === 'waiting' && (
                <Button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 font-black px-6 rounded-xl shadow-lg shadow-emerald-600/20">
                  <Play className="mr-2 h-4 w-4" /> INICIAR
                </Button>
              )}
              {isHost && room.status === 'finished' && (
                <Button onClick={resetGame} variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl">
                  <RotateCcw className="mr-2 h-4 w-4" /> REINICIAR
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl" onClick={() => navigate('/bingo')}>
                <LogOut className="mr-2 h-4 w-4" /> SAIR
              </Button>
            </div>
          </div>

          {/* Current Draw Panel */}
          <Card className="bg-slate-900/40 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500 animate-pulse" /> Sorteio em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center min-h-[220px] flex flex-col items-center justify-center">
              {currentDraw ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                  <p className="text-xl md:text-3xl font-bold text-white leading-tight max-w-2xl mx-auto">
                    "{currentDraw.question}"
                  </p>
                  {room.status === 'finished' && (
                    <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xl font-black px-6 py-2 rounded-2xl">
                      RESPOSTA: {currentDraw.answer}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 space-y-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Trophy className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-xl font-black uppercase tracking-widest">Aguardando Host...</p>
                </div>
              )}
              
              {isHost && room.status === 'playing' && (
                <Button onClick={drawCard} size="lg" className="mt-8 bg-violet-600 hover:bg-violet-500 font-black text-xl px-10 py-7 rounded-2xl shadow-2xl shadow-violet-600/40 transition-all active:scale-95">
                  SORTEAR PRÓXIMA CARTA
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Bingo Card Area */}
          <div className="relative py-4">
            <BingoCard 
              terms={cardTerms} 
              markedTerms={markedTerms} 
              onMark={markTerm}
              disabled={room.status !== 'playing'}
            />
            
            {room.status === 'playing' && (
              <div className="mt-10 flex justify-center">
                <Button 
                  onClick={claimBingo}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-3xl px-16 py-10 rounded-[2rem] shadow-2xl shadow-emerald-500/40 animate-bounce transition-all active:scale-90"
                >
                  BINGO!
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Players & Ranking */}
          <Card className="bg-slate-900/40 border-white/5 rounded-[2rem] shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardHeader className="py-5 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Ranking do Laboratório
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="divide-y divide-white/5">
                  {players.sort((a, b) => b.points - a.points).map((p, idx) => (
                    <div key={p.id} className={cn(
                      "flex items-center justify-between p-5 transition-colors",
                      p.id === playerId ? "bg-violet-600/10" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-600 w-5">{idx + 1}º</span>
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner",
                          p.id === playerId ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
                        )}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("font-bold text-sm", p.id === playerId ? "text-white" : "text-slate-300")}>
                            {p.name} {room.host_id === p.id && "👑"}
                          </span>
                          {p.id === playerId && <span className="text-[10px] text-violet-400 font-bold uppercase">Você</span>}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800/50 text-violet-400 font-black px-3 py-1 rounded-lg border border-white/5">
                        {p.points} PTS
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="rounded-[2rem] overflow-hidden shadow-2xl">
            <Chat roomId={roomId!} playerName={localStorage.getItem('imuno_player_name') || 'Anônimo'} />
          </div>

          {/* History */}
          <Card className="bg-slate-900/40 border-white/5 rounded-[2rem] shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardHeader className="py-5 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Histórico de Descobertas</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ScrollArea className="h-[180px]">
                <div className="flex flex-wrap gap-2">
                  {drawHistory.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-slate-400 font-bold py-1.5 px-3 rounded-xl">
                      {d.answer}
                    </Badge>
                  ))}
                  {drawHistory.length === 0 && (
                    <div className="w-full text-center py-10 text-slate-600 italic text-xs">
                      Nenhuma carta sorteada ainda.
                    </div>
                  )}
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