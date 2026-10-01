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
import { PlayerSeat } from '../services/multiplayerSocket';

interface LiveLeaderboardSideProps {
  players: PlayerSeat[];
  currentFeedIndex?: number;
  totalFeeds?: number;
  status?: 'waiting' | 'betting' | 'playing' | 'revealing' | 'settled';
  currentPlayerId?: string;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export default function LiveLeaderboardSide({
  players,
  currentFeedIndex = 0,
  totalFeeds = 15,
  status = 'waiting',
  currentPlayerId,
  onClose,
  isMobileDrawer = false,
}: LiveLeaderboardSideProps) {
  // Sort players by chip count descending
  const sortedPlayers = [...players].sort((a, b) => b.chips - a.chips);
  const totalTableBankroll = players.reduce((sum, p) => sum + (p.chips || 0), 0);

  return (
    <aside 
      aria-label="Live Arena Standings"
      className={`flex flex-col bg-[#0B0F19]/95 backdrop-blur-md border border-[#222C3E] rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.85)] ${
        isMobileDrawer ? 'w-full max-w-sm mx-auto' : 'w-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#141A29] to-[#0E1320] border-b border-[#20293D] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
            <Trophy size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-200">
                LIVE STANDINGS
              </h3>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {players.length} of 6 Contestants Seated
            </p>
          </div>
        </div>

        {isMobileDrawer && onClose ? (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#222C40] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Standings"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[9px] font-bold">
            {status === 'playing' ? `Feed ${currentFeedIndex + 1}/${totalFeeds}` : status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Ranked Players List */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[540px]">
        {sortedPlayers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
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
                className={`relative p-2.5 rounded-2xl border transition-all duration-200 select-none ${
                  isMe
                    ? 'bg-[#151D2D]/95 border-amber-400/80 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : isFirst
                    ? 'bg-[#121824]/90 border-amber-500/40 shadow-sm'
                    : 'bg-[#0E131E]/80 border-[#1E273A] hover:border-[#2B374E]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Rank & Moniker */}
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-[#182133] text-slate-400 border border-[#232D42]'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Seat & Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 px-1 py-0.2 rounded bg-[#161D2B]">
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
                      <span className="font-mono font-black text-sm text-amber-400">
                        ${player.chips}
                      </span>
                    </div>

                    {/* Animated Delta Badge (when challenge reveals) */}
                    {player.lastDelta !== undefined ? (
                      <span
                        className={`inline-block text-[9px] font-mono font-black px-1.5 py-0.2 rounded mt-0.5 animate-fade-in ${
                          player.lastDelta >= 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {player.lastDelta >= 0 ? `+$${player.lastDelta}` : `-$${Math.abs(player.lastDelta)}`}
                        {player.lastMultiplier && player.lastMultiplier > 1 && player.lastDelta > 0 && (
                          <span className="ml-0.5 text-amber-300">⚡{player.lastMultiplier}x</span>
                        )}
                      </span>
                    ) : player.betAmount > 0 && status === 'playing' ? (
                      <span className="text-[9px] font-mono text-slate-400">
                        At risk: ${player.betAmount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Pot & Stats Footer */}
      <div className="p-3 bg-[#080B12] border-t border-[#1C2436] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-amber-400" />
          <span>Total Table Bankroll:</span>
        </div>
        <span className="font-black text-amber-400 text-xs">
          ${totalTableBankroll.toLocaleString()}
        </span>
      </div>
    </aside>
  );
}
