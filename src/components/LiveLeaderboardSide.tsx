import { 
  Trophy, 
  Coins, 
  CheckCircle2, 
  Clock, 
  X, 
  Flame, 
  Bot, 
  Users 
} from 'lucide-react';
import { PlayerSeat, FeedRevealedData } from '../services/multiplayerSocket';

interface LiveLeaderboardSideProps {
  players: PlayerSeat[];
  currentFeedIndex?: number;
  totalFeeds?: number;
  status?: 'waiting' | 'betting' | 'playing' | 'revealing' | 'settled';
  currentPlayerId?: string;
  feedReveal?: FeedRevealedData | null;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export default function LiveLeaderboardSide({
  players,
  currentFeedIndex = 0,
  totalFeeds = 10,
  status = 'waiting',
  currentPlayerId,
  feedReveal,
  onClose,
  isMobileDrawer = false,
}: LiveLeaderboardSideProps) {
  // Sort players by chip count descending
  const sortedPlayers = [...players].sort((a, b) => b.chips - a.chips);
  const totalTableBankroll = players.reduce((sum, p) => sum + (p.chips || 0), 0);

  return (
    <aside 
      aria-label="Live Arena Standings"
      className={`flex flex-col casino-vip-card rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative ${
        isMobileDrawer ? 'w-full max-w-sm mx-auto' : 'w-full h-full max-h-full'
      }`}
    >
      <div className="card-neon-edge" />
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-surface-lowest via-[#141a27] to-surface-lowest border-b border-amber-500/25 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Trophy size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2CE] to-[#F4D068]">
                LIVE STANDINGS
              </h3>
            </div>
            <p className="text-[10px] font-mono text-amber-200/50">
              {players.length} of 6 Contestants Seated
            </p>
          </div>
        </div>

        {isMobileDrawer && onClose ? (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-lowest/80 hover:bg-[#1a2233] text-amber-200/70 hover:text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
            title="Close Standings"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-[9px] font-bold shadow-[0_0_8px_rgba(245,158,11,0.15)]">
            {status === 'playing' ? `Feed ${currentFeedIndex + 1}/${totalFeeds}` : status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Ranked Players List */}
      <div className="p-2 space-y-1.5 flex-1 min-h-0 overflow-y-auto max-h-full">
        {sortedPlayers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            <Users size={24} className="mx-auto mb-2 opacity-50 text-amber-400" />
            No players seated yet
          </div>
        ) : (
          sortedPlayers.map((player, idx) => {
            const isMe = player.playerId === currentPlayerId;
            const isBot = player.playerId.startsWith('bot-');

            // Rank Styling
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={player.playerId}
                className={`relative p-2.5 rounded-xl border transition-all duration-200 select-none ${
                  isMe
                    ? 'bg-gradient-to-r from-amber-500/15 via-[#181d2a] to-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,0.25)]'
                    : isFirst
                    ? 'bg-[#131926]/90 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-[#0E131E]/80 border-amber-500/15 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Rank & Moniker */}
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isFirst
                          ? 'bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#D4AF37] text-slate-950 font-black shadow-[0_0_10px_rgba(244,208,104,0.4)]'
                          : isSecond
                          ? 'bg-gradient-to-b from-slate-100 to-slate-400 text-slate-950 font-black'
                          : isThird
                          ? 'bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 font-black'
                          : 'bg-surface-lowest/90 text-slate-400 border border-amber-500/20'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Seat & Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono font-bold text-amber-400/70 px-1 py-0.2 rounded bg-surface-lowest border border-amber-500/20">
                          S{player.seatNumber}
                        </span>
                        <span className="text-xs font-display font-black text-white truncate">
                          {player.username}
                        </span>
                        {isMe && (
                          <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1 rounded border border-amber-400/30">
                            YOU
                          </span>
                        )}
                        {isBot && (
                          <span className="text-[8px] font-mono text-blue-300 bg-blue-500/20 px-1 rounded flex items-center gap-0.5">
                            <Bot size={8} />
                          </span>
                        )}
                      </div>

                      {/* In-Round Phase Status Tag */}
                      <div className="text-[9px] font-mono mt-0.5 flex items-center gap-1.5">
                        {status === 'betting' ? (
                          player.betAmount > 0 ? (
                            <span className="text-amber-400 font-bold">
                              Bet: ${player.betAmount}
                            </span>
                          ) : (
                            <span className="text-slate-500 animate-pulse">
                              Wager pending...
                            </span>
                          )
                        ) : status === 'playing' ? (
                          player.answerStatus === 'answered' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle2 size={9} />
                              <span>LOCKED</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <Clock size={9} className="animate-spin text-amber-400" />
                              <span>Thinking...</span>
                            </span>
                          )
                        ) : status === 'waiting' ? (
                          <span className={player.isReady ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {player.isReady ? 'READY ✓' : 'NOT READY'}
                          </span>
                        ) : (
                          <span className="text-slate-500 uppercase">{player.betStatus}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Chips & Delta Badge */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <Coins size={12} className="text-amber-400" />
                      <span className="font-mono font-black text-sm text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E]">
                        ${player.chips}
                      </span>
                    </div>

                    {/* Animated Delta Badge (when challenge reveals) */}
                    {(() => {
                      const revealMatch = feedReveal?.playerResults?.find(pr => pr.playerId === player.playerId);
                      const activeDelta = revealMatch ? revealMatch.netDelta : player.lastDelta;
                      const activeMultiplier = revealMatch ? revealMatch.multiplier : player.lastMultiplier;

                      if ((status === 'revealing' || !!feedReveal) && activeDelta !== undefined) {
                        return (
                          <span
                            className={`inline-block text-[10px] font-sans font-bold px-1.5 py-0.5 rounded mt-0.5 animate-fade-in ${
                              activeDelta > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                                : activeDelta < 0
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span>{activeDelta > 0 ? `+$${activeDelta}` : activeDelta < 0 ? `-$${Math.abs(activeDelta)}` : '$0 (Watching)'}</span>
                            {(activeMultiplier ?? 0) > 1 && activeDelta > 0 ? (
                              <span className="ml-0.5 text-amber-300 font-mono">⚡{activeMultiplier}x</span>
                            ) : null}
                          </span>
                        );
                      }

                      if (player.betAmount > 0 && status === 'playing') {
                        return (
                          <span className="text-[9px] font-mono text-amber-200/50">
                            At risk: ${player.betAmount}
                          </span>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Pot & Stats Footer */}
      <div className="p-3 bg-surface-lowest border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-amber-400" />
          <span className="text-amber-200/60">Total Table Bankroll:</span>
        </div>
        <span className="font-black text-amber-400 text-xs drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
          ${(totalTableBankroll ?? 0).toLocaleString()}
        </span>
      </div>
    </aside>
  );
}
