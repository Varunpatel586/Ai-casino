import { useEffect } from 'react';
import { Trophy, Medal, Award, RotateCcw, User } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { signOutPuter } from '../services/huggingFaceService';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer: { username: string; chips: number };
  onPlayAgain: () => void;
}

export default function Leaderboard({ entries, currentPlayer, onPlayAgain }: LeaderboardProps) {
  useEffect(() => {
    // Ensure player is signed out of Puter at game end
    signOutPuter();
  }, []);

  const sortedEntries = [...entries].sort((a, b) => b.chips - a.chips);
  const playerRank = sortedEntries.findIndex((e) => e.username === currentPlayer.username) + 1;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shadow-[0_0_14px_rgba(245,158,11,0.4)]">
            <Trophy size={20} />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-300/20 border border-slate-300/50 text-slate-200 flex items-center justify-center shadow-[0_0_12px_rgba(203,213,225,0.3)]">
            <Medal size={20} />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-700/25 border border-amber-600/40 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(180,83,9,0.3)]">
            <Award size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#180c19] border border-amber-400/20 text-zinc-400 font-mono font-bold text-sm flex items-center justify-center">
            #{rank}
          </div>
        );
    }
  };

  const getRankRowClass = (rank: number, isCurrentPlayer: boolean) => {
    if (isCurrentPlayer) {
      return 'bg-gradient-to-r from-[#2e1226] to-[#1a0a18] border-2 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.35)]';
    }
    if (rank === 1) {
      return 'bg-gradient-to-r from-[#240e1e] to-[#150714] border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400';
    }
    if (rank === 2) {
      return 'bg-[#180b18]/90 border border-slate-300/35 hover:border-slate-300/60';
    }
    if (rank === 3) {
      return 'bg-[#180b18]/90 border border-amber-700/35 hover:border-amber-700/60';
    }
    return 'bg-[#130713]/80 border border-amber-400/15 hover:border-amber-400/40';
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-4xl w-full h-full flex flex-col justify-between py-1 sm:py-2 overflow-hidden">
        {/* Header */}
        <div className="text-center flex-shrink-0 mb-1">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1b0d18]/90 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <span>✨ Tournament Settled // Final Standings</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase tracking-tight white-metallic-text">
            The Champions Podium
          </h1>
          <p className="text-amber-200/70 text-xs sm:text-sm font-sans max-w-lg mx-auto">
            The house edge was contested. Chips tallied and rankings locked.
          </p>
        </div>

        {/* Current Player Performance Spotlight */}
        <div className="casino-vip-card rounded-xl p-3 sm:p-4 mb-2 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="card-neon-edge" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0">
                <User size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-200/70 block">
                  Player Performance
                </span>
                <h2 className="text-lg sm:text-xl font-display font-black text-white uppercase leading-tight">
                  {currentPlayer.username}
                </h2>
                <div className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold shadow-sm">
                  <span>Rank #{playerRank || 1} of {sortedEntries.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#150715] border border-amber-400/35 rounded-lg px-4 py-2 text-right shrink-0 shadow-inner">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-200/70 block">
                Final Bankroll
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-none">
                ${currentPlayer.chips}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table with internal scroll */}
        <div className="casino-vip-card rounded-xl p-3 sm:p-4 mb-2 shadow-xl flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-400/20 flex-shrink-0">
            <h3 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" /> Top 10 High Rollers
            </h3>
            <span className="text-[10px] font-mono text-amber-200/70 tracking-wider">
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
                          <span className="text-[9px] font-mono font-black bg-gradient-to-r from-amber-300 to-amber-500 text-black px-1.5 py-0.2 rounded uppercase shadow-sm">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-mono font-black text-amber-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
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
            className="btn-marquee-gold inline-flex items-center justify-center gap-2 py-3 px-8 text-black font-extrabold text-sm sm:text-base uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50"
          >
            <RotateCcw size={16} /> Enter New Tournament
          </button>

          <p className="text-[10px] sm:text-xs font-mono text-amber-200/60 mt-1 tracking-wider uppercase">
            THE AI CASINO // Machine Intelligence vs Human Intuition
          </p>
        </div>
      </div>
    </div>
  );
}
