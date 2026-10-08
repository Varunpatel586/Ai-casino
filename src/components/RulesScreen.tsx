import { Coins, Target, Calculator, Gift, Eye, Video, MessageSquare, ArrowRight, Shield, Sparkles, TrendingUp, Clock } from 'lucide-react';

interface RulesScreenProps {
  onContinue: () => void;
}

export default function RulesScreen({ onContinue }: RulesScreenProps) {
  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-hidden select-none">
      <div className="w-full max-w-6xl h-full flex flex-col justify-between py-1 sm:py-2 md:py-3 overflow-hidden">
        {/* Header */}
        <div className="text-center flex-shrink-0 mb-0.5 sm:mb-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-0.5 sm:py-1 rounded-full bg-[#1b0d18]/90 border border-amber-400/45 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-0.5">
            <Shield size={12} className="text-amber-400" />
            <span>Official Tournament Protocol</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black tracking-tight uppercase white-metallic-text">
            TABLE RULES &amp; PAYOUTS
          </h1>
          <p className="text-amber-200/70 text-[10px] sm:text-xs font-sans max-w-xl mx-auto">
            High-stakes wagering across 3 discernment stages: media perception, reverse-prompt engineering, and live Turing interrogation.
          </p>
        </div>

        {/* 2-Column Main Content to Fit Screen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 flex-1 min-h-0 items-stretch overflow-hidden py-1">
          {/* Left Column: 4 Core Pillars Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 h-full">
            {/* Card 1: Starting Bankroll */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between relative overflow-hidden group border border-amber-500/25">
              <div className="card-neon-edge" />
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0">
                    <Coins size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">Starting Bankroll</h3>
                    <span className="text-[8px] sm:text-[9px] font-mono text-amber-300/80 uppercase tracking-wider">Buy-In Allocation</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[8px] sm:text-[9px] font-mono text-amber-300 font-bold shrink-0">
                  50 CHIPS
                </span>
              </div>

              {/* Visual Metric Block */}
              <div className="my-1 py-1.5 px-2.5 rounded-lg bg-[#140813]/90 border border-amber-400/25 flex items-center justify-between">
                <div>
                  <span className="text-[7px] sm:text-[8px] font-mono uppercase text-zinc-400 tracking-wider block">Official Stake</span>
                  <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-tight">$50.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] sm:text-[8px] font-mono uppercase text-amber-300/70 tracking-wider block">Denominations</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-zinc-300 font-semibold">5 × $10 Chips</span>
                </div>
              </div>

              {/* Description & Note */}
              <div className="space-y-1">
                <p className="text-zinc-300 text-[10px] sm:text-[11px] leading-snug">
                  Every player starts on equal footing with <span className="text-amber-400 font-mono font-bold">$50</span> in casino chips. Bankroll rolls over stage-to-stage.
                </p>
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-amber-200/60 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Carryover enabled • No reload</span>
                </div>
              </div>
            </div>

            {/* Card 2: Wagering Limits */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between relative overflow-hidden group border border-blue-500/25">
              <div className="card-neon-edge" />
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.35)] shrink-0">
                    <Target size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">Wagering Limits</h3>
                    <span className="text-[8px] sm:text-[9px] font-mono text-blue-300/80 uppercase tracking-wider">Per Challenge</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-400/30 text-[8px] sm:text-[9px] font-mono text-blue-300 font-bold shrink-0">
                  3 TIERS
                </span>
              </div>

              {/* Visual Betting Tier Badges */}
              <div className="my-1 py-1.5 px-2 rounded-lg bg-[#140813]/90 border border-blue-400/25 grid grid-cols-3 gap-1 text-center">
                <div className="py-0.5 rounded bg-blue-500/10 border border-blue-400/20">
                  <span className="text-[7px] font-mono text-zinc-400 uppercase block">Low</span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-blue-300">$10</span>
                </div>
                <div className="py-0.5 rounded bg-blue-500/20 border border-blue-400/30">
                  <span className="text-[7px] font-mono text-blue-200 uppercase block">Mid</span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-blue-200">$30</span>
                </div>
                <div className="py-0.5 rounded bg-rose-500/25 border border-rose-400/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                  <span className="text-[7px] font-mono text-rose-300 uppercase block">Max</span>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-rose-300">ALL IN</span>
                </div>
              </div>

              {/* Description & Note */}
              <div className="space-y-1">
                <p className="text-zinc-300 text-[10px] sm:text-[11px] leading-snug">
                  Wager strategically: conservative <span className="text-blue-400 font-mono font-bold">$10</span>, confident <span className="text-blue-400 font-mono font-bold">$30</span>, or risk everything with <span className="text-rose-400 font-mono font-bold">ALL IN</span>.
                </p>
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-blue-200/60 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>Locked upon timer start</span>
                </div>
              </div>
            </div>

            {/* Card 3: Scoring Formula */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between relative overflow-hidden group border border-emerald-500/25">
              <div className="card-neon-edge" />
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] shrink-0">
                    <Calculator size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">Scoring Formula</h3>
                    <span className="text-[8px] sm:text-[9px] font-mono text-emerald-300/80 uppercase tracking-wider">Settled Math</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-[8px] sm:text-[9px] font-mono text-emerald-300 font-bold shrink-0">
                  1:1 RATIO
                </span>
              </div>

              {/* Visual Win / Loss Comparison */}
              <div className="my-1 py-1.5 px-2.5 rounded-lg bg-[#140813]/90 border border-emerald-400/25 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[7px] sm:text-[8px] font-mono uppercase text-emerald-300 tracking-wider block">Correct</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-400">+1× Bet</span>
                </div>
                <div className="h-5 w-px bg-zinc-700/60" />
                <div className="text-center">
                  <span className="text-[7px] sm:text-[8px] font-mono uppercase text-rose-300 tracking-wider block">Incorrect</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-rose-400">-1× Bet</span>
                </div>
              </div>

              {/* Description & Note */}
              <div className="space-y-1">
                <p className="text-zinc-300 text-[10px] sm:text-[11px] leading-snug">
                  Correct calls yield <span className="text-emerald-400 font-mono font-bold">+1x Bet</span> profit. False verdicts forfeit wager directly to the house.
                </p>
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-emerald-200/60 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Speed awards tiebreaker rank</span>
                </div>
              </div>
            </div>

            {/* Card 4: High-Roller Vault */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between relative overflow-hidden group border border-purple-500/25">
              <div className="card-neon-edge" />
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)] shrink-0">
                    <Gift size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">High-Roller Vault</h3>
                    <span className="text-[8px] sm:text-[9px] font-mono text-purple-300/80 uppercase tracking-wider">Intermission Mini-Games</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-400/30 text-[8px] sm:text-[9px] font-mono text-purple-300 font-bold shrink-0">
                  BONUS
                </span>
              </div>

              {/* Visual Side Tables Grid */}
              <div className="my-1 py-1 px-1.5 rounded-lg bg-[#140813]/90 border border-purple-400/25 grid grid-cols-4 gap-1 text-center">
                <div className="py-0.5 rounded bg-purple-500/10 border border-purple-400/20">
                  <span className="text-[10px] block leading-none mb-0.5">🎡</span>
                  <span className="text-[7px] font-mono text-purple-200">Wheel</span>
                </div>
                <div className="py-0.5 rounded bg-purple-500/10 border border-purple-400/20">
                  <span className="text-[10px] block leading-none mb-0.5">🃏</span>
                  <span className="text-[7px] font-mono text-purple-200">Cards</span>
                </div>
                <div className="py-0.5 rounded bg-purple-500/10 border border-purple-400/20">
                  <span className="text-[10px] block leading-none mb-0.5">🎲</span>
                  <span className="text-[7px] font-mono text-purple-200">Dice</span>
                </div>
                <div className="py-0.5 rounded bg-purple-500/10 border border-purple-400/20">
                  <span className="text-[10px] block leading-none mb-0.5">💣</span>
                  <span className="text-[7px] font-mono text-purple-200">Mines</span>
                </div>
              </div>

              {/* Description & Note */}
              <div className="space-y-1">
                <p className="text-zinc-300 text-[10px] sm:text-[11px] leading-snug">
                  Between stages, optional side-table mini-games activate to multiply bankroll chips or stage a dramatic comeback.
                </p>
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-purple-200/60 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span>Up to 10× instant multiplier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tournament Schedule & Pay Table Example */}
          <div className="flex flex-col justify-between gap-2 sm:gap-2.5 h-full">
            {/* Tournament Stages Schedule */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md flex-1 flex flex-col justify-between border border-amber-500/25 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <h2 className="text-[10px] sm:text-[11px] uppercase font-mono font-bold tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Tournament Stages Schedule</span>
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30 text-[8px] sm:text-[9px] font-mono text-amber-300 uppercase tracking-wider font-semibold">
                  3-Stage Gauntlet
                </span>
              </div>

              {/* 3 Rich Tournament Stages Evenly Spaced */}
              <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2 min-h-0">
                {/* Stage 1 */}
                <div className="bg-[#190c1b]/85 border border-blue-400/30 rounded-lg p-2 flex items-center justify-between gap-2.5 hover:border-blue-400/50 transition-colors shadow-sm">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-mono font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      01
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <h4 className="text-white font-bold text-xs sm:text-[13px] flex items-center gap-1 leading-none">
                          <Video size={12} className="text-blue-400 shrink-0" />
                          <span>Round 1: Reality Bet</span>
                        </h4>
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-400/25 text-[8px] font-mono text-blue-300 uppercase">
                          Visual Perception
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-zinc-300 leading-snug line-clamp-2">
                        Inspect 5 photo and 5 video feeds under timed pressure. Spot real photographic evidence vs synthetic deepfakes.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase block">Volume</span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-300 bg-[#0d050d] px-2 py-0.5 rounded border border-blue-400/30 block">
                      10 Feeds • ≤5x
                    </span>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-[#190c1b]/85 border border-amber-400/30 rounded-lg p-2 flex items-center justify-between gap-2.5 hover:border-amber-400/50 transition-colors shadow-sm">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      02
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <h4 className="text-white font-bold text-xs sm:text-[13px] flex items-center gap-1 leading-none">
                          <Eye size={12} className="text-amber-400 shrink-0" />
                          <span>Round 2: Prompt Gambit</span>
                        </h4>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-400/25 text-[8px] font-mono text-amber-300 uppercase">
                          Prompt Engineering
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-zinc-300 leading-snug line-clamp-2">
                        Reverse-engineer AI artwork by reconstructing generation prompts. Keyword similarity algorithm determines payout.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase block">Volume</span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 bg-[#0d050d] px-2 py-0.5 rounded border border-amber-400/30 block">
                      5 Pics • 60s
                    </span>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="bg-[#190c1b]/85 border border-rose-400/30 rounded-lg p-2 flex items-center justify-between gap-2.5 hover:border-rose-400/50 transition-colors shadow-sm">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-mono font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                      03
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <h4 className="text-white font-bold text-xs sm:text-[13px] flex items-center gap-1 leading-none">
                          <MessageSquare size={12} className="text-rose-400 shrink-0" />
                          <span>Round 3: Turing Table</span>
                        </h4>
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-400/25 text-[8px] font-mono text-rose-300 uppercase">
                          Blind Interrogation
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-zinc-300 leading-snug line-clamp-2">
                        Real-time conversational Turing test. Ask 3 piercing questions to determine whether your counterpart is Human or AI.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase block">Volume</span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-rose-300 bg-[#0d050d] px-2 py-0.5 rounded border border-rose-400/30 block">
                      3 Rnds • 3 msgs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Table Settlement Example */}
            <div className="casino-vip-card rounded-xl p-2 sm:p-2.5 shrink-0 border border-amber-500/25">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-amber-300 mb-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-amber-400" />
                  <span className="font-bold">Settlement Math Ledger (5-Round Example)</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 lowercase">
                  <Clock size={10} className="text-amber-400/60" />
                  <span>even-odds standard</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="bg-[#150a14] p-1.5 rounded-lg border border-amber-400/20">
                  <span className="text-[8px] text-zinc-400 block uppercase">Base Wager</span>
                  <span className="text-white font-bold text-xs sm:text-sm">$10</span>
                </div>
                <div className="bg-[#150a14] p-1.5 rounded-lg border border-emerald-500/30">
                  <span className="text-[8px] text-emerald-400/90 block uppercase">Correct (4×)</span>
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">+$40</span>
                </div>
                <div className="bg-[#150a14] p-1.5 rounded-lg border border-rose-500/30">
                  <span className="text-[8px] text-rose-400/90 block uppercase">Wrong (1×)</span>
                  <span className="text-rose-400 font-bold text-xs sm:text-sm">-$10</span>
                </div>
                <div className="bg-gradient-to-br from-[#2a1324] to-[#160814] p-1.5 rounded-lg border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <span className="text-[8px] text-amber-300 block font-bold uppercase">Net Payout</span>
                  <span className="text-amber-200 font-black text-xs sm:text-sm">+$30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center flex-shrink-0 mt-0.5 sm:mt-1">
          <button
            onClick={onContinue}
            className="btn-marquee-gold inline-flex items-center justify-center gap-2 px-8 sm:px-12 py-2 sm:py-2.5 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50 shadow-tactile active:translate-y-0.5 transition-transform"
          >
            <span>I UNDERSTAND — ENTER LIVE TABLE</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
