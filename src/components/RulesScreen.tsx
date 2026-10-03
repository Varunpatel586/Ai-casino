import { Coins, Target, Calculator, Gift, Eye, Video, MessageSquare, ArrowRight, Shield } from 'lucide-react';

interface RulesScreenProps {
  onContinue: () => void;
}

export default function RulesScreen({ onContinue }: RulesScreenProps) {
  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="w-full max-w-5xl h-full flex flex-col justify-between py-2 sm:py-3">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#181D2A] border border-[#2B354D] text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <Shield size={12} />
            <span>Official Tournament Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-tight uppercase">
            TABLE RULES &amp; PAYOUTS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            High stakes reward perception, logic, and nerve across 3 tournament stages.
          </p>
        </div>

        {/* 2-Column Main Content to Fit Screen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-auto overflow-hidden">
          {/* Left Column: 4 Core Pillars Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Starting Bankroll</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Standard Buy-In</span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                Every contestant enters with exactly <span className="text-amber-400 font-mono font-bold">$50</span> in casino chips.
              </p>
            </div>

            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Target size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Wagering Limits</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Per Challenge</span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                Wager <span className="text-blue-400 font-mono font-bold">$10</span>, <span className="text-blue-400 font-mono font-bold">$30</span>, or <span className="text-rose-400 font-mono font-bold">ALL IN</span> with your entire wallet.
              </p>
            </div>

            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calculator size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">Scoring Formula</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Settled Math</span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                Correct answers win <span className="text-emerald-400 font-mono font-bold">+1x Bet</span>. Wrong guesses deduct <span className="text-rose-400 font-mono font-bold">-1x Bet</span>.
              </p>
            </div>

            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Gift size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">High-Roller Vault</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Intermission</span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                Play Roulette, Card Flip, Dice, or Mines between rounds to multiply chips.
              </p>
            </div>
          </div>

          {/* Right Column: Tournament Schedule & Pay Table Example */}
          <div className="flex flex-col justify-between gap-2.5">
            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-3 shadow-sm">
              <h2 className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 mb-2">
                Tournament Stages Schedule
              </h2>

              <div className="space-y-1.5">
                <div className="bg-[#181D2A] border border-[#283248] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-[10px]">
                      01
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                        <Video size={13} className="text-blue-400" />
                        Round 1: Reality Bet
                      </h4>
                      <p className="text-[10px] text-slate-400">5 Image + 5 Video Feeds. Spot Real Life vs AI.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#12151E] px-2 py-0.5 rounded border border-[#232938]">
                    10 Feeds • Up to 5x Speed
                  </span>
                </div>

                <div className="bg-[#181D2A] border border-[#283248] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-[10px]">
                      02
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                        <Eye size={13} className="text-amber-400" />
                        Round 2: Prompt Gambit
                      </h4>
                      <p className="text-[10px] text-slate-400">Compose text prompts to reverse-engineer AI art.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#12151E] px-2 py-0.5 rounded border border-[#232938]">
                    5 Challenges • 60s
                  </span>
                </div>

                <div className="bg-[#181D2A] border border-[#283248] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-mono font-bold text-[10px]">
                      03
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-rose-400" />
                        Round 3: Turing Table
                      </h4>
                      <p className="text-[10px] text-slate-400">Blind chat interrogation against Human or AI.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#12151E] px-2 py-0.5 rounded border border-[#232938]">
                    3 Subrounds • 3 msgs
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Table Settlement Example */}
            <div className="bg-[#10131B] border border-amber-500/20 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1.5">
                <span>Settlement Math Example</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-[#161B26] p-1.5 rounded-lg border border-[#232A3B]">
                  <span className="text-[10px] text-slate-500 block">Wager</span>
                  <span className="text-white font-bold text-xs">$10</span>
                </div>
                <div className="bg-[#161B26] p-1.5 rounded-lg border border-[#232A3B]">
                  <span className="text-[10px] text-slate-500 block">Correct (4)</span>
                  <span className="text-emerald-400 font-bold text-xs">+$40</span>
                </div>
                <div className="bg-[#161B26] p-1.5 rounded-lg border border-[#232A3B]">
                  <span className="text-[10px] text-slate-500 block">Wrong (1)</span>
                  <span className="text-rose-400 font-bold text-xs">-$10</span>
                </div>
                <div className="bg-[#182030] p-1.5 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block font-bold">Net</span>
                  <span className="text-amber-300 font-black text-xs">+$30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center flex-shrink-0 mt-1">
          <button
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>I UNDERSTAND — ENTER LIVE TABLE</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
