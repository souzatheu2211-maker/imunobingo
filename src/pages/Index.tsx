import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Microscope, ShieldCheck, Users, Play } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Index = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateCode = () => {
    return 'IMUNO-' + Math.floor(1000 + Math.random() * 9000);
  };

  const createRoom = async () => {
    if (!name.trim()) {
      showError("Por favor, digite seu nome.");
      return;
    }
    setLoading(true);
    const code = generateCode();
    
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ code, status: 'waiting' })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, name, points: 0 })
        .select()
        .single();

      if (playerError) throw playerError;

      // Set host in room
      await supabase.from('rooms').update({ host_id: player.id }).eq('id', room.id);

      localStorage.setItem('imuno_player_id', player.id);
      localStorage.setItem('imuno_player_name', name);
      
      showSuccess("Sala criada com sucesso!");
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!name.trim() || !roomCode.trim()) {
      showError("Preencha seu nome e o código da sala.");
      return;
    }
    setLoading(true);

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) throw new Error("Sala não encontrada.");

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, name, points: 0 })
        .select()
        .single();

      if (playerError) throw playerError;

      localStorage.setItem('imuno_player_id', player.id);
      localStorage.setItem('imuno_player_name', name);

      showSuccess("Entrou na sala!");
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-2">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <CardTitle className="text-4xl font-black text-white tracking-tight">
            IMUNO<span className="text-violet-500">BINGO</span>
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            O jogo definitivo de imunologia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
            <Input 
              placeholder="Ex: Dr. Linfócito" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white h-12 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={createRoom} 
              disabled={loading}
              className="h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-lg shadow-violet-600/20"
            >
              <Microscope className="mr-2 h-5 w-5" />
              CRIAR SALA (HOST)
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-bold">Ou entrar em uma</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input 
                placeholder="CÓDIGO DA SALA (Ex: IMUNO-1234)" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-slate-800 border-slate-700 text-white h-12 text-center font-mono tracking-widest"
              />
              <Button 
                variant="secondary" 
                onClick={joinRoom}
                disabled={loading}
                className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                <Users className="mr-2 h-5 w-5" />
                ENTRAR NA SALA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-8 text-slate-600 text-xs font-medium flex items-center gap-2">
        <Play className="w-3 h-3" />
        Multiplayer em tempo real via Supabase
      </div>
    </div>
  );
};

export default Index;