import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Sparkles, BookOpen, Trophy, Activity, ShieldCheck } from 'lucide-react';

const Home = () => {
  const quotes = [
    "A imunologia é a ciência que estuda a dança eterna entre o 'eu' e o 'não-eu'.",
    "Nossas células de defesa são os soldados silenciosos que nunca dormem.",
    "A vacina é a maior prova de que a inteligência humana pode treinar a natureza.",
    "Entender o sistema imune é entender a complexidade da vida em sua forma mais pura."
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-violet-600/40 to-blue-600/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <ShieldCheck size={120} />
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tight">Olá, Futuro Profissional! 🩺</h1>
        <p className="text-lg text-slate-200 font-medium">Bem-vindo ao seu portal de estudos e diversão em Imunologia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 transition-all">
          <CardHeader>
            <CardTitle className="text-violet-400 flex items-center gap-3 text-xl font-black uppercase tracking-widest">
              <Quote className="w-6 h-6" /> Reflexão do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 italic text-xl leading-relaxed font-medium">
              "{quotes[Math.floor(Math.random() * quotes.length)]}"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 transition-all">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-3 text-xl font-black uppercase tracking-widest">
              <Sparkles className="w-6 h-6" /> Curiosidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 text-lg leading-relaxed font-medium">
              Você sabia que o corpo humano produz cerca de 100 bilhões de novos neutrófilos todos os dias? Eles são a linha de frente da sua imunidade inata!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex items-center gap-5 hover:scale-105 transition-transform">
          <div className="bg-blue-500/20 p-4 rounded-2xl"><BookOpen className="text-blue-400 w-8 h-8" /></div>
          <div>
            <p className="text-3xl font-black text-white">12</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">PDFs de Estudo</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex items-center gap-5 hover:scale-105 transition-transform">
          <div className="bg-violet-500/20 p-4 rounded-2xl"><Trophy className="text-violet-400 w-8 h-8" /></div>
          <div>
            <p className="text-3xl font-black text-white">5</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Partidas Ganhas</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex items-center gap-5 hover:scale-105 transition-transform">
          <div className="bg-emerald-500/20 p-4 rounded-2xl"><Activity className="text-emerald-400 w-8 h-8 animate-pulse" /></div>
          <div>
            <p className="text-3xl font-black text-white">Ativo</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status Global</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;