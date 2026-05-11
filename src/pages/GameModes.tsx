import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, ShieldAlert, Microscope, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const GameModes = () => {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'bingo',
      title: 'Bingo Multiplayer',
      description: 'O clássico modo de sorteio e marcação de termos imunológicos.',
      icon: Gamepad2,
      color: 'violet',
      path: '/bingo'
    },
    {
      id: 'battle',
      title: 'Batalha Imunológica',
      description: 'Enfrente outros jogadores em um combate estratégico de perguntas e respostas.',
      icon: ShieldAlert,
      color: 'blue',
      path: '/battle'
    },
    {
      id: 'diagnosis',
      title: 'Missão Diagnóstico',
      description: 'Resolva casos clínicos reais e teste seu raciocínio diagnóstico.',
      icon: Microscope,
      color: 'emerald',
      path: '/diagnosis'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-violet-400 text-xs font-black uppercase tracking-widest">Central de Comando</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">MODOS DE <span className="text-violet-500">JOGO</span></h1>
        <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">Escolha sua estratégia e prepare-se para a imersão no laboratório.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            onClick={() => navigate(mode.path)}
            className={cn(
              "bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 group hover:scale-105 hover:bg-white/10 border-t-white/20",
              `hover:shadow-2xl hover:shadow-${mode.color}-500/20`
            )}
          >
            <div className={cn("h-2 w-full", `bg-${mode.color}-500`)} />
            <CardContent className="p-8 space-y-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12",
                `bg-${mode.color}-500/20 border border-${mode.color}-500/20`
              )}>
                <mode.icon className={cn("w-8 h-8", `text-${mode.color}-400`)} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">{mode.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{mode.description}</p>
              </div>

              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                Acessar Modo <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameModes;