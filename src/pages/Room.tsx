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
import { Trophy, Users, Play, RotateCcw, Copy, LogOut, Microscope, Activity, Sparkles, History } from 'lucide-react';
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
        // Selecionar apenas 16 termos para a nova cartela 4x4
        const shuffled = [...IMMUNOLOGY_TERMS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16).map(t => t.answer);
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
    if (players.length < 1) {
      showError("Aguardando jogadores...");
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

    await supabase.from('players').update({ points: (myPlayer.points || 0) + 10 }).eq('id', playerId);
  };

  const checkBingo = () => {
    const size = 4; // Grid 4x4
    const grid = [];
    for (let i = 0; i < size; i++) {
      grid.push(cardTerms.slice(i * size, (i + 1) * size));
    }

    const isMarked = (row: number, col: number) => {
      return markedTerms.includes(grid[row][col]);
    };

    // Linhas
    for (let i = 0; i < size; i++) {
      if (grid[i].every((_, j) => isMarked(i, j))) return true;
    }
    // Colunas
    for (let j = 0; j < size; j++) {
      let colWin = true;
      for (let i = 0; i < size; i++) {
        if (!isMarked(i, j)) colWin = false;
      }
      if (colWin) return true;
    }
    // Diagonais
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna Principal: Jogo */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header da Sala */}
          <div className="flex flex-wrap items-center justify-between gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-4 rounded-2xl shadow-xl shadow-violet-600/20">
                <Microscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">IMUNO<span className="text-violet-500">BINGO</span></h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-violet-400 border-violet-400/30 bg-violet-400/5 px-3 py-1">
                    {room?.code}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isHost && room.status === 'waiting' && (
                <Button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                  <Play className="mr-2 h-5 w-5" /> INICIAR JOGO
                </Button>
              )}
              {isHost && room.status === 'finished' && (
                <Button onClick={resetGame} variant="outline" className="border-white/10 hover:bg-white/5 h-12 rounded-xl font-bold">
                  <RotateCcw className="mr-2 h-5 w-5" /> REINICIAR
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 hover:bg-red-400/5 h-12 px-6 rounded-xl font-bold" onClick={() => navigate('/bingo')}>
                <LogOut className="mr-2 h-5 w-5" /> SAIR
              </Button>
            </div>
          </div>

          {/* Painel de Sorteio */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-3xl border-t-white/20">
            <CardHeader className="bg-white/5 border-b border-white/5 py-5 px-8">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Activity className="w-4 h-4 text-violet-500 animate-pulse" /> Monitor de Sorteio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 text-center min-h-[280px] flex flex-col items-center justify-center relative">
              {currentDraw ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <Sparkles className="absolute -top-8 -left-8 w-8 h-8 text-violet-500/30 animate-bounce" />
                    <p className="text-2xl md:text-4xl font-black text-white leading-tight max-w-3xl mx-auto tracking-tight">
                      "{currentDraw.question}"
                    </p>
                    <Sparkles className="absolute -bottom-8 -right-8 w-8 h-8 text-blue-500/30 animate-bounce" style={{ animationDelay: '1s' }} />
                  </div>
                  
                  {room.status === 'finished' && (
                    <div className="inline-flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-2xl font-black px-8 py-3 rounded-2xl shadow-2xl shadow-emerald-500/10">
                      <Trophy className="w-6 h-6" /> RESPOSTA: {currentDraw.answer}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse border border-white/10">
                    <Microscope className="w-10 h-10 text-slate-700" />
                  </div>
                  <p className="text-2xl font-black uppercase tracking-[0.2em] opacity-50">Aguardando Sorteio...</p>
                </div>
              )}
              
              {isHost && room.status === 'playing' && (
                <Button 
                  onClick={drawCard} 
                  size="lg" 
                  className="mt-10 bg-violet-600 hover:bg-violet-500 font-black text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-violet-600/40 transition-all active:scale-95 group"
                >
                  SORTEAR PRÓXIMA CARTA
                  <Play className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Área da Cartela */}
          <div className="relative py-6">
            <div className="absolute -inset-4 bg-violet-600/5 rounded-[4rem] blur-3xl pointer-events-none" />
            <BingoCard 
              terms={cardTerms} 
              markedTerms={markedTerms} 
              onMark={markTerm}
              disabled={room.status !== 'playing'}
            />
            
            {room.status === 'playing' && (
              <div className="mt-12 flex justify-center">
                <Button 
                  onClick={claimBingo}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-4xl px-20 py-12 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 animate-bounce transition-all active:scale-90 border-b-8 border-emerald-700"
                >
                  BINGO!
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral: Ranking e Chat */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Ranking */}
          <Card className="bg-slate-900/60 border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl overflow-hidden border-t-white/20">
            <CardHeader className="py-6 px-8 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-500" /> Ranking do Lab
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <div className="divide-y divide-white/5">
                  {players.sort((a, b) => (b.points || 0) - (a.points || 0)).map((p, idx) => (
                    <div key={p.id} className={cn(
                      "flex items-center justify-between p-6 transition-all",
                      p.id === playerId ? "bg-violet-600/10" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-xs font-black w-6",
                          idx === 0 ? "text-yellow-500" : "text-slate-600"
                        )}>{idx + 1}º</span>
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border",
                          p.id === playerId ? "bg-violet-600 border-violet-400 text-white" : "bg-slate-800 border-white/5 text-slate-400"
                        )}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("font-black text-sm tracking-tight", p.id === playerId ? "text-white" : "text-slate-300")}>
                            {p.name} {room.host_id === p.id && "👑"}
                          </span>
                          {p.id === playerId && <span className="text-[9px] text-violet-400 font-black uppercase tracking-widest">Você</span>}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800/80 text-violet-400 font-black px-4 py-1.5 rounded-xl border border-white/10 text-xs">
                        {p.points || 0} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <Chat roomId={roomId!} playerName={localStorage.getItem('imuno_player_name') || 'Anônimo'} />
          </div>

          {/* Histórico */}
          <Card className="bg-slate-900/60 border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl overflow-hidden border-t-white/20">
            <CardHeader className="py-6 px-8 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <History className="w-4 h-4 text-pink-500" /> Descobertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[200px]">
                <div className="flex flex-wrap gap-2">
                  {drawHistory.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold py-2 px-4 rounded-xl text-[10px] hover:bg-white/10 transition-colors">
                      {d.answer}
                    </Badge>
                  ))}
                  {drawHistory.length === 0 && (
                    <div className="w-full text-center py-12 text-slate-600 italic text-xs font-medium">
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