import { Coins, Flame, AlertCircle } from 'lucide-react';
import { BetAmount } from '../types';

interface BettingPanelProps {
  currentChips: number;
  onBet: (amount: BetAmount) => void;
  disabled?: boolean;
  minBet?: number;
  maxBet?: number;
}

export default function BettingPanel({ currentChips, onBet, disabled, minBet = 10, maxBet = 100 }: BettingPanelProps) {
  const bets: { 
    amount: BetAmount; 
    label: string; 
    theme: {
      outerRing: string;
      innerBg: string;
      accentText: string;
      borderDashed: string;
      sublabel: string;
    }
  }[] = [
    { 
      amount: minBet as BetAmount, 
      label: `$${minBet}`, 
      theme: {
        outerRing: 'bg-gradient-to-b from-emerald-500 to-emerald-800 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
        innerBg: 'bg-[#091510]',
        accentText: 'text-emerald-400',
        borderDashed: 'border-emerald-400/60',
        sublabel: 'Standard Bet',
      }
    },
    { 
      amount: Math.min(maxBet, minBet * 3) as BetAmount, 
      label: `$${Math.min(maxBet, minBet * 3)}`, 
      theme: {
        outerRing: 'bg-gradient-to-b from-blue-500 to-indigo-800 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.35)]',
        innerBg: 'bg-[#080d1a]',
        accentText: 'text-blue-400',
        borderDashed: 'border-blue-400/60',
        sublabel: 'High Roller',
      }
    },
    { 
      amount: 'ALL_IN', 
      label: 'ALL IN', 
      theme: {
        outerRing: 'bg-gradient-to-b from-rose-500 via-crimson-deep to-amber-600 border-amber-300 shadow-[0_0_15px_rgba(225,29,72,0.45)]',
        innerBg: 'bg-[#1a050c]',
        accentText: 'text-amber-300',
        borderDashed: 'border-amber-300/80',
        sublabel: 'Maximum Risk',
      }
    },
  ].filter(bet => 
    bet.amount === 'ALL_IN' || 
    (typeof bet.amount === 'number' && bet.amount <= maxBet && bet.amount >= minBet)
  ) as {
    amount: BetAmount;
    label: string;
    theme: {
      outerRing: string;
      innerBg: string;
      accentText: string;
      borderDashed: string;
      sublabel: string;
    };
  }[];

  return (
    <div className="casino-vip-card rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden select-none">
      <div className="card-neon-edge" />

      {/* Table Baize Subtle Accent */}
      <div className="text-center mb-3 sm:mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-amber-400/40 text-[11px] uppercase tracking-[0.2em] font-mono font-bold text-amber-300 mb-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <Coins size={13} className="text-amber-400" />
          <span>Wager Placement</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight white-metallic-text">
          Select Table Wager
        </h3>
        <p className="text-amber-200/70 text-xs mt-0.5">
          Each correct answer yields <span className="text-emerald-400 font-semibold font-mono">+1x Bet</span>. Each wrong guess deducts <span className="text-rose-400 font-semibold font-mono">-1x Bet</span>.
        </p>
      </div>

      {/* 3D Tactile Casino Chips Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {bets.map((bet) => {
          const betValue = bet.amount === 'ALL_IN' ? Math.max(0, currentChips) : bet.amount;
          const canAfford = currentChips >= betValue && betValue > 0;
          const isAllIn = bet.amount === 'ALL_IN';

          return (
            <button
              key={bet.label}
              onClick={() => onBet(bet.amount)}
              disabled={disabled || !canAfford || currentChips <= 0}
              className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 outline-none
                ${canAfford && !disabled && currentChips > 0
                  ? 'bg-gradient-to-b from-[#220d1c] to-[#120510] border-amber-400/35 hover:border-amber-400/80 hover:-translate-y-1 active:translate-y-0.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.2)] cursor-pointer' 
                  : 'bg-[#10050d] border-[#1f0d1a] opacity-50 cursor-not-allowed'
                }`}
            >
              {/* The Physical Casino Chip Icon */}
              <div className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1.5 border-2 ${bet.theme.outerRing} shadow-chip mb-1.5 sm:mb-2 transition-transform group-hover:scale-105`}>
                {/* Milled Edge Notches (Dashed Ring) */}
                <div className={`w-full h-full rounded-full border-2 border-dashed ${bet.theme.borderDashed} ${bet.theme.innerBg} flex flex-col items-center justify-center`}>
                  {isAllIn ? (
                    <Flame className="text-amber-400 animate-pulse mb-0.5" size={16} />
                  ) : (
                    <span className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider">CHIP</span>
                  )}
                  <span className={`text-base sm:text-lg font-black font-mono leading-none tracking-tight ${bet.theme.accentText}`}>
                    {bet.label}
                  </span>
                </div>
              </div>

              {/* Sub-label & Value */}
              <div className="text-center">
                <div className="text-[11px] uppercase font-mono font-bold tracking-[0.16em] text-amber-200/90">
                  {bet.theme.sublabel}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Wager: <span className="text-zinc-200 font-bold">${(betValue ?? 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Disabled Lock Overlay */}
              {!canAfford && (
                <div className="absolute inset-0 bg-[#08040a]/90 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-2 text-center">
                  <AlertCircle size={18} className="text-rose-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-zinc-300">Insufficient Chips</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{currentChips <= 0 ? 'Bankroll: $0 (Watch mode)' : `Need $${betValue}`}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Chips Readout Bar */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-amber-400/20 flex flex-wrap justify-between items-center text-xs font-mono text-amber-200/70">
        <span>MIN WAGER: ${minBet}</span>
        <div className="flex items-center gap-2">
          <span>ACTIVE WALLET:</span>
          <span className="text-amber-300 font-bold text-sm tabular-nums">${(currentChips ?? 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
