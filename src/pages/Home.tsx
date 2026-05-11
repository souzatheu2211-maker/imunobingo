import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Quote, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  Target,
  Medal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Home = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dados mockados para o gráfico (já que ainda não temos tabela de histórico detalhado)
  const chartData = [
    { name: 'Seg', pontos: 400 },
    { name: 'Ter', pontos: 300 },
    { name: 'Qua', pontos: 600 },
    { name: 'Qui', pontos: 800 },
    { name: 'Sex', pontos: 500 },
    { name: 'Sáb', pontos: 900 },
    { name: 'Dom', pontos: 200 },
  ];

  const quotes = [
    "A imunologia é a ciência que estuda a dança eterna entre o 'eu' e o 'não-eu'.",
    "Nossas células de defesa são os soldados silenciosos que nunca dormem.",
    "A vacina é a maior prova de que a inteligência humana pode treinar a natureza.",
    "Entender o sistema imune é entender a complexidade da vida em sua forma mais pura."
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Carregando seu painel...</div>;

  const isProfessor = profile?.is_admin || profile?.course === 'Professor';
  const greeting = isProfessor 
    ? `Olá, Prof. ${profile?.full_name?.split(' ')[0] || 'Docente'}! 🎓`
    : `Olá, Futuro Profissional de ${profile?.course || 'Saúde'}! 🩺`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Personalizado */}
      <div className="bg-gradient-to-br from-violet-600/40 to-blue-600/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <ShieldCheck size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <Avatar className="w-24 h-24 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={profile?.avatar_url} className="object-cover" />
            <AvatarFallback className="bg-violet-600 text-2xl font-black">
              {profile?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{greeting}</h1>
            <p className="text-lg text-slate-200 font-medium opacity-80">
              {profile?.full_name || 'Seu Perfil'} • {isProfessor ? 'Administrador do Sistema' : 'Estudante Ativo'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
          <div className="bg-blue-500/20 p-3 rounded-2xl"><Trophy className="text-blue-400 w-6 h-6" /></div>
          <div>
            <p className="text-2xl font-black text-white">15</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Partidas</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
          <div className="bg-emerald-500/20 p-3 rounded-2xl"><Medal className="text-emerald-400 w-6 h-6" /></div>
          <div>
            <p className="text-2xl font-black text-white">08</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Vitórias</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
          <div className="bg-violet-500/20 p-3 rounded-2xl"><Target className="text-violet-400 w-6 h-6" /></div>
          <div>
            <p className="text-2xl font-black text-white">85%</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Precisão</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
          <div className="bg-pink-500/20 p-3 rounded-2xl"><Activity className="text-pink-400 w-6 h-6 animate-pulse" /></div>
          <div>
            <p className="text-2xl font-black text-white">Ativo</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Desempenho */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-3 text-lg font-black uppercase tracking-widest">
              <TrendingUp className="w-5 h-5 text-violet-400" /> Evolução Semanal (XP)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #ffffff10', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="pontos" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#8b5cf6' : '#3b82f680'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reflexão e Curiosidade */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-violet-400 flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                <Quote className="w-4 h-4" /> Reflexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 italic text-base leading-relaxed font-medium">
                "{quotes[Math.floor(Math.random() * quotes.length)]}"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-400 flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Curiosidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                O corpo humano produz cerca de 100 bilhões de novos neutrófilos todos os dias para manter sua imunidade inata alerta!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;