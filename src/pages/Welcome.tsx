import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import Credits from '@/components/Credits';
import loginBg from '@/assets/login-bg.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.9)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-10 text-center max-w-2xl space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="mx-auto w-20 h-20 bg-violet-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)] animate-bounce">
          <ShieldCheck className="text-white w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            IMUNO<span className="text-violet-500">BINGO</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium italic leading-relaxed">
            "A imunologia é a arte de distinguir o 'eu' do 'outro' para proteger a essência da vida."
          </p>
        </div>

        <Button 
          onClick={() => navigate('/login')}
          size="lg"
          className="bg-white text-slate-950 hover:bg-violet-500 hover:text-white transition-all duration-500 px-12 py-8 rounded-2xl font-black text-xl group shadow-2xl"
        >
          INICIAR JORNADA
          <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
        </Button>
      </div>

      <div className="absolute bottom-10 w-full">
        <Credits />
      </div>
    </div>
  );
};

export default Welcome;