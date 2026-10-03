import React, { useState, useEffect } from 'react';

interface CardGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

const CardGame: React.FC<CardGameProps> = ({ onBack, onSelectBonusBet, onChipUpdate, selectedBet, currentChips }) => {
  const [winningCard, setWinningCard] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newWinningCard = Math.random() > 0.5 ? 'spade' : 'heart';
    setWinningCard(newWinningCard);
    setSelectedCard('');
    setShowResult(false);
    setHasDeductedBet(false);
  };

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    // Deduct chips immediately when bet is placed
    console.log('CardGame: Deducting', amount, 'chips for card game');
    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'card');
  };

  const handleCardSelect = (cardType: string) => {
    if (!selectedBet || showResult || !hasDeductedBet) return;

    setSelectedCard(cardType);
    setShowResult(true);

    // Check if player won and reward chips
    if (cardType === winningCard) {
      const winnings = selectedBet * 2;
      console.log('CardGame: Player won! Awarding', winnings, 'chips');
      onChipUpdate(currentChips + winnings); // Current chips already had bet deducted
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full bg-[#12151E] border border-[#232938] rounded-2xl p-4 sm:p-6 text-center shadow-2xl my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-blue-500/30 text-blue-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
          <span>Side Action // 2.0x Payout</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
          High-Card Duel
        </h2>
        <p className="text-slate-400 text-xs font-sans mb-3">
          Wager your chips on the house card. If your selected card matches the hidden dealer card, you double your wager.
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
              <p className="text-xs font-mono text-rose-400 mt-2">Insufficient chips to enter this duel.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !showResult && (
          <div className="mb-4 inline-flex items-center gap-2 bg-[#181D2A] border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-amber-400">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 2 : 0}</strong>)</span>
          </div>
        )}

        {/* Card Arena */}
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-4">
            {hasDeductedBet && !showResult ? 'Step 2: Choose Your Suit' : 'Duel Deck'}
          </span>
          <div className="flex justify-center items-center gap-6">
            {/* Spade Card */}
            <div
              onClick={() => handleCardSelect('spade')}
              className={`w-32 h-44 rounded-xl transition-all duration-300 relative select-none flex flex-col justify-between p-3 cursor-pointer ${
                showResult
                  ? selectedCard === 'spade'
                    ? selectedCard === winningCard
                      ? 'bg-white text-slate-900 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl scale-105'
                      : 'bg-white text-slate-900 border-2 border-rose-500 ring-4 ring-rose-500/50 shadow-2xl scale-95'
                    : winningCard === 'spade'
                      ? 'bg-white text-slate-900 border-2 border-amber-400 shadow-xl opacity-90'
                      : 'bg-white text-slate-900 border-2 border-slate-300 opacity-60'
                  : hasDeductedBet
                    ? 'bg-gradient-to-b from-[#181D2A] to-[#0E1118] border-2 border-amber-500/40 hover:border-amber-400 hover:scale-105 shadow-tactile'
                    : 'bg-[#151922] border-2 border-[#232938] opacity-60 cursor-not-allowed'
              }`}
            >
              {showResult ? (
                <>
                  <div className="text-left font-mono font-black text-sm text-slate-900 leading-none">A<br/>♠</div>
                  <div className="text-4xl text-slate-900 text-center my-auto">♠</div>
                  <div className="text-right font-mono font-black text-sm text-slate-900 leading-none rotate-180">A<br/>♠</div>
                </>
              ) : (
                <div className="w-full h-full border border-amber-500/20 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl text-amber-500/60 mb-1">♠</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">SPADE</span>
                </div>
              )}
            </div>

            {/* Heart Card */}
            <div
              onClick={() => handleCardSelect('heart')}
              className={`w-32 h-44 rounded-xl transition-all duration-300 relative select-none flex flex-col justify-between p-3 cursor-pointer ${
                showResult
                  ? selectedCard === 'heart'
                    ? selectedCard === winningCard
                      ? 'bg-white text-rose-600 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl scale-105'
                      : 'bg-white text-rose-600 border-2 border-rose-500 ring-4 ring-rose-500/50 shadow-2xl scale-95'
                    : winningCard === 'heart'
                      ? 'bg-white text-rose-600 border-2 border-amber-400 shadow-xl opacity-90'
                      : 'bg-white text-rose-600 border-2 border-slate-300 opacity-60'
                  : hasDeductedBet
                    ? 'bg-gradient-to-b from-[#181D2A] to-[#0E1118] border-2 border-amber-500/40 hover:border-amber-400 hover:scale-105 shadow-tactile'
                    : 'bg-[#151922] border-2 border-[#232938] opacity-60 cursor-not-allowed'
              }`}
            >
              {showResult ? (
                <>
                  <div className="text-left font-mono font-black text-sm text-rose-600 leading-none">A<br/>♥</div>
                  <div className="text-4xl text-rose-600 text-center my-auto">♥</div>
                  <div className="text-right font-mono font-black text-sm text-rose-600 leading-none rotate-180">A<br/>♥</div>
                </>
              ) : (
                <div className="w-full h-full border border-amber-500/20 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl text-rose-500/60 mb-1">♥</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">HEART</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Settlement Display */}
        {showResult && (
          <div className={`p-4 rounded-xl border mb-6 animate-in fade-in zoom-in-95 duration-200 ${
            selectedCard === winningCard
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-0.5">
              Settlement Verdict
            </span>
            <p className="text-xl font-display font-black uppercase mb-1">
              {selectedCard === winningCard ? 'Victory — Suit Matched!' : 'Defeat — Dealer Prevailed'}
            </p>
            <p className="text-xs font-mono">
              {selectedCard === winningCard
                ? `+${selectedBet ? selectedBet * 2 : 0} Chips Added To Stack (2x Payout)`
                : `Dealer held ${winningCard === 'spade' ? 'Ace of Spades' : 'Ace of Hearts'}. Wager forfeited.`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
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

export default CardGame;
