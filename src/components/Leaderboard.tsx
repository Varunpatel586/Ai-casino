import { Trophy, Medal, Award, DollarSign } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer: { username: string; chips: number };
  onPlayAgain: () => void;
}

export default function Leaderboard({ entries, currentPlayer, onPlayAgain }: LeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.chips - a.chips);
  const playerRank = sortedEntries.findIndex((e) => e.username === currentPlayer.username) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={32} />;
      case 2:
        return <Medal className="text-gray-300" size={32} />;
      case 3:
        return <Award className="text-orange-400" size={32} />;
      default:
        return <div className="text-white font-bold text-2xl">{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/30 to-yellow-600/30 border-yellow-400';
      case 2:
        return 'from-gray-400/30 to-gray-500/30 border-gray-400';
      case 3:
        return 'from-orange-500/30 to-orange-600/30 border-orange-400';
      default:
        return 'from-white/5 to-white/10 border-white/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12 px-4 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 mb-4">
            FINAL RESULTS
          </h1>
          <p className="text-2xl text-white/60">The chips have fallen. The winners are crowned.</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-3xl p-8 mb-12">
          <div className="text-center">
            <p className="text-white/60 text-xl mb-2">Your Performance</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <DollarSign className="text-yellow-400" size={48} />
              <div className="text-7xl font-black text-yellow-400">{currentPlayer.chips}</div>
            </div>
            <p className="text-white text-2xl mb-2">{currentPlayer.username}</p>
            <div className="inline-block bg-black/30 rounded-full px-6 py-2">
              <p className="text-cyan-400 text-xl font-bold">
                Rank: #{playerRank} of {sortedEntries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
          <h2 className="text-4xl font-black text-white mb-8 text-center">LEADERBOARD</h2>

          <div className="space-y-4">
            {sortedEntries.slice(0, 10).map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentPlayer = entry.username === currentPlayer.username;

              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-r ${getRankColor(rank)} border-2 rounded-2xl p-6 ${
                    isCurrentPlayer ? 'ring-4 ring-cyan-400 scale-105' : ''
                  } transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 flex items-center justify-center">{getRankIcon(rank)}</div>

                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold text-white">{entry.username}</p>
                          {isCurrentPlayer && (
                            <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-yellow-400" size={32} />
                        <span className="text-4xl font-black text-yellow-400">{entry.chips}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={onPlayAgain}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]"
          >
            PLAY AGAIN
          </button>

          <p className="text-white/40 text-sm">
            Thanks for playing AI Casino! Can you beat the machine next time?
          </p>
        </div>
      </div>
    </div>
  );
}
