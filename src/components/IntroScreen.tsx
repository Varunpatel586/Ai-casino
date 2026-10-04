import { Trophy, Coins, Brain, ChevronRight, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Background Decorative Rings & Ambient Lighting */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none -top-16 -right-16" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[90px] pointer-events-none -bottom-16 -left-16" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[90px] pointer-events-none bottom-10 right-10" />
      <div className="absolute w-[500px] h-[500px] rounded-full border border-amber-500/15 pointer-events-none -top-32 -right-32" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-emerald-500/10 pointer-events-none -bottom-48 -left-48" />

      <div className="relative z-10 text-center max-w-4xl mx-auto w-full h-full flex flex-col justify-between items-center py-2 sm:py-4">
        {/* Top Header & Title */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-sm">
            <Sparkles size={13} className="text-amber-400" />
            <span>The Ultimate AI Casino Tournament</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight uppercase text-white leading-none">
            THE AI
          </h1>
          <span className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-widest uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent block mt-0.5">
            CASINO
          </span>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light tracking-wide mt-2">
            Where Human Intuition Bets Against Artificial Intellect
          </p>
          <p className="text-[11px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            Perception • Deduction • High-Stakes Wagering
          </p>
        </div>

        {/* Tournament Specs / Plaques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl w-full my-auto">
          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-3 sm:p-4 text-left shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Buy-In Bankroll</span>
              <Coins className="text-amber-400" size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">$50</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Virtual starting chips</div>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-3 sm:p-4 text-left shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Tournament Stages</span>
              <Brain className="text-blue-400" size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">3 Rounds</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Vision, Video & Live Chat</div>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-3 sm:p-4 text-left shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">High-Roller Vault</span>
              <Trophy className="text-emerald-400" size={16} />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">Bonus Games</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Wheel, Cards, Dice & Mines</div>
          </div>
        </div>

        {/* Primary CTA Button & Protocol footer */}
        <div className="flex flex-col items-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base sm:text-lg uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>ENTER CASINO FLOOR</span>
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={20} />
          </button>

          <div className="mt-2.5 text-[10px] sm:text-xs font-mono text-slate-500">
            SECURE PROTOCOL • 100% PROVABLY COMPETITIVE • GLOBAL LEADERBOARD
          </div>
        </div>
      </div>
    </div>
  );
}
