import { DollarSign, Target, Trophy, Zap } from 'lucide-react';

interface RulesScreenProps {
  onContinue: () => void;
}

export default function RulesScreen({ onContinue }: RulesScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12 px-4 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
          GAME RULES
        </h1>
        <p className="text-center text-cyan-300 text-xl mb-12">Master the rules. Beat the AI.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="text-yellow-400" size={32} />
              <h3 className="text-2xl font-bold text-white">Starting Chips</h3>
            </div>
            <p className="text-white/70 text-lg">
              Every player begins with <span className="text-yellow-400 font-bold">$50</span> in virtual chips
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-cyan-400" size={32} />
              <h3 className="text-2xl font-bold text-white">Betting System</h3>
            </div>
            <p className="text-white/70 text-lg">
              Place bets: <span className="text-cyan-400 font-bold">$10, $30, or ALL IN</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-green-400" size={32} />
              <h3 className="text-2xl font-bold text-white">Scoring</h3>
            </div>
            <p className="text-white/70 text-lg">
              Correct guess = <span className="text-green-400 font-bold">Bet × Score</span><br />
              Wrong guess = <span className="text-red-400 font-bold">Lose your bet</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-pink-400" size={32} />
              <h3 className="text-2xl font-bold text-white">Bonus Rounds</h3>
            </div>
            <p className="text-white/70 text-lg">
              Optional challenges to <span className="text-pink-400 font-bold">multiply winnings</span>
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">The Three Rounds</h2>

          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border-l-4 border-yellow-500">
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">Round 1: The Prompt Gambit</h3>
              <p className="text-white/80 text-lg mb-2">Create perfect AI prompts to match target images</p>
              <p className="text-white/60">Duration: 10 minutes</p>
            </div>

            <div className="bg-black/30 rounded-xl p-6 border-l-4 border-cyan-500">
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">Round 2: The Reality Bet</h3>
              <p className="text-white/80 text-lg mb-2">Identify which videos are real vs AI-generated</p>
              <p className="text-white/60">Duration: 8 minutes</p>
            </div>

            <div className="bg-black/30 rounded-xl p-6 border-l-4 border-pink-500">
              <h3 className="text-2xl font-bold text-pink-400 mb-2">Round 3: The Turing Table</h3>
              <p className="text-white/80 text-lg mb-2">Determine if responses are from humans or AI</p>
              <p className="text-white/60">Duration: 8 minutes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">💡 Scoring Example</h3>
          <div className="text-white/80 space-y-2">
            <p>• You bet <span className="text-yellow-400 font-bold">$10</span></p>
            <p>• You score <span className="text-green-400 font-bold">4/5</span> correct</p>
            <p>• Reward = 4 × $10 = <span className="text-green-400 font-bold">$40</span></p>
            <p>• Wrong answers = 1 × $10 = <span className="text-red-400 font-bold">-$10</span></p>
            <p className="text-xl font-bold text-cyan-400 pt-2">Final = $40 - $10 = $30 earned!</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]"
          >
            I'M READY TO PLAY
          </button>
        </div>
      </div>
    </div>
  );
}
