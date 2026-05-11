import React from 'react';
import { cn } from '@/lib/utils';

interface BingoCardProps {
  terms: string[];
  markedTerms: string[];
  onMark: (term: string) => void;
  disabled?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ terms, markedTerms, onMark, disabled }) => {
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-lg mx-auto">
      {terms.map((term, index) => {
        const isMarked = markedTerms.includes(term);
        
        return (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onMark(term)}
            className={cn(
              "aspect-square flex items-center justify-center text-[10px] md:text-xs font-black p-2 rounded-2xl transition-all duration-300 border-2 shadow-lg relative overflow-hidden group",
              isMarked
                ? "bg-emerald-500 border-emerald-400 text-white scale-95 shadow-emerald-900/20"
                : "bg-slate-900/40 border-white/10 text-slate-300 hover:border-violet-500/50 hover:bg-slate-800/60 active:scale-95"
            )}
          >
            {/* Efeito de brilho interno quando marcado */}
            {isMarked && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
            
            <span className="text-center break-words leading-tight z-10 uppercase tracking-tighter">
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