import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, PlusCircle, LogIn, Sparkles } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const MillionaireLobby = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    const code = 'IMUNO-' + Math.floor(1000 + Math.random() * 9000);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Faça login primeiro.");

      const { data: room, error: roomError } = await supabase
        .from('millionaire_rooms')
        .insert({ 
          code, 
          status: 'waiting', 
          host_id: user.id,
          current_question_index: 0,
          phase: 'waiting',
          question_started_at: null
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();

      await supabase.from('millionaire_players').insert({
        room_id: room.id,
        user_id: user.id,
        name: profile?.full_name || 'Candidato',
        avatar_url: profile?.avatar_url,
        current_value: 0,
        is_eliminated: false
      });

      showSuccess("Sala criada! Código: " + code);
      navigate(`/millionaire/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) return showError("Digite o código da sala.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Faça login primeiro.");

      const { data: room, error: roomError } = await supabase
        .from('millionaire_rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) throw new Error("Sala não encontrada.");

      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();

      const { data: existing } = await supabase
        .from('millionaire_players')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        await supabase.from('millionaire_players').insert({
          room_id: room.id,
          user_id: user.id,
          name: profile?.full_name || 'Candidato',
          avatar_url: profile?.avatar_url,
          current_value: 0,
          is_eliminated: false
        });
      }

      showSuccess("Entrou na sala!");
      navigate(`/millionaire/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Show do Milhão Imuno</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">IMUNO <span className="text-yellow-500">MILIONÁRIO</span></h1>
        <p className="text-slate-400 text-lg font-medium">Responda corretamente e conquiste o prêmio máximo de 1 Milhão de XP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-6">
          <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
          <Button 
            onClick={createRoom} 
            disabled={loading}
            className="w-full h-16 bg-yellow-600 hover:bg-yellow-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-yellow-900/20 transition-all active:scale-95"
          >
            <PlusCircle className="mr-2 h-6 w-6" /> CRIAR NOVA SALA
          </Button>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-6">
          <h2 className="text-white text-xl font-black text-center">Já tem um código?</h2>
          <div className="space-y-4">
            <Input 
              placeholder="CÓDIGO (EX: IMUNO-1234)" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="bg-white/5 border-white/10 text-white h-14 text-center font-mono tracking-widest text-lg rounded-2xl"
            />
            <Button 
              onClick={joinRoom}
              disabled={loading}
              className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl"
            >
              <LogIn className="mr-2 h-6 w-6" /> ENTRAR NA SALA
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MillionaireLobby;