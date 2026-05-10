import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';
import Credits from '@/components/Credits';
import loginBg from '@/assets/login-bg.png';
import enfLogo from '@/assets/enf.png';
import fsssLogo from '@/assets/fsss.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.85)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-10 text-center max-w-2xl space-y-10 animate-in fade-in zoom-in duration-1000 mb-20">
        <div className="flex gap-8 justify-center items-center">
          <img src={fsssLogo} alt="FSSS" className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <img src={enfLogo} alt="Enfermagem" className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            IMUNO<span className="text-violet-500 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]">BINGO</span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-200 font-bold italic leading-relaxed max-w-xl mx-auto">
            "A imunologia é a arte de distinguir o 'eu' do 'outro' para proteger a essência da vida."
          </p>
        </div>

        <div className="relative inline-block group">
          <div className="absolute -inset-4 bg-violet-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
          <Button 
            onClick={() => navigate('/login')}
            size="lg"
            className="relative bg-white text-slate-950 hover:bg-violet-600 hover:text-white transition-all duration-500 px-16 py-10 rounded-[2rem] font-black text-2xl group shadow-2xl animate-bounce hover:animate-none"
            style={{ animationDuration: '3s' }}
          >
            <Sparkles className="mr-3 h-6 w-6 text-violet-500 group-hover:text-white" />
            INICIAR JORNADA
            <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-3 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 w-full">
        <Credits />
      </div>
    </div>
  );
};

export default Welcome;