import React, { useState, useEffect, useCallback } from 'react';

interface NumberGuessGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

const NumberGuessGame: React.FC<NumberGuessGameProps> = ({
  onBack,
  onSelectBonusBet,
  onChipUpdate,
  selectedBet,
  currentChips,
}) => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);

  const maxAttempts = 5;

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    // Deduct chips immediately when bet is placed
    console.log('NumberGuessGame: Deducting', amount, 'chips for number guess game');
    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'number');
  };

  const startNewGame = useCallback(() => {
    const newTarget = Math.floor(Math.random() * 10) + 1;
    setTargetNumber(newTarget);
    setUserGuess(null);
    setMessage('Guess a number between 1 and 10');
    setGameOver(false);
    setAttempts(0);
    setHasDeductedBet(false);
    onSelectBonusBet(0, 'number'); // Reset selected bet
  }, []);

  const handleGuess = useCallback((guess: number) => {
    if (gameOver || !selectedBet || !hasDeductedBet) return;

    const newAttempts = attempts + 1;
    setUserGuess(guess);
    setAttempts(newAttempts);

    if (guess === targetNumber) {
      const winnings = selectedBet * 2;
      setMessage(`Correct! You won $${winnings}!`);
      onChipUpdate(currentChips + winnings);
      setGameOver(true);
    } else if (newAttempts >= maxAttempts) {
      setMessage(`Game Over! The number was ${targetNumber}`);
      setGameOver(true);
    } else {
      setMessage(guess > targetNumber ? 'Try lower!' : 'Try higher!');
    }
  }, [attempts, gameOver, onSelectBonusBet, selectedBet, targetNumber, hasDeductedBet, onChipUpdate, currentChips]);

  const renderNumberButtons = () => {
    return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => handleGuess(num)}
        disabled={gameOver}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-mono text-xl font-black transition-all cursor-pointer ${
          userGuess === num
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/50 scale-105 shadow-tactile'
            : 'bg-[#181D2A] hover:bg-[#202738] text-slate-200 border border-[#283248] hover:border-emerald-500/60'
        } ${gameOver ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
      >
        {num}
      </button>
    ));
  };

  // Initialize the game on component mount
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  return (
    <div className="min-h-screen casino-table-bg flex items-center justify-center px-4 pt-24 pb-12">
      <div className="max-w-xl w-full bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <span>Side Action // 2.0x Payout</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight mb-2">
          Cipher Pin Code
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-sans mb-6">
          Crack the secret 1 to 10 pin code within 5 precision attempts to double your wager.
        </p>

        {/* Wager Selection */}
        {!hasDeductedBet && (
          <div className="mb-6 p-4 bg-[#181D2A] border border-[#283248] rounded-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
              Step 1: Choose Wager Amount
            </span>
            <div className="flex justify-center gap-3">
              {[10, 20, 30].map((amt) => {
                const canAfford = currentChips >= amt;
                const isSelected = selectedBet === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => canAfford && handleBetSelect(amt)}
                    disabled={!canAfford}
                    className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-4 ring-amber-400 scale-105 shadow-chip'
                        : 'border-2 border-dashed border-[#2E384D] hover:border-amber-400/60'
                    } ${
                      amt === 10
                        ? 'bg-emerald-950/80 text-emerald-300'
                        : amt === 20
                          ? 'bg-blue-950/80 text-blue-300'
                          : 'bg-purple-950/80 text-purple-300'
                    } ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    <span className="text-[10px] font-mono uppercase text-slate-400">CHIP</span>
                    <span className="text-lg font-mono font-black">${amt}</span>
                  </button>
                );
              })}
            </div>
            {currentChips < 10 && (
              <p className="text-xs font-mono text-rose-400 mt-2">Insufficient chips to enter this cipher challenge.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !gameOver && (
          <div className="mb-4 inline-flex items-center gap-2 bg-[#181D2A] border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-400">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 2 : 0}</strong>)</span>
          </div>
        )}

        {/* Pinpad & Attempts Area */}
        {hasDeductedBet && (
          <div className="mb-6 p-5 bg-[#0E1118] border border-[#232938] rounded-2xl">
            {/* Attempt Pips */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#232938]">
              <span className="text-xs font-mono uppercase text-slate-400">
                Attempts Remaining
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < attempts
                        ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-slate-300 font-bold ml-1.5">
                  {maxAttempts - attempts} left
                </span>
              </div>
            </div>

            {/* Hint Display */}
            {message && (
              <div className={`p-3 rounded-xl border text-sm font-mono font-bold mb-4 ${
                gameOver && userGuess === targetNumber
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : gameOver
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-[#181D2A] border-amber-500/30 text-amber-400'
              }`}>
                {message}
              </div>
            )}

            {/* Pinpad Grid */}
            <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
              {renderNumberButtons()}
            </div>
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

export default NumberGuessGame;
