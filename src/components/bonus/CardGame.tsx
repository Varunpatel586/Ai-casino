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

    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'card');
  };

  const handleCardSelect = (cardType: string) => {
    if (!selectedBet || showResult || !hasDeductedBet) return;

    setSelectedCard(cardType);
    setShowResult(true);

    if (cardType === winningCard) {
      const winnings = selectedBet * 2;
      onChipUpdate(currentChips + winnings);
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full casino-vip-card rounded-2xl p-4 sm:p-5 text-center shadow-2xl my-auto relative overflow-hidden">
        <div className="card-neon-edge" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-blue-400/40 text-blue-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
          <span>♠ Side Action // 2.0x Payout ♥</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
          High-Card Duel
        </h2>
        <p className="text-amber-200/70 text-xs font-sans mb-3">
          Wager your chips on the house card. If your selected card matches the hidden dealer card, you double your wager.
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
              <p className="text-xs font-mono text-rose-400 mt-1.5">Insufficient chips to enter this duel.</p>
            )}
          </div>
        )}

        {/* Active Bet Notice */}
        {hasDeductedBet && !showResult && (
          <div className="mb-3 inline-flex items-center gap-2 bg-[#1b0d18] border border-amber-400/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <span>Wager Locked: <strong>${selectedBet}</strong> (Potential Payout: <strong>${selectedBet ? selectedBet * 2 : 0}</strong>)</span>
          </div>
        )}

        {/* Card Arena */}
        <div className="mb-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200/70 block mb-2.5 font-bold">
            {hasDeductedBet && !showResult ? 'Step 2: Choose Your Suit' : 'Duel Deck'}
          </span>
          <div className="flex justify-center items-center gap-4 sm:gap-6">
            {/* Spade Card */}
            <div
              onClick={() => handleCardSelect('spade')}
              className={`w-28 h-36 sm:w-32 sm:h-40 max-h-[25vh] rounded-xl transition-all duration-300 relative select-none flex flex-col justify-between p-2.5 sm:p-3 cursor-pointer ${
                showResult
                  ? selectedCard === 'spade'
                    ? selectedCard === winningCard
                      ? 'bg-white text-slate-900 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl scale-105'
                      : 'bg-white text-slate-900 border-2 border-rose-500 ring-4 ring-rose-500/50 shadow-2xl scale-95'
                    : winningCard === 'spade'
                      ? 'bg-white text-slate-900 border-2 border-amber-400 shadow-xl opacity-90'
                      : 'bg-white text-slate-900 border-2 border-slate-300 opacity-60'
                  : hasDeductedBet
                    ? 'bg-gradient-to-b from-[#240e20] to-[#10050e] border-2 border-amber-400/60 hover:border-amber-300 hover:scale-105 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-[#150714] border-2 border-amber-400/20 opacity-60 cursor-not-allowed'
              }`}
            >
              {showResult ? (
                <>
                  <div className="text-left font-mono font-black text-xs sm:text-sm text-slate-900 leading-none">A<br/>♠</div>
                  <div className="text-3xl sm:text-4xl text-slate-900 text-center my-auto drop-shadow-sm">♠</div>
                  <div className="text-right font-mono font-black text-xs sm:text-sm text-slate-900 leading-none rotate-180">A<br/>♠</div>
                </>
              ) : (
                <div className="w-full h-full border border-amber-400/30 rounded-lg flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/5 to-transparent">
                  <span className="text-2xl sm:text-3xl text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] mb-0.5">♠</span>
                  <span className="text-[9px] font-mono text-amber-200/90 uppercase tracking-[0.2em] font-bold">SPADE</span>
                </div>
              )}
            </div>

            {/* Heart Card */}
            <div
              onClick={() => handleCardSelect('heart')}
              className={`w-28 h-36 sm:w-32 sm:h-40 max-h-[25vh] rounded-xl transition-all duration-300 relative select-none flex flex-col justify-between p-2.5 sm:p-3 cursor-pointer ${
                showResult
                  ? selectedCard === 'heart'
                    ? selectedCard === winningCard
                      ? 'bg-white text-rose-600 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl scale-105'
                      : 'bg-white text-rose-600 border-2 border-rose-500 ring-4 ring-rose-500/50 shadow-2xl scale-95'
                    : winningCard === 'heart'
                      ? 'bg-white text-rose-600 border-2 border-amber-400 shadow-xl opacity-90'
                      : 'bg-white text-rose-600 border-2 border-slate-300 opacity-60'
                  : hasDeductedBet
                    ? 'bg-gradient-to-b from-[#240e20] to-[#10050e] border-2 border-amber-400/60 hover:border-amber-300 hover:scale-105 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-[#150714] border-2 border-amber-400/20 opacity-60 cursor-not-allowed'
              }`}
            >
              {showResult ? (
                <>
                  <div className="text-left font-mono font-black text-xs sm:text-sm text-rose-600 leading-none">A<br/>♥</div>
                  <div className="text-3xl sm:text-4xl text-rose-600 text-center my-auto drop-shadow-sm">♥</div>
                  <div className="text-right font-mono font-black text-xs sm:text-sm text-rose-600 leading-none rotate-180">A<br/>♥</div>
                </>
              ) : (
                <div className="w-full h-full border border-amber-400/30 rounded-lg flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/5 to-transparent">
                  <span className="text-2xl sm:text-3xl text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] mb-0.5">♥</span>
                  <span className="text-[9px] font-mono text-amber-200/90 uppercase tracking-[0.2em] font-bold">HEART</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Settlement Display */}
        {showResult && (
          <div className={`p-2.5 sm:p-3 rounded-xl border mb-3 animate-in fade-in zoom-in-95 duration-200 ${
            selectedCard === winningCard
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(225,29,72,0.25)]'
          }`}>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] block mb-0.5">
              Settlement Verdict
            </span>
            <p className="text-lg font-display font-black uppercase mb-0.5">
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

export default CardGame;
