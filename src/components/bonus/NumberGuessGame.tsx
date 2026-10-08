import React, { useState, useEffect, useCallback } from 'react';

interface NumberGuessGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
  onPlayed?: () => void;
}

const NumberGuessGame: React.FC<NumberGuessGameProps> = ({
  onBack,
  onSelectBonusBet,
  onChipUpdate,
  selectedBet,
  currentChips,
  onPlayed,
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
    onSelectBonusBet(0, 'number');
  }, [onSelectBonusBet]);

  const handleGuess = useCallback((guess: number) => {
    if (gameOver || !selectedBet || !hasDeductedBet) return;

    const newAttempts = attempts + 1;
    setUserGuess(guess);
    setAttempts(newAttempts);
    onPlayed?.();

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
  }, [attempts, gameOver, selectedBet, targetNumber, hasDeductedBet, onChipUpdate, currentChips]);

  const renderNumberButtons = () => {
    return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => handleGuess(num)}
        disabled={gameOver}
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-mono text-base sm:text-lg font-black transition-all cursor-pointer ${
          userGuess === num
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/50 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'bg-[#180c19] hover:bg-[#251227] text-zinc-200 border border-amber-400/25 hover:border-amber-400'
        } ${gameOver ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
      >
        {num}
      </button>
    ));
  };

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full casino-vip-card rounded-2xl p-4 sm:p-5 text-center shadow-2xl my-auto relative overflow-hidden">
        <div className="card-neon-edge" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          <span>🎯 Side Action // 2.0x Payout</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
          Cipher Pin Code
        </h2>
        <p className="text-amber-200/70 text-xs font-sans mb-3">
          Crack the secret 1 to 10 pin code within 5 precision attempts to double your wager.
        </p>

        {/* Wager Selection */}
        {!hasDeductedBet && (
          <div className="mb-4 p-3 bg-[#140814]/90 border border-amber-400/30 rounded-xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200/80 block mb-2 font-bold">
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
                    className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-4 ring-amber-400 scale-105 shadow-chip'
                        : 'border-2 border-dashed border-amber-400/40 hover:border-amber-400'
                    } ${
                      amt === 10
                        ? 'bg-gradient-to-br from-emerald-950/80 to-[#07150e] text-emerald-300'
                        : amt === 20
                          ? 'bg-gradient-to-br from-blue-950/80 to-[#081022] text-blue-300'
                          : 'bg-gradient-to-br from-purple-950/80 to-[#180820] text-purple-300'
                    } ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    <span className="text-[9px] font-mono uppercase text-zinc-400">CHIP</span>
                    <span className="text-base font-mono font-black">${amt}</span>
                  </button>
                );
              })}
            </div>
            {currentChips < 10 && (
              <p className="text-xs font-mono text-rose-400 mt-1.5">Insufficient chips to enter this cipher challenge.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !gameOver && (
          <div className="mb-3 inline-flex items-center gap-2 bg-[#1b0d18] border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-mono text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 2 : 0}</strong>)</span>
          </div>
        )}

        {/* Pinpad & Attempts Area */}
        {hasDeductedBet && (
          <div className="mb-4 p-3 sm:p-4 bg-[#0a050b] border border-amber-400/30 rounded-2xl shadow-inner">
            {/* Attempt Pips */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-400/20">
              <span className="text-xs font-mono uppercase text-amber-200/70 tracking-wider">
                Attempts Remaining
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i < attempts
                        ? 'bg-rose-500 shadow-[0_0_6px_rgba(225,29,72,0.8)]'
                        : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-zinc-300 font-bold ml-1.5">
                  {maxAttempts - attempts} left
                </span>
              </div>
            </div>

            {/* Hint Display */}
            {message && (
              <div className={`p-2.5 rounded-xl border text-xs sm:text-sm font-mono font-bold mb-3 ${
                gameOver && userGuess === targetNumber
                  ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : gameOver
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.25)]'
                    : 'bg-[#180c19] border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}>
                {message}
              </div>
            )}

            {/* Pinpad Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-w-xs mx-auto">
              {renderNumberButtons()}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onBack}
            className="py-2.5 px-6 bg-[#180c19] hover:bg-[#231225] border border-amber-400/35 hover:border-amber-400/70 text-amber-200/90 font-mono text-xs font-bold uppercase tracking-[0.16em] rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0.5"
          >
            Back To Tables
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberGuessGame;
