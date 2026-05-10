import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Sparkles, BookOpen, Trophy } from 'lucide-react';

const Home = () => {
  const quotes = [
    "A imunologia é a ciência que estuda a dança eterna entre o 'eu' e o 'não-eu'.",
    "Nossas células de defesa são os soldados silenciosos que nunca dormem.",
    "A vacina é a maior prova de que a inteligência humana pode treinar a natureza.",
    "Entender o sistema imune é entender a complexidade da vida em sua forma mais pura."
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl">
        <h1 className="text-3xl font-black mb-2">Olá, Futuro Profissional! 🩺</h1>
        <p className="opacity-90">Bem-vindo ao seu portal de estudos e diversão em Imunologia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-violet-400 flex items-center gap-2">
              <Quote className="w-5 h-5" /> Reflexão do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 italic text-lg">
              "{quotes[Math.floor(Math.random() * quotes.length)]}"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Curiosidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Você sabia que o corpo humano produz cerca de 100 bilhões de novos neutrófilos todos os dias? Eles são a linha de frente da sua imunidade inata!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-xl"><BookOpen className="text-blue-400" /></div>
          <div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-slate-500 uppercase font-bold">PDFs de Estudo</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="bg-violet-500/20 p-3 rounded-xl"><Trophy className="text-violet-400" /></div>
          <div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Partidas Ganhas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;