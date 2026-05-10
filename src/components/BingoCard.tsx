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
    <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-md mx-auto">
      {terms.map((term, index) => {
        const isFree = index === 12;
        const isMarked = isFree || markedTerms.includes(term);
        
        return (
          <button
            key={index}
            disabled={disabled || isFree}
            onClick={() => onMark(term)}
            className={cn(
              "aspect-square flex items-center justify-center text-[10px] md:text-xs font-bold p-1 rounded-lg transition-all duration-200 border-2 shadow-sm",
              isFree 
                ? "bg-violet-600 border-violet-400 text-white animate-pulse" 
                : isMarked
                  ? "bg-emerald-500 border-emerald-300 text-white scale-95 shadow-inner"
                  : "bg-white border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-slate-50 active:scale-95"
            )}
          >
            <span className="text-center break-words">
              {isFree ? "CÉLULA LIVRE" : term}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BingoCard;