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
import { Trophy, Users, Play, RotateCcw, Copy, LogOut, Dna } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';

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
      // Fetch Room
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      if (!roomData) {
        showError("Sala não encontrada.");
        navigate('/');
        return;
      }
      setRoom(roomData);

      // Fetch Players
      const { data: playersData } = await supabase.from('players').select('*').eq('room_id', roomId);
      setPlayers(playersData || []);

      const me = playersData?.find(p => p.id === playerId);
      if (!me) {
        navigate('/');
        return;
      }
      setMyPlayer(me);

      // Fetch or Generate Card
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

      // Fetch Marks
      const { data: marksData } = await supabase
        .from('marks')
        .select('term')
        .eq('player_id', playerId)
        .eq('room_id', roomId);
      setMarkedTerms(marksData?.map(m => m.term) || []);

      // Fetch Draws
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

    // Realtime Subscriptions
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

    // Update points
    await supabase.from('players').update({ points: myPlayer.points + 10 }).eq('id', playerId);
  };

  const checkBingo = () => {
    const size = 5;
    const grid = [];
    for (let i = 0; i < size; i++) {
      grid.push(cardTerms.slice(i * size, (i + 1) * size));
    }

    const isMarked = (row: number, col: number) => {
      if (row === 2 && col === 2) return true; // Free cell
      return markedTerms.includes(grid[row][col]);
    };

    // Rows
    for (let i = 0; i < size; i++) {
      if (grid[i].every((_, j) => isMarked(i, j))) return true;
    }
    // Cols
    for (let j = 0; j < size; j++) {
      let colWin = true;
      for (let i = 0; i < size; i++) {
        if (!isMarked(i, j)) colWin = false;
      }
      if (colWin) return true;
    }
    // Diagonals
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
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#3b82f6']
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Game Board */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 p-2 rounded-lg">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">IMUNO<span className="text-violet-500">BINGO</span></h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-violet-400 border-violet-400/30">
                    {room?.code}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={copyCode}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isHost && room.status === 'waiting' && (
                <Button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                  <Play className="mr-2 h-4 w-4" /> INICIAR JOGO
                </Button>
              )}
              {isHost && room.status === 'finished' && (
                <Button onClick={resetGame} variant="outline" className="border-slate-700 hover:bg-slate-800">
                  <RotateCcw className="mr-2 h-4 w-4" /> REINICIAR
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400" onClick={() => navigate('/')}>
                <LogOut className="mr-2 h-4 w-4" /> SAIR
              </Button>
            </div>
          </div>

          {/* Current Draw Panel */}
          <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl">
            <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Sorteio Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center min-h-[180px] flex flex-col items-center justify-center">
              {currentDraw ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <p className="text-lg md:text-2xl font-medium text-slate-200 leading-relaxed italic">
                    "{currentDraw.question}"
                  </p>
                  {room.status === 'finished' && (
                    <Badge className="bg-emerald-500 text-white text-lg px-4 py-1">
                      Resposta: {currentDraw.answer}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 space-y-2">
                  <p className="text-xl font-bold">Aguardando sorteio...</p>
                  <p className="text-sm">O host irá sortear a primeira carta em breve.</p>
                </div>
              )}
              
              {isHost && room.status === 'playing' && (
                <Button onClick={drawCard} size="lg" className="mt-6 bg-violet-600 hover:bg-violet-700 font-black text-lg px-8 py-6 shadow-lg shadow-violet-600/20">
                  SORTEAR CARTA
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Bingo Card */}
          <div className="relative">
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
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl px-12 py-8 rounded-2xl shadow-xl shadow-emerald-500/20 animate-bounce"
                >
                  PEDIR BINGO!
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Players & Ranking */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="py-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Jogadores ({players.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="divide-y divide-slate-800">
                  {players.sort((a, b) => b.points - a.points).map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600 w-4">{idx + 1}.</span>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          p.id === playerId ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
                        )}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <span className={cn("font-medium", p.id === playerId ? "text-white" : "text-slate-300")}>
                          {p.name} {room.host_id === p.id && "👑"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800 text-violet-400 font-bold">
                        {p.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat */}
          <Chat roomId={roomId!} playerName={localStorage.getItem('imuno_player_name') || 'Anônimo'} />

          {/* History */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="py-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Histórico de Cartas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[150px]">
                <div className="flex flex-wrap gap-2">
                  {drawHistory.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-400">
                      {d.answer}
                    </Badge>
                  ))}
                  {drawHistory.length === 0 && <p className="text-xs text-slate-600 italic">Nenhuma carta sorteada ainda.</p>}
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