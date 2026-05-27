"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Skull, Medal, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  current_value: number;
  is_eliminated: boolean;
}

interface MillionaireRankingProps {
  players: Player[];
  currentUserId: string | null;
}

const MillionaireRanking: React.FC<MillionaireRankingProps> = ({ players, currentUserId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.current_value - a.current_value);

  return (
    <div className="space-y-3">
      {sortedPlayers.map((player, index) => {
        const isTop3 = index < 3;
        const isMe = player.user_id === currentUserId;
        const isEliminated = player.is_eliminated;

        return (
          <div
            key={player.id}
            className={cn(
              "relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-500 group",
              isEliminated 
                ? "bg-red-950/20 border-red-900/30 opacity-50 grayscale" 
                : isMe 
                  ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : "bg-white/5 border-white/10 hover:bg-white/10",
              isTop3 && !isEliminated && "border-yellow-500/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className={cn(
                  "absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10 border shadow-lg",
                  index === 0 ? "bg-yellow-500 border-yellow-400 text-slate-950" :
                  index === 1 ? "bg-slate-300 border-slate-200 text-slate-950" :
                  index === 2 ? "bg-orange-500 border-orange-400 text-slate-950" :
                  "bg-slate-800 border-white/10 text-slate-400"
                )}>
                  {index + 1}
                </span>
                <Avatar className={cn(
                  "w-10 h-10 border-2 transition-transform duration-500 group-hover:scale-110",
                  isMe ? "border-blue-500" : "border-white/10"
                )}>
                  <AvatarImage src={player.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-slate-800 text-xs font-black text-white">
                    {player.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col">
                <span className={cn(
                  "text-xs font-black tracking-tight flex items-center gap-1",
                  isMe ? "text-white" : "text-slate-300"
                )}>
                  {player.name.split(' ')[0]}
                  {isMe && <User className="w-3 h-3 text-blue-400" />}
                </span>
                <div className="flex items-center gap-1">
                  {isEliminated ? (
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <Skull className="w-2 h-2" /> ELIMINADO
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-tighter">
                      R$ {player.current_value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {index === 0 && !isEliminated && <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />}
              {isTop3 && !isEliminated && index > 0 && <Medal className={cn("w-4 h-4", index === 1 ? "text-slate-300" : "text-orange-500")} />}
            </div>
          </div>
        );
      })}
      
      {players.length === 0 && (
        <div className="text-center py-8 space-y-2 opacity-30">
          <Users className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Aguardando Candidatos...</p>
        </div>
      )}
    </div>
  );
};

export default MillionaireRanking;