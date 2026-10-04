import React, { useState } from 'react';

interface DiceGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

const DiceGame: React.FC<DiceGameProps> = ({ onBack, onSelectBonusBet, onChipUpdate, selectedBet, currentChips }) => {
  const [dice1, setDice1] = useState<number | string>('?');
  const [dice2, setDice2] = useState<number | string>('?');
  const [rolling, setRolling] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    // Deduct chips immediately when bet is placed
    console.log('DiceGame: Deducting', amount, 'chips for dice game');
    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'dice');
  };

  const handleRoll = () => {
    if (!selectedBet || rolling || !userGuess || !hasDeductedBet) return;

    const guess = parseInt(userGuess);
    if (isNaN(guess) || guess < 2 || guess > 12) {
      alert('Please enter a valid sum between 2 and 12!');
      return;
    }

    setRolling(true);
    setShowResult(false);

    // Animate dice
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDice1(prev => typeof prev === 'string' ? 1 : (prev % 6) + 1);
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

        // Check if player won and reward chips
        if (sum === guess) {
          const winnings = selectedBet * 3; // 3x payout for correct guess
          console.log('DiceGame: Player won! Awarding', winnings, 'chips');
          onChipUpdate(currentChips + winnings);
          setIsWin(true);
        } else {
          setIsWin(false);
        }
      }
    }, 100);
  };



  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full bg-[#12151E] border border-[#232938] rounded-2xl p-4 sm:p-6 text-center shadow-2xl my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-purple-500/30 text-purple-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
          <span>Side Action // 3.0x Payout</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
          Precision Dice Sum
        </h2>
        <p className="text-slate-400 text-xs font-sans mb-3">
          Predict the combined sum of two casino dice (2 to 12). Correct prediction yields a high-variance 3x return.
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
              <p className="text-xs font-mono text-rose-400 mt-2">Insufficient chips to place this wager.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !showResult && (
          <div className="mb-4 inline-flex items-center gap-2 bg-[#181D2A] border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-purple-400">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 3 : 0}</strong>)</span>
          </div>
        )}

        {/* Target Sum Selector */}
        {hasDeductedBet && !showResult && (
          <div className="mb-6 p-4 bg-[#181D2A] border border-[#283248] rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Step 2: Select Predicted Sum
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Target: {userGuess ? userGuess : 'None'}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
              {Array.from({ length: 11 }, (_, i) => i + 2).map((sumVal) => (
                <button
                  key={sumVal}
                  onClick={() => setUserGuess(sumVal.toString())}
                  disabled={rolling}
                  className={`py-2 text-sm font-mono font-black rounded-lg transition-all cursor-pointer ${
                    userGuess === sumVal.toString()
                      ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 scale-105'
                      : 'bg-[#12151E] hover:bg-[#202738] text-slate-300 border border-[#232938]'
                  }`}
                >
                  {sumVal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Physical 3D Dice Stage */}
        <div className="mb-6 p-6 bg-[#0E1118] border border-[#232938] rounded-2xl">
          <div className="flex justify-center items-center gap-6 mb-2">
            {/* Dice 1 */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-mono font-black select-none shadow-xl transition-transform ${
              rolling ? 'animate-bounce scale-105' : ''
            } ${
              showResult
                ? 'bg-white text-slate-900 border-2 border-slate-300 ring-2 ring-white/50'
                : 'bg-gradient-to-b from-[#1E2536] to-[#121622] text-amber-400 border-2 border-[#2E3B55]'
            }`}>
              {dice1}
            </div>

            <div className="text-xl font-mono font-bold text-slate-600">+</div>

            {/* Dice 2 */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-mono font-black select-none shadow-xl transition-transform ${
              rolling ? 'animate-bounce scale-105' : ''
            } ${
              showResult
                ? 'bg-white text-slate-900 border-2 border-slate-300 ring-2 ring-white/50'
                : 'bg-gradient-to-b from-[#1E2536] to-[#121622] text-amber-400 border-2 border-[#2E3B55]'
            }`} style={{ animationDelay: '0.1s' }}>
              {dice2}
            </div>
          </div>

          {showResult && (
            <div className="mt-3 text-sm font-mono text-slate-400">
              Final Sum: <span className="text-white font-bold">{parseInt(dice1.toString()) + parseInt(dice2.toString())}</span>
            </div>
          )}
        </div>

        {/* Result Settlement Display */}
        {showResult && (
          <div className={`p-4 rounded-xl border mb-6 animate-in fade-in zoom-in-95 duration-200 ${
            isWin
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-0.5">
              Settlement Verdict
            </span>
            <p className="text-xl font-display font-black uppercase mb-1">
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
        <div className="flex items-center justify-center gap-3">
          {hasDeductedBet && !showResult && (
            <button
              onClick={handleRoll}
              disabled={rolling || !userGuess}
              className="py-3 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rolling ? 'Rolling Dice...' : 'Roll Dice'}
            </button>
          )}

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

export default DiceGame;
