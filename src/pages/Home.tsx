"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Quote, 
  Sparkles, 
  Trophy, 
  Activity, 
  ShieldCheck,
  Target,
  Medal
} from 'lucide-react';

const Home = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalPoints: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [curiosity, setCuriosity] = useState('');

  const reflections = [
    "A imunologia é a arte de distinguir o 'eu' do 'outro' para proteger a essência da vida.",
    "A saúde é o resultado do equilíbrio perfeito entre defesa e tolerância.",
    "Cada célula do seu corpo é um soldado em uma guerra silenciosa pela sua sobrevivência.",
    "Entender a imunologia é decifrar o código de segurança mais complexo do universo.",
    "A vacina é a inteligência humana ensinando a natureza a se proteger.",
    "O sistema imune não apenas nos defende, ele define quem somos biologicamente."
  ];

  const curiosities = [
    "O corpo humano produz cerca de 100 bilhões de novos neutrófilos todos os dias!",
    "As células de memória podem 'lembrar' de um invasor por décadas, às vezes pela vida toda.",
    "O sistema linfático não tem uma 'bomba' como o coração; ele depende do movimento dos seus músculos.",
    "Cerca de 70% a 80% do seu sistema imunológico está localizado no seu intestino.",
    "O sono é crucial: a falta dele reduz drasticamente a eficácia das suas células T.",
    "As células NK (Natural Killer) podem detectar e destruir células tumorais antes mesmo de formarem um câncer.",
    "O leite materno contém anticorpos IgA que protegem o bebê enquanto seu sistema imune amadurece."
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          const { data: playerStats } = await supabase
            .from('players')
            .select('points')
            .eq('name', profileData.full_name);

          if (playerStats) {
            const totalPoints = playerStats.reduce((acc, curr) => acc + (curr.points || 0), 0);
            const gamesPlayed = playerStats.length;
            const wins = playerStats.filter(p => p.points >= 100).length;
            const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
            setStats({ gamesPlayed, totalPoints, winRate });
          }
        }
      }
      setLoading(false);
    };
    fetchData();
    setCuriosity(curiosities[Math.floor(Math.random() * curiosities.length)]);
  }, []);

  const getDailyReflection = () => {
    const today = new Date().toDateString();
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % reflections.length;
    return reflections[index];
  };

  if (loading) return <div className="text-white text-center py-20">Carregando seu painel...</div>;

  const isProfessor = profile?.is_admin || profile?.course === 'Professor';
  const heroTitle = isProfessor 
    ? `Mestre ${profile?.full_name?.split(' ')[0] || 'Docente'}`
    : `Líder ${profile?.full_name?.split(' ')[0] || 'Cadete'}`;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section sem fundo quadrado */}
      <div className="relative py-8">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <Avatar className="w-40 h-40 md:w-56 md:h-56 border-4 border-white/10 shadow-2xl relative">
              <AvatarImage src={profile?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-violet-600 text-5xl font-black">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                {heroTitle}
              </h1>
              <p className="text-2xl md:text-3xl text-violet-400 font-black uppercase tracking-widest opacity-90">
                {profile?.course || 'Enfermagem'}
              </p>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 font-bold italic opacity-90 tracking-tight max-w-2xl leading-relaxed">
              {isProfessor 
                ? "Coordenando a defesa do conhecimento e moldando o futuro da saúde." 
                : "A ciência da vida em suas mãos. Prepare-se para ser a elite da saúde."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Trophy, color: "blue", val: stats.gamesPlayed, label: "Partidas" },
          { icon: Medal, color: "emerald", val: stats.totalPoints, label: "Total XP" },
          { icon: Target, color: "violet", val: `${stats.winRate}%`, label: "Vitórias" },
          { icon: Activity, color: "pink", val: "Ativo", label: "Status", pulse: true }
        ].map((s, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-xl p-5 md:p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all group">
            <div className={`bg-${s.color}-500/20 p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
              <s.icon className={`text-${s.color}-400 w-6 h-6 ${s.pulse ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-white">{s.val}</p>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl hover:bg-white/10 transition-all overflow-hidden">
          <div className="h-1.5 w-full bg-violet-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-violet-400 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Quote className="w-4 h-4" /> Reflexão do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 italic text-lg leading-relaxed font-bold tracking-tight">
              "{getDailyReflection()}"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl hover:bg-white/10 transition-all overflow-hidden">
          <div className="h-1.5 w-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-400 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" /> Curiosidade Imunológica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 text-base leading-relaxed font-bold tracking-tight">
              {curiosity}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;