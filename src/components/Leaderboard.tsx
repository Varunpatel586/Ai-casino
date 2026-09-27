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
    <div className="min-h-screen casino-table-bg py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <span>Tournament Settled // Final Standings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight mb-2">
            The Champions Podium
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-lg mx-auto">
            The house edge was contested. The chips have been tallied and the rankings locked.
          </p>
        </div>

        {/* Current Player Performance Spotlight */}
        <div className="bg-[#12151E] border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-[#181D2A] border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <User size={32} />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Player Performance
                </span>
                <h2 className="text-2xl font-display font-black text-white uppercase">
                  {currentPlayer.username}
                </h2>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  <span>Tournament Rank #{playerRank || 1} of {sortedEntries.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0E1118] border border-[#232938] rounded-xl px-6 py-4 text-center sm:text-right min-w-[200px]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">
                Final Bankroll
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                ${currentPlayer.chips}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5">
                Tournament Settled
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#12151E] border border-[#232938] rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#232938]">
            <h3 className="text-lg font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" /> Top 10 High Rollers
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Live Tournament Ledger
            </span>
          </div>

          <div className="space-y-3">
            {sortedEntries.slice(0, 10).map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentPlayer = entry.username === currentPlayer.username;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl transition-all ${getRankRowClass(rank, isCurrentPlayer)}`}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    {getRankBadge(rank)}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-base">
                          {entry.username}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-mono font-black text-amber-400">
                      ${entry.chips}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      chips
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center space-y-3">
          <button
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 py-4 px-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <RotateCcw size={18} /> Enter New Tournament
          </button>

          <p className="text-xs font-mono text-slate-500">
            THE TURING CASINO // Machine Intelligence vs Human Intuition
          </p>
        </div>
      </div>
    </div>
  );
}
