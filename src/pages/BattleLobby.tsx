import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, PlusCircle, LogIn, User, Zap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const BattleLobby = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Macrófago');
  const navigate = useNavigate();

  const classes = [
    { name: 'Macrófago', hp: 120, atk: 15, desc: 'Alta resistência e dano massivo.' },
    { name: 'Neutrófilo', hp: 80, atk: 25, desc: 'Ataque rápido e explosivo.' },
    { name: 'Linfócito B', hp: 100, atk: 18, desc: 'Equilibrado com bônus de suporte.' },
    { name: 'Linfócito T CD8', hp: 90, atk: 22, desc: 'Ignora defesas adversárias.' },
    { name: 'Célula NK', hp: 100, atk: 20, desc: 'Chance de acerto crítico.' }
  ];

  const createBattle = async () => {
    setLoading(true);
    const code = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Faça login primeiro.");

      const { data: room, error: roomError } = await supabase
        .from('battle_rooms')
        .insert({ code, status: 'waiting' })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const stats = classes.find(c => c.name === selectedClass);

      await supabase.from('battle_players').insert({
        battle_room_id: room.id,
        user_id: user.id,
        name: profile?.full_name || 'Guerreiro',
        class: selectedClass,
        hp: stats?.hp,
        max_hp: stats?.hp,
        attack: stats?.atk
      });

      showSuccess("Arena criada! Código: " + code);
      navigate(`/battle/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinBattle = async () => {
    if (!roomCode.trim()) return showError("Digite o código da sala.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Faça login primeiro.");

      const { data: room, error: roomError } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) throw new Error("Arena não encontrada.");

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const stats = classes.find(c => c.name === selectedClass);

      await supabase.from('battle_players').insert({
        battle_room_id: room.id,
        user_id: user.id,
        name: profile?.full_name || 'Guerreiro',
        class: selectedClass,
        hp: stats?.hp,
        max_hp: stats?.hp,
        attack: stats?.atk
      });

      showSuccess("Entrou na arena!");
      navigate(`/battle/${room.id}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-3">
          <ShieldAlert className="text-blue-500 w-10 h-10" /> ARENA DE BATALHA
        </h1>
        <p className="text-slate-400 font-medium">Escolha sua linhagem celular e entre no combate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seleção de Classe */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Selecione sua Célula</h2>
          <div className="grid grid-cols-1 gap-3">
            {classes.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedClass(c.name)}
                className={cn(
                  "p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                  selectedClass === c.name 
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20 scale-[1.02]" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                )}
              >
                <div>
                  <p className="font-black text-lg tracking-tight">{c.name}</p>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{c.desc}</p>
                </div>
                <div className="flex gap-4 text-[10px] font-black">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> ATK: {c.atk}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> HP: {c.hp}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ações */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-white text-xl font-black">Acesso à Arena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={createBattle} 
              disabled={loading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95"
            >
              <PlusCircle className="mr-2 h-6 w-6" /> CRIAR NOVA ARENA
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-950 px-4 text-slate-500 font-black tracking-widest">Ou entre em uma</span></div>
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
                onClick={joinBattle}
                disabled={loading}
                className="h-14 bg-white/10 hover:bg-white/20 text-white font-black px-8 rounded-2xl"
              >
                <LogIn className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BattleLobby;