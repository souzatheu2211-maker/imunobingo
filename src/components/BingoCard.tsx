import React from 'react';
import { cn } from '@/lib/utils';

interface BingoCardProps {
  terms: string[];
  markedTerms: string[];
  onMark: (term: string) => void;
  disabled?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ terms, markedTerms, onMark, disabled }) => {
  // Garantimos que apenas os primeiros 16 termos sejam exibidos, caso venha algo a mais do banco
  const displayTerms = terms.slice(0, 16);

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-md mx-auto">
      {displayTerms.map((term, index) => {
        const isMarked = markedTerms.includes(term);
        
        return (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onMark(term)}
            className={cn(
              "aspect-square flex items-center justify-center p-1.5 rounded-xl md:rounded-2xl transition-all duration-300 border-2 shadow-lg relative overflow-hidden group",
              isMarked
                ? "bg-emerald-500 border-emerald-400 text-white scale-95 shadow-emerald-900/20"
                : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-violet-500/50 hover:bg-slate-800/80 active:scale-95"
            )}
          >
            {/* Efeito de brilho interno quando marcado */}
            {isMarked && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
            
            <span className={cn(
              "text-center leading-[1.1] z-10 uppercase tracking-tighter font-black break-words px-0.5",
              term.length > 12 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-[11px]"
            )}>
              {term}
            </span>

            {/* Indicador visual de hover */}
            {!isMarked && !disabled && (
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BingoCard;