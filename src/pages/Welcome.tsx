import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
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
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.9)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-10 text-center max-w-2xl space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="flex gap-6 justify-center items-center animate-pulse">
          <img src={fsssLogo} alt="FSSS" className="h-20 md:h-24 object-contain" />
          <img src={enfLogo} alt="Enfermagem" className="h-20 md:h-24 object-contain" />
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