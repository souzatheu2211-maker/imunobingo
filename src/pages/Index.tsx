import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Microscope, ShieldCheck, Users, Play, PlusCircle, LogIn } from 'lucide-react';
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

      await supabase.from('rooms').update({ host_id: player.id }).eq('id', room.id);

      localStorage.setItem('imuno_player_id', player.id);
      localStorage.setItem('imuno_player_name', name);
      
      showSuccess("Sala criada com sucesso!");
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      showError("Erro ao criar sala. Verifique se o banco de dados está configurado.");
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
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl w-full relative z-10">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 text-xs font-black uppercase tracking-widest">Lobby de Batalha</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            PREPARE SUA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-500">DEFESA</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-md mx-auto lg:mx-0">
            Crie uma sala estratégica ou junte-se a uma equipe para testar seus conhecimentos em imunologia.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
              <Users className="w-4 h-4" /> 100% Multiplayer
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
              <Microscope className="w-4 h-4" /> Base Científica
            </div>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-600 to-blue-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-2xl font-black">Acesso ao Jogo</CardTitle>
            <CardDescription className="text-slate-400">Identifique-se para entrar no laboratório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu Nome de Guerra</label>
              <Input 
                placeholder="Ex: Dr. Macrófago" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-violet-500 text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={createRoom} 
                disabled={loading}
                className="h-16 bg-violet-600 hover:bg-violet-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-900/20 transition-all active:scale-95"
              >
                <PlusCircle className="mr-2 h-6 w-6" />
                CRIAR NOVA SALA
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900/50 px-4 text-slate-500 font-black tracking-widest">Ou use um código</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="CÓDIGO" 
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white h-14 text-center font-mono tracking-widest text-lg rounded-2xl flex-1"
                />
                <Button 
                  variant="secondary" 
                  onClick={joinRoom}
                  disabled={loading}
                  className="h-14 bg-white/10 hover:bg-white/20 text-white font-black px-8 rounded-2xl"
                >
                  <LogIn className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;