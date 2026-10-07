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
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full casino-vip-card rounded-2xl p-4 sm:p-6 text-center relative border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto">
        <div className="card-neon-edge" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-lowest/90 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          <span className="text-amber-400">♦</span>
          <span>Free Side Action // +10 Chip Reward</span>
          <span className="text-amber-400">♦</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-1 drop-shadow-[0_2px_12px_rgba(244,208,104,0.3)]">
          Binary Decryption
        </h2>
        <p className="text-amber-200/60 text-xs font-sans max-w-sm mx-auto mb-3.5">
          Deduce the missing bit in the algorithmic sequence. Successful decryption credits 10 chips with zero risk.
        </p>

        {/* Cryptographic Sequence Display */}
        <div className="mb-4 p-4 bg-surface-lowest/90 border border-amber-500/30 rounded-xl shadow-[inset_0_0_25px_rgba(0,0,0,0.85)] relative">
          <div className="absolute top-1.5 left-3 text-[8px] font-mono uppercase tracking-widest text-amber-500/60">
            SEQUENCE DECODER
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-1 pt-1">
            Target Bit Sequence
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-emerald-400 select-none drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            {getPatternDisplay().split('').map((char, idx) => (
              <span
                key={idx}
                className={char === '?' ? 'text-amber-400 animate-pulse underline decoration-amber-400 underline-offset-8 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Input Interface */}
        {!showResult && (
          <div className="mb-4 p-3 sm:p-4 bg-surface-lowest/80 border border-amber-500/25 rounded-xl backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-200/80 block mb-2.5">
              Select Completing Bit
            </span>
            <div className="flex justify-center gap-3 mb-3.5">
              {['0', '1'].map((bit) => (
                <button
                  key={bit}
                  onClick={() => setUserInput(bit)}
                  className={`w-16 h-12 rounded-xl font-mono text-xl font-black transition-all cursor-pointer ${
                    userInput === bit
                      ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-slate-950 ring-4 ring-amber-400/50 scale-105 shadow-[0_0_25px_rgba(245,158,11,0.6)] font-bold'
                      : 'bg-surface-lowest/90 hover:bg-[#1a1f2e] text-slate-200 border border-amber-500/25 hover:border-amber-400/60 shadow-inner'
                  }`}
                >
                  {bit}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!userInput || hasPlayed}
              className="btn-marquee-gold w-full py-2.5 px-6 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Decryption
            </button>
          </div>
        )}

        {/* Settlement Results */}
        {showResult && (
          <div className={`p-2.5 sm:p-3 rounded-xl border mb-3 animate-in fade-in zoom-in-95 duration-200 ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
              : 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
          }`}>
            <span className="text-[9px] font-mono uppercase tracking-widest block mb-0.5 opacity-80">
              Sequence Verification
            </span>
            <p className="text-lg font-display font-black uppercase mb-0.5">
              {isCorrect ? 'Decryption Verified!' : 'Parity Mismatch'}
            </p>
            <p className="text-xs font-mono font-medium">
              {getRewardMessage()}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onBack}
            className="py-2.5 px-6 bg-surface-lowest/80 hover:bg-surface-lowest border border-amber-500/30 hover:border-amber-400/60 text-amber-200 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          >
            Back To Tables
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPatternGame;
