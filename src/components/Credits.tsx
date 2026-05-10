import React from 'react';
import { Instagram } from 'lucide-react';

const Credits = () => {
  return (
    <div className="mt-8 text-center space-y-1 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">Desenvolvido por</p>
        <p className="text-white text-xs font-black tracking-tight">Matheus Souza</p>
      </div>
      <div className="flex items-center justify-center gap-2 py-1">
        <span className="h-px w-6 bg-slate-800" />
        <p className="text-violet-400 text-[9px] font-black uppercase tracking-widest">ENFERMAGEM - FSSS</p>
        <span className="h-px w-6 bg-slate-800" />
      </div>
      <a 
        href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-pink-500 transition-all text-[10px] mt-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 hover:border-pink-500/30"
      >
        <Instagram className="w-3 h-3" /> 
        <span className="font-bold">@theu_souz2</span>
      </a>
    </div>
  );
};

export default Credits;