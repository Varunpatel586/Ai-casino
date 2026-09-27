import { Trophy, Coins, Brain, ChevronRight, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-amber-500/10 pointer-events-none -top-40 -right-40" />
      <div className="absolute w-[800px] h-[800px] rounded-full border border-amber-500/5 pointer-events-none -bottom-60 -left-60" />

      <div className="relative z-10 text-center max-w-4xl mx-auto py-12">
        {/* Tournament Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-8 shadow-sm">
          <Sparkles size={14} className="text-amber-400" />
          <span>The Ultimate Turing Tournament</span>
        </div>

        {/* Main Title */}
        <div className="mb-6">
          <h1 className="text-6xl sm:text-8xl font-display font-black tracking-tight uppercase text-white leading-none">
            THE TURING
          </h1>
          <span className="text-5xl sm:text-7xl font-display font-black tracking-widest uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent block mt-1">
            CASINO
          </span>
        </div>

        {/* Subtitle / Premise */}
        <div className="max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xl sm:text-2xl text-slate-200 font-light tracking-wide">
            Where Human Intuition Bets Against Artificial Intellect
          </p>
          <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">
            Perception • Deduction • High-Stakes Wagering
          </p>
        </div>

        {/* Tournament Specs / Plaques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 text-left shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Buy-In Bankroll</span>
              <Coins className="text-amber-400" size={18} />
            </div>
            <div className="text-3xl font-mono font-black text-white">$50</div>
            <div className="text-xs text-slate-500 mt-1">Virtual starting chips</div>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 text-left shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Tournament Stages</span>
              <Brain className="text-blue-400" size={18} />
            </div>
            <div className="text-3xl font-mono font-black text-white">3 Rounds</div>
            <div className="text-xs text-slate-500 mt-1">Vision, Video & Live Chat</div>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 text-left shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">High-Roller Vault</span>
              <Trophy className="text-emerald-400" size={18} />
            </div>
            <div className="text-3xl font-mono font-black text-white">Bonus Games</div>
            <div className="text-xs text-slate-500 mt-1">Wheel, Cards, Dice & Mines</div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xl uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>ENTER CASINO FLOOR</span>
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={24} />
          </button>
        </div>

        <div className="mt-8 text-xs font-mono text-slate-500">
          SECURE PROTOCOL • 100% PROVABLY COMPETITIVE • GLOBAL LEADERBOARD
        </div>
      </div>
    </div>
  );
}
