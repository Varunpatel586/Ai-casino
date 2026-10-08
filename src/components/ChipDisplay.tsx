import { User, ShieldCheck } from 'lucide-react';

interface ChipDisplayProps {
  chips: number;
  username: string;
}

export default function ChipDisplay({ chips = 0, username }: ChipDisplayProps) {
  const safeChips = typeof chips === 'number' && !isNaN(chips) ? chips : 0;
  return (
    <header className="w-full flex-shrink-0 z-50 bg-[#08060a]/95 backdrop-blur-md border-b border-amber-400/25 px-4 sm:px-6 py-2 select-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Player Credential Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0">
            <User size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70 font-semibold font-mono">
                Contestant
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" title="Connected" />
            </div>
            <div className="text-white font-bold text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>{username || 'Anonymous High-Roller'}</span>
              <ShieldCheck size={14} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            </div>
          </div>
        </div>

        {/* Center Hallmark with Game Name (Desktop only) */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1 rounded-full bg-[#1b0d18]/90 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-xs font-display font-black tracking-[0.2em] text-amber-200 uppercase">
          <span className="text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)] text-xs">♠</span>
          <span className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] text-xs">♥</span>
          <span className="white-metallic-text font-black tracking-[0.25em] text-sm">AI CASINO</span>
          <span className="text-amber-300 text-xs">♦</span>
          <span className="text-zinc-300 text-xs">♣</span>
        </div>

        {/* Tactile Casino Chip Balance */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#200e1c] to-[#120712] border border-amber-400/40 rounded-xl px-4 py-1.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.2)]">
          {/* Authentic Physical Golden Chip Graphic */}
          <div className="w-8 h-8 rounded-full border border-amber-200/90 bg-gradient-to-br from-[#fffbeb] via-[#f59e0b] to-[#b45309] shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-black font-mono">$</span>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-amber-200/80">
              Chip Bankroll
            </div>
            <div className="text-white font-black text-lg sm:text-2xl font-mono tabular-nums leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              ${safeChips.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
