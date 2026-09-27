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
        outerRing: 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-400',
        innerBg: 'bg-[#0E1B16]',
        accentText: 'text-emerald-400',
        borderDashed: 'border-emerald-500/60',
        sublabel: 'Standard Bet',
      }
    },
    { 
      amount: Math.min(maxBet, minBet * 3) as BetAmount, 
      label: `$${Math.min(maxBet, minBet * 3)}`, 
      theme: {
        outerRing: 'bg-gradient-to-b from-blue-600 to-indigo-800 border-blue-400',
        innerBg: 'bg-[#0E1424]',
        accentText: 'text-blue-400',
        borderDashed: 'border-blue-500/60',
        sublabel: 'High Roller',
      }
    },
    { 
      amount: 'ALL_IN', 
      label: 'ALL IN', 
      theme: {
        outerRing: 'bg-gradient-to-b from-rose-600 via-rose-700 to-amber-700 border-rose-400',
        innerBg: 'bg-[#220B11]',
        accentText: 'text-amber-400',
        borderDashed: 'border-amber-400/80',
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
    <div className="bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Table Baize Subtle Accent */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-amber-400/90 mb-2">
          <Coins size={14} />
          <span>Wager Placement</span>
        </div>
        <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight">
          Select Table Wager
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Each correct answer yields <span className="text-emerald-400 font-semibold font-mono">+1x Bet</span>. Each wrong guess deducts <span className="text-rose-400 font-semibold font-mono">-1x Bet</span>.
        </p>
      </div>

      {/* 3D Tactile Casino Chips Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {bets.map((bet) => {
          const betValue = bet.amount === 'ALL_IN' ? currentChips : bet.amount;
          const canAfford = currentChips >= betValue;
          const isAllIn = bet.amount === 'ALL_IN';

          return (
            <button
              key={bet.label}
              onClick={() => onBet(bet.amount)}
              disabled={disabled || !canAfford}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 outline-none
                ${canAfford && !disabled 
                  ? 'bg-[#181D2A] border-[#2E374D] hover:border-amber-500/50 hover:bg-[#1E2435] hover:-translate-y-1 active:translate-y-0.5 shadow-tactile active:shadow-tactile-pressed cursor-pointer' 
                  : 'bg-[#10131B] border-[#1C2230] opacity-50 cursor-not-allowed'
                }`}
            >
              {/* The Physical Casino Chip Icon */}
              <div className={`relative w-24 h-24 rounded-full p-2 border-2 ${bet.theme.outerRing} shadow-chip mb-3 transition-transform group-hover:scale-105`}>
                {/* Milled Edge Notches (Dashed Ring) */}
                <div className={`w-full h-full rounded-full border-2 border-dashed ${bet.theme.borderDashed} ${bet.theme.innerBg} flex flex-col items-center justify-center`}>
                  {isAllIn ? (
                    <Flame className="text-amber-400 animate-pulse mb-0.5" size={20} />
                  ) : (
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">CHIP</span>
                  )}
                  <span className={`text-xl font-black font-mono leading-none tracking-tight ${bet.theme.accentText}`}>
                    {bet.label}
                  </span>
                </div>
              </div>

              {/* Sub-label & Value */}
              <div className="text-center">
                <div className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300">
                  {bet.theme.sublabel}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Wager: <span className="text-slate-300 font-bold">${betValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Disabled Lock Overlay */}
              {!canAfford && (
                <div className="absolute inset-0 bg-[#090A0F]/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-3 text-center">
                  <AlertCircle size={20} className="text-rose-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-slate-300">Insufficient Chips</span>
                  <span className="text-[10px] text-slate-500 font-mono">Need ${betValue}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Chips Readout Bar */}
      <div className="mt-8 pt-4 border-t border-[#232938] flex flex-wrap justify-between items-center text-xs font-mono text-slate-400">
        <span>MIN WAGER: ${minBet}</span>
        <div className="flex items-center gap-2">
          <span>ACTIVE WALLET:</span>
          <span className="text-amber-400 font-bold text-sm tabular-nums">${currentChips.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
