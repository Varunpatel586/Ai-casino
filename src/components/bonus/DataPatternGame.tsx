import React, { useState, useEffect } from 'react';

interface DataPatternGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

const DataPatternGame: React.FC<DataPatternGameProps> = ({ onBack, onChipUpdate, currentChips }) => {
  const [pattern, setPattern] = useState('');
  const [answer, setAnswer] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const patterns = [
      { pattern: '101?101', answer: '0' },
      { pattern: '110?11', answer: '0' },
      { pattern: '01?010', answer: '1' },
      { pattern: '111?111', answer: '1' },
      { pattern: '00?000', answer: '0' }
    ];

    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setPattern(selectedPattern.pattern);
    setAnswer(selectedPattern.answer);
    setUserInput('');
    setShowResult(false);
    setHasPlayed(false);
  };

  const handleSubmit = () => {
    if (hasPlayed) return;

    setShowResult(true);
    setHasPlayed(true);

    // Award chips for correct answer (free play)
    if (isCorrect) {
      const earnings = 10; // Fixed reward for correct answer
      console.log('DataPatternGame: Awarding', earnings, 'chips for correct answer');
      onChipUpdate(currentChips + earnings);
    }
  };

  const getRewardMessage = () => {
    if (!isCorrect) return "Try again next time!";

    return "Correct! You earned 10 chips!";
  };

  const getPatternDisplay = () => {
    if (!showResult) return pattern;
    return pattern.replace('?', answer);
  };

  const isCorrect = userInput === answer;

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full bg-[#12151E] border border-[#232938] rounded-2xl p-4 sm:p-6 text-center shadow-2xl my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
          <span>Free Side Action // +10 Chip Reward</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
          Binary Decryption
        </h2>
        <p className="text-slate-400 text-xs font-sans mb-3">
          Deduce the missing bit in the algorithmic sequence. Successful decryption credits 10 chips with zero risk.
        </p>

        {/* Cryptographic Sequence Display */}
        <div className="mb-6 p-6 bg-[#0E1118] border border-[#283248] rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">
            Target Bit Sequence
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-emerald-400 select-none">
            {getPatternDisplay().split('').map((char, idx) => (
              <span
                key={idx}
                className={char === '?' ? 'text-amber-400 animate-pulse underline decoration-amber-400 underline-offset-8' : ''}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Input Interface */}
        {!showResult && (
          <div className="mb-6 p-4 bg-[#181D2A] border border-[#283248] rounded-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
              Select Completing Bit
            </span>
            <div className="flex justify-center gap-4 mb-4">
              {['0', '1'].map((bit) => (
                <button
                  key={bit}
                  onClick={() => setUserInput(bit)}
                  className={`w-20 h-16 rounded-xl font-mono text-2xl font-black transition-all cursor-pointer ${
                    userInput === bit
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/50 scale-105 shadow-tactile'
                      : 'bg-[#12151E] hover:bg-[#202738] text-slate-300 border border-[#283248]'
                  }`}
                >
                  {bit}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!userInput || hasPlayed}
              className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Decryption
            </button>
          </div>
        )}

        {/* Settlement Results */}
        {showResult && (
          <div className={`p-4 rounded-xl border mb-6 animate-in fade-in zoom-in-95 duration-200 ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-0.5">
              Sequence Verification
            </span>
            <p className="text-xl font-display font-black uppercase mb-1">
              {isCorrect ? 'Decryption Verified!' : 'Parity Mismatch'}
            </p>
            <p className="text-xs font-mono">
              {getRewardMessage()}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="py-3 px-6 bg-[#181D2A] hover:bg-[#202738] border border-[#283248] hover:border-slate-500 text-slate-300 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Back To Tables
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPatternGame;
