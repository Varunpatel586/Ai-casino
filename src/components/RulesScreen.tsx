import { Coins, Target, Calculator, Gift, Eye, Video, MessageSquare, ArrowRight, Shield } from 'lucide-react';

interface RulesScreenProps {
  onContinue: () => void;
}

export default function RulesScreen({ onContinue }: RulesScreenProps) {
  return (
    <div className="min-h-screen casino-table-bg py-12 px-4 sm:px-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-[#2B354D] text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Shield size={13} />
            <span>Official Tournament Protocol</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
            TABLE RULES &amp; PAYOUTS
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mt-2">
            Read the protocol before taking your seat. High stakes reward perception, logic, and nerve.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Starting Bankroll</h3>
                <span className="text-xs font-mono text-slate-500 uppercase">Standard Buy-In</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every contestant enters with exactly <span className="text-amber-400 font-mono font-bold">$50</span> in virtual casino chips.
            </p>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Wagering Structure</h3>
                <span className="text-xs font-mono text-slate-500 uppercase">Table Limits</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Choose your bet per round: <span className="text-blue-400 font-mono font-bold">$10</span>, <span className="text-blue-400 font-mono font-bold">$30</span>, or <span className="text-rose-400 font-mono font-bold">ALL IN</span> with your entire wallet.
            </p>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Scoring Formula</h3>
                <span className="text-xs font-mono text-slate-500 uppercase">Net Settled Math</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Correct picks win <span className="text-emerald-400 font-mono font-bold">+1x Bet</span>. Inaccurate answers deduct <span className="text-rose-400 font-mono font-bold">-1x Bet</span>.
            </p>
          </div>

          <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Gift size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">High-Roller Vault</h3>
                <span className="text-xs font-mono text-slate-500 uppercase">Intermission Lounge</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Between rounds, enter the Vault to play Neural Wheel, Card Flip, Dice, or Mines to multiply chips.
            </p>
          </div>
        </div>

        {/* The Three Rounds Table Briefing */}
        <div className="bg-[#12151E] border border-[#232938] rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xs uppercase font-mono font-bold tracking-widest text-amber-400 mb-4">
            Tournament Schedule
          </h2>

          <div className="space-y-3">
            <div className="bg-[#181D2A] border border-[#283248] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-white font-bold text-base flex items-center gap-2">
                    <Video size={16} className="text-blue-400" />
                    Round 1: The Reality Bet
                  </h4>
                  <p className="text-xs text-slate-400">Analyze 5 video clips and identify whether they are Real Life or AI.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-[#12151E] px-2.5 py-1 rounded border border-[#232938]">
                5 Videos • 60s
              </span>
            </div>

            <div className="bg-[#181D2A] border border-[#283248] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-white font-bold text-base flex items-center gap-2">
                    <Eye size={16} className="text-amber-400" />
                    Round 2: The Prompt Gambit
                  </h4>
                  <p className="text-xs text-slate-400">Compose text prompts to reverse-engineer 5 AI images.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-[#12151E] px-2.5 py-1 rounded border border-[#232938]">
                5 Challenges • 60s
              </span>
            </div>

            <div className="bg-[#181D2A] border border-[#283248] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-mono font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="text-white font-bold text-base flex items-center gap-2">
                    <MessageSquare size={16} className="text-rose-400" />
                    Round 3: The Turing Table
                  </h4>
                  <p className="text-xs text-slate-400">Blind chat session against either a Live Human Host or Gemini Flash AI.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-[#12151E] px-2.5 py-1 rounded border border-[#232938]">
                3 Subrounds • 3 msgs
              </span>
            </div>
          </div>
        </div>

        {/* Scoring Example Card */}
        <div className="bg-[#10131B] border border-amber-500/20 rounded-xl p-5 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
            <span>Pay Table Settlement Example</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="bg-[#161B26] p-3 rounded-lg border border-[#232A3B]">
              <span className="text-slate-500 block">Wager</span>
              <span className="text-white font-bold text-sm">$10</span>
            </div>
            <div className="bg-[#161B26] p-3 rounded-lg border border-[#232A3B]">
              <span className="text-slate-500 block">Correct (4)</span>
              <span className="text-emerald-400 font-bold text-sm">+$40</span>
            </div>
            <div className="bg-[#161B26] p-3 rounded-lg border border-[#232A3B]">
              <span className="text-slate-500 block">Wrong (1)</span>
              <span className="text-rose-400 font-bold text-sm">-$10</span>
            </div>
            <div className="bg-[#182030] p-3 rounded-lg border border-amber-500/30">
              <span className="text-amber-400 block font-bold">Net Payout</span>
              <span className="text-amber-300 font-black text-base">+$30</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-lg uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>I UNDERSTAND — ENTER LIVE TABLE</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
