import React, { useState } from 'react';

interface DiceGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
  onPlayed?: () => void;
}

const DiceGame: React.FC<DiceGameProps> = ({ onBack, onSelectBonusBet, onChipUpdate, selectedBet, currentChips, onPlayed }) => {
  const [dice1, setDice1] = useState<number | string>(1);
  const [dice2, setDice2] = useState<number | string>(1);
  const [rolling, setRolling] = useState(false);
  const [userGuess, setUserGuess] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'dice');
  };

  const handleRoll = () => {
    if (!selectedBet || rolling || !userGuess || !hasDeductedBet) return;

    setRolling(true);
    setShowResult(false);
    onPlayed?.();

    const guess = parseInt(userGuess);

    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDice1(prev => typeof prev === 'string' ? 6 : (prev % 6) + 1);
      setDice2(prev => typeof prev === 'string' ? 6 : (prev % 6) + 1);
      rolls++;

      if (rolls > 10) {
        clearInterval(rollInterval);
        const newDice1 = Math.floor(Math.random() * 6) + 1;
        const newDice2 = Math.floor(Math.random() * 6) + 1;
        const sum = newDice1 + newDice2;

        setDice1(newDice1);
        setDice2(newDice2);
        setRolling(false);
        setShowResult(true);

        if (sum === guess) {
          const winnings = selectedBet * 3;
          onChipUpdate(currentChips + winnings);
          setIsWin(true);
        } else {
          setIsWin(false);
        }
      }
    }, 100);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full casino-vip-card rounded-2xl p-4 sm:p-5 text-center shadow-2xl my-auto relative overflow-hidden">
        <div className="card-neon-edge" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-purple-400/40 text-purple-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
          <span>🎲 Side Action // 3.0x Payout</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
          Precision Dice Sum
        </h2>
        <p className="text-amber-200/70 text-xs font-sans mb-3">
          Predict the combined sum of two casino dice (2 to 12). Correct prediction yields a high-variance 3x return.
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
              <p className="text-xs font-mono text-rose-400 mt-1.5">Insufficient chips to place this wager.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !showResult && (
          <div className="mb-3 inline-flex items-center gap-2 bg-[#1b0d18] border border-purple-400/40 px-3 py-1 rounded-full text-xs font-mono text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 3 : 0}</strong>)</span>
          </div>
        )}

        {/* Target Sum Selector */}
        {hasDeductedBet && !showResult && (
          <div className="mb-3 p-3 bg-[#140814]/90 border border-amber-400/30 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200/80 font-bold">
                Step 2: Select Predicted Sum
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold">
                Target: {userGuess ? userGuess : 'None'}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => i + 2).map((sumVal) => (
                <button
                  key={sumVal}
                  onClick={() => setUserGuess(sumVal.toString())}
                  disabled={rolling}
                  className={`py-1.5 text-xs sm:text-sm font-mono font-black rounded-lg transition-all cursor-pointer ${
                    userGuess === sumVal.toString()
                      ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-md ring-2 ring-amber-400 scale-105'
                      : 'bg-[#180c19] hover:bg-[#251227] text-zinc-300 border border-amber-400/20'
                  }`}
                >
                  {sumVal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Physical 3D Dice Stage */}
        <div className="mb-4 p-4 bg-[#0a050b] border border-amber-400/30 rounded-2xl shadow-inner">
          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-1">
            {/* Dice 1 */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-mono font-black select-none shadow-xl transition-transform ${
              rolling ? 'animate-bounce scale-105' : ''
            } ${
              showResult
                ? 'bg-white text-slate-900 border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-2 ring-white/50'
                : 'bg-gradient-to-b from-[#240e20] to-[#120510] text-amber-300 border-2 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`}>
              {dice1}
            </div>

            <div className="text-xl font-mono font-bold text-amber-400/70">+</div>

            {/* Dice 2 */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-mono font-black select-none shadow-xl transition-transform ${
              rolling ? 'animate-bounce scale-105' : ''
            } ${
              showResult
                ? 'bg-white text-slate-900 border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-2 ring-white/50'
                : 'bg-gradient-to-b from-[#240e20] to-[#120510] text-amber-300 border-2 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`} style={{ animationDelay: '0.1s' }}>
              {dice2}
            </div>
          </div>

          {showResult && (
            <div className="mt-2 text-xs font-mono text-amber-200/80">
              Final Sum: <span className="text-white font-bold">{parseInt(dice1.toString()) + parseInt(dice2.toString())}</span>
            </div>
          )}
        </div>

        {/* Result Settlement Display */}
        {showResult && (
          <div className={`p-2.5 sm:p-3 rounded-xl border mb-3 animate-in fade-in zoom-in-95 duration-200 ${
            isWin
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(225,29,72,0.25)]'
          }`}>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] block mb-0.5">
              Settlement Verdict
            </span>
            <p className="text-lg font-display font-black uppercase mb-0.5">
              {isWin ? 'Direct Hit — Sum Predicted!' : 'Missed Prediction'}
            </p>
            <p className="text-xs font-mono">
              {isWin
                ? `+${selectedBet ? selectedBet * 3 : 0} Chips Awarded (3x Multiplier)`
                : `Total sum was ${parseInt(dice1.toString()) + parseInt(dice2.toString())}. Target was ${userGuess}.`}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2.5">
          {hasDeductedBet && !showResult && (
            <button
              onClick={handleRoll}
              disabled={rolling || !userGuess}
              className="btn-marquee-gold py-2.5 px-7 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {rolling ? 'Rolling Dice...' : 'Roll Dice'}
            </button>
          )}

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

export default DiceGame;
