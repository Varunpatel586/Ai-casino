import { useState, useEffect } from 'react';
import { Sparkles, Zap, Clock } from 'lucide-react';
import { wheelOptions, dataDashPatterns } from '../gameData';

interface BonusRoundsProps {
  currentChips: number;
  onComplete: (earnings: number) => void;
}

export default function BonusRounds({ currentChips, onComplete }: BonusRoundsProps) {
  const [screen, setScreen] = useState<'menu' | 'wheel' | 'datadash' | 'results'>('menu');
  const [bonusEarnings, setBonusEarnings] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<typeof wheelOptions[0] | null>(null);
  const [dataDashAnswer, setDataDashAnswer] = useState('');
  const [dataDashResult, setDataDashResult] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPattern] = useState(dataDashPatterns[Math.floor(Math.random() * dataDashPatterns.length)]);

  useEffect(() => {
    if (screen === 'datadash' && timeLeft > 0 && !dataDashResult) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, timeLeft, dataDashResult]);

  const spinWheel = () => {
    if (currentChips < 25) return;

    setWheelSpinning(true);
    setTimeout(() => {
      const result = wheelOptions[Math.floor(Math.random() * wheelOptions.length)];
      setWheelResult(result);
      setWheelSpinning(false);

      let earnings = 0;
      if (result.multiplier > 1) {
        earnings = Math.floor(currentChips * result.multiplier) - currentChips - 25;
      } else if (result.multiplier > 0 && result.multiplier < 1) {
        earnings = Math.floor(currentChips * result.multiplier) - 25;
      } else if (result.multiplier < 0) {
        earnings = result.multiplier - 25;
      } else if (result.multiplier === 0 && !result.special) {
        earnings = -25;
      }

      setBonusEarnings(bonusEarnings + earnings);
    }, 3000);
  };

  const submitDataDash = () => {
    if (dataDashAnswer === currentPattern.answer) {
      setDataDashResult('correct');
      setBonusEarnings(bonusEarnings + 10);
    } else {
      setDataDashResult('wrong');
    }
  };

  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-6xl font-black text-white mb-4">BONUS ROUNDS</h1>
          <p className="text-2xl text-yellow-400 mb-12">Risk it for the biscuit!</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setScreen('wheel')}
              disabled={currentChips < 25}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-8 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Sparkles className="text-yellow-400 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">Neural Wheel</h3>
              <p className="text-white/60 mb-4">Spin for instant rewards</p>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-yellow-400 font-bold text-xl">Cost: $25</p>
              </div>
            </button>

            <button
              onClick={() => setScreen('datadash')}
              disabled={currentChips < 0}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-2xl p-8 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Zap className="text-cyan-400 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">Data Dash</h3>
              <p className="text-white/60 mb-4">Solve the pattern</p>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-cyan-400 font-bold text-xl">Reward: +10</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => onComplete(bonusEarnings)}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,0,0.6)]"
          >
            SKIP TO RESULTS
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'wheel') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-black text-white mb-8">Neural Wheel</h2>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <div className="relative w-80 h-80 mx-auto mb-8">
              <div className={`absolute inset-0 rounded-full border-8 border-yellow-400 ${wheelSpinning ? 'animate-spin' : ''}`}>
                {wheelOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
                    style={{
                      transform: `rotate(${(360 / wheelOptions.length) * idx}deg) translateY(-150px)`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full w-40 h-40 flex items-center justify-center">
                  <Sparkles className="text-white" size={64} />
                </div>
              </div>
            </div>

            {wheelResult && (
              <div className="bg-black/50 rounded-xl p-6 mb-6">
                <p className="text-3xl font-bold text-yellow-400 mb-2">{wheelResult.label}</p>
                <p className="text-white/60">
                  {wheelResult.multiplier > 0
                    ? `You earned chips!`
                    : wheelResult.multiplier < 0
                    ? `You lost chips!`
                    : 'No change'}
                </p>
              </div>
            )}

            {!wheelSpinning && !wheelResult && (
              <button
                onClick={spinWheel}
                disabled={currentChips < 25}
                className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SPIN ($25)
              </button>
            )}

            {wheelResult && (
              <button
                onClick={() => setScreen('menu')}
                className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full hover:scale-110 transition-all duration-300"
              >
                BACK TO MENU
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'datadash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-black text-white mb-4">Data Dash</h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="text-cyan-400" size={24} />
            <span className="text-white text-2xl font-bold">{timeLeft}s</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <p className="text-white/60 mb-6 text-lg">Fill in the missing digit:</p>

            <div className="bg-black/50 rounded-xl p-8 mb-6">
              <p className="text-6xl font-mono font-bold text-cyan-400 tracking-wider">
                {currentPattern.sequence.replace('_', '?')}
              </p>
            </div>

            {!dataDashResult ? (
              <>
                <input
                  type="text"
                  value={dataDashAnswer}
                  onChange={(e) => setDataDashAnswer(e.target.value.slice(0, 1))}
                  placeholder="?"
                  maxLength={1}
                  className="w-32 h-32 text-center text-6xl font-mono font-bold bg-black/30 border-2 border-cyan-400 rounded-xl text-white focus:outline-none focus:border-cyan-300 mb-6"
                  autoFocus
                />

                <button
                  onClick={submitDataDash}
                  disabled={!dataDashAnswer || timeLeft === 0}
                  className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SUBMIT
                </button>
              </>
            ) : (
              <div>
                {dataDashResult === 'correct' ? (
                  <div className="bg-green-900/50 border border-green-500/30 rounded-xl p-6 mb-6">
                    <p className="text-4xl font-bold text-green-400 mb-2">Correct! +10 Chips</p>
                    <p className="text-white/60">The answer was: {currentPattern.answer}</p>
                  </div>
                ) : (
                  <div className="bg-red-900/50 border border-red-500/30 rounded-xl p-6 mb-6">
                    <p className="text-4xl font-bold text-red-400 mb-2">Wrong!</p>
                    <p className="text-white/60">The answer was: {currentPattern.answer}</p>
                  </div>
                )}

                <button
                  onClick={() => setScreen('menu')}
                  className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full hover:scale-110 transition-all duration-300"
                >
                  BACK TO MENU
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
