import { Trophy, Medal, Award, RotateCcw, User } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer: { username: string; chips: number };
  onPlayAgain: () => void;
}

export default function Leaderboard({ entries, currentPlayer, onPlayAgain }: LeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.chips - a.chips);
  const playerRank = sortedEntries.findIndex((e) => e.username === currentPlayer.username) + 1;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Trophy size={20} />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-300/20 border border-slate-300/40 text-slate-200 flex items-center justify-center">
            <Medal size={20} />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-800/30 border border-amber-700/50 text-amber-500 flex items-center justify-center">
            <Award size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#181D2A] border border-[#232938] text-slate-400 font-mono font-bold text-sm flex items-center justify-center">
            #{rank}
          </div>
        );
    }
  };

  const getRankRowClass = (rank: number, isCurrentPlayer: boolean) => {
    if (isCurrentPlayer) {
      return 'bg-[#181D2A] border-2 border-amber-400 ring-2 ring-amber-400/20 shadow-lg';
    }
    if (rank === 1) {
      return 'bg-[#141824] border border-amber-500/40 hover:border-amber-500/70';
    }
    if (rank === 2) {
      return 'bg-[#12151E] border border-slate-400/30 hover:border-slate-400/50';
    }
    if (rank === 3) {
      return 'bg-[#12151E] border border-amber-700/30 hover:border-amber-700/50';
    }
    return 'bg-[#10131B] border border-[#232938] hover:border-slate-600/50';
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      <div className="max-w-4xl w-full h-full flex flex-col justify-between py-1 sm:py-2 overflow-hidden">
        {/* Header */}
        <div className="text-center flex-shrink-0 mb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <span>Tournament Settled // Final Standings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            The Champions Podium
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-lg mx-auto">
            The house edge was contested. Chips tallied and rankings locked.
          </p>
        </div>

        {/* Current Player Performance Spotlight */}
        <div className="bg-[#12151E] border border-amber-500/40 rounded-xl p-3 sm:p-4 mb-2 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#181D2A] border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                <User size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Player Performance
                </span>
                <h2 className="text-lg sm:text-xl font-display font-black text-white uppercase leading-tight">
                  {currentPlayer.username}
                </h2>
                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.2 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                  <span>Rank #{playerRank || 1} of {sortedEntries.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0E1118] border border-[#232938] rounded-lg px-4 py-2 text-right shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                Final Bankroll
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                ${currentPlayer.chips}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table with internal scroll */}
        <div className="bg-[#12151E] border border-[#232938] rounded-xl p-3 sm:p-4 mb-2 shadow-xl flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232938] flex-shrink-0">
            <h3 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" /> Top 10 High Rollers
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Live Tournament Ledger
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
            {sortedEntries.slice(0, 10).map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentPlayer = entry.username === currentPlayer.username;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${getRankRowClass(rank, isCurrentPlayer)}`}
                >
                  <div className="flex items-center gap-2.5">
                    {getRankBadge(rank)}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-white text-xs sm:text-sm">
                          {entry.username}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-mono font-black text-amber-400">
                      ${entry.chips}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center flex-shrink-0 mt-1">
          <button
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <RotateCcw size={16} /> Enter New Tournament
          </button>

          <p className="text-[10px] sm:text-xs font-mono text-slate-500 mt-1">
            THE AI CASINO // Machine Intelligence vs Human Intuition
          </p>
        </div>
      </div>
    </div>
  );
}
