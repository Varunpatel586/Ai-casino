import { User, ShieldCheck } from 'lucide-react';

interface ChipDisplayProps {
  chips: number;
  username: string;
}

export default function ChipDisplay({ chips = 0, username }: ChipDisplayProps) {
  const safeChips = typeof chips === 'number' && !isNaN(chips) ? chips : 0;
  return (
    <header className="w-full flex-shrink-0 z-50 bg-[#0E1118]/95 backdrop-blur-md border-b border-[#232938] px-4 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Player Credential Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#181D2A] border border-[#2B354D] flex items-center justify-center text-amber-400 shadow-inner">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono">
                Player
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
            </div>
            <div className="text-white font-bold text-base sm:text-lg tracking-wide flex items-center gap-1.5">
              <span>{username || 'Anonymous High-Roller'}</span>
              <ShieldCheck size={14} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Center Hallmark (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#141824] border border-[#262D3D] text-[11px] font-mono tracking-widest text-amber-400/80 uppercase">
          <span>AI Casino High-Stakes Lounge</span>
        </div>

        {/* Tactile Casino Chip Balance */}
        <div className="flex items-center gap-3 bg-[#141824] border border-amber-500/30 rounded-xl px-4 py-2 shadow-tactile">
          {/* Authentic Physical Chip Graphic */}
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
            <span className="text-xs font-black text-slate-950 font-mono">$</span>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-amber-400/90">
              Chip Bankroll
            </div>
            <div className="text-white font-black text-xl sm:text-2xl font-mono tabular-nums leading-none tracking-tight">
              ${safeChips.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
