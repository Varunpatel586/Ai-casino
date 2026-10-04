import { useState } from 'react';
import { Sparkles, Layers, Binary, Dices, Bomb, Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { NeuralWheel, DataPatternGame, CardGame, DiceGame, MinesGame, NumberGuessGame } from './bonus';

interface BonusRoundsProps {
  currentChips: number;
  onComplete: (earnings: number) => void;
  onChipUpdate: (chips: number) => void;
  currentRound?: number;
}

export default function BonusRounds({ currentChips, onComplete, onChipUpdate, currentRound }: BonusRoundsProps) {
  const [screen, setScreen] = useState<'menu' | 'wheel' | 'cardgame' | 'datadash' | 'dicegame' | 'minesgame' | 'numberguess' | 'results'>('menu');
  const [selectedBet, setSelectedBet] = useState<number | null>(null);

  const [playedGames, setPlayedGames] = useState<Set<string>>(new Set());

  const handleSelectBonusBet = (amount: number, _gameType?: string) => {
    setSelectedBet(amount);
  };

  const markGameAsPlayed = (gameName: string) => {
    setPlayedGames(prev => new Set([...prev, gameName]));
  };

  const handleWheelBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('wheel');
  };

  const handleCardGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('cardgame');
  };

  const handleDataDashBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('datadash');
  };

  const handleDiceGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('dicegame');
  };

  const handleMinesGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('minesgame');
  };

  const handleNumberGuessBack = () => {
    setScreen('menu');
    setSelectedBet(null);
    markGameAsPlayed('numberguess');
  };

  if (screen === 'menu') {
    const stageLabel = currentRound === 1.5
      ? 'STAGE I INTERMISSION'
      : currentRound === 2.5
        ? 'STAGE II INTERMISSION'
        : 'FINAL VAULT LOUNGE';

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
        <div className="max-w-3xl w-full text-center min-h-full flex flex-col justify-between py-2 sm:py-3">
          {/* Header Plaque */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
              <span>{stageLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight mb-1">
              Side Action Tables
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-lg mx-auto">
              Amplify your tournament chip bankroll before proceeding. Each side table can be played once per intermission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 my-auto text-left w-full">
            {/* Round 1: Neural Wheel and Card Game */}
            {currentRound === 1.5 && (
              <>
                <button
                  onClick={() => setScreen('wheel')}
                  disabled={playedGames.has('wheel')}
                  className={`relative p-4 sm:p-5 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('wheel')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-amber-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles size={20} />
                    </div>
                    {playedGames.has('wheel') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-[#181D2A] px-2 py-0.5 rounded-full border border-white/10">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        FREE SPIN
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-display font-black text-white uppercase mb-0.5">
                    Neural Roulette
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-3 line-clamp-2">
                    Calibrate the probabilistic wheel for an immediate chip injection without risking your stack.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Risk: None</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setScreen('cardgame')}
                  disabled={playedGames.has('cardgame')}
                  className={`relative p-6 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('cardgame')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-blue-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#181D2A] border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Layers size={24} />
                    </div>
                    {playedGames.has('cardgame') ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#181D2A] px-2.5 py-1 rounded-full border border-white/10">
                        <CheckCircle2 size={13} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-blue-400 bg-blue-950/50 border border-blue-500/30 px-2.5 py-1 rounded-full">
                        2X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-black text-white uppercase mb-1">
                    High-Card Duel
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-4">
                    Wager on Spades vs Hearts against the house deck. Double your wager on correct prediction.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Payout: 2.0x</span>
                    <span className="text-blue-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>
              </>
            )}

            {/* Round 2: Data Dash and Dice Game */}
            {currentRound === 2.5 && (
              <>
                <button
                  onClick={() => setScreen('datadash')}
                  disabled={playedGames.has('datadash')}
                  className={`relative p-6 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('datadash')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-emerald-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#181D2A] border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Binary size={24} />
                    </div>
                    {playedGames.has('datadash') ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#181D2A] px-2.5 py-1 rounded-full border border-white/10">
                        <CheckCircle2 size={13} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        FREE ENTRY
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-black text-white uppercase mb-1">
                    Binary Decryption
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-4">
                    Deduce the missing bit in algorithmic sequences to collect bounty chips with zero risk.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Reward: +10 Chips</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setScreen('dicegame')}
                  disabled={playedGames.has('dicegame')}
                  className={`relative p-6 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('dicegame')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-purple-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#181D2A] border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Dices size={24} />
                    </div>
                    {playedGames.has('dicegame') ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#181D2A] px-2.5 py-1 rounded-full border border-white/10">
                        <CheckCircle2 size={13} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2.5 py-1 rounded-full">
                        3X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-black text-white uppercase mb-1">
                    Dice Sum Wager
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-4">
                    Predict the exact total sum of two precision casino dice (2-12). High variance, 3x payout.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Payout: 3.0x</span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>
              </>
            )}

            {/* Round 3: Mines Game and Number Guess */}
            {currentRound !== 1.5 && currentRound !== 2.5 && (
              <>
                <button
                  onClick={() => setScreen('minesgame')}
                  disabled={playedGames.has('minesgame')}
                  className={`relative p-6 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('minesgame')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-rose-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#181D2A] border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bomb size={24} />
                    </div>
                    {playedGames.has('minesgame') ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#181D2A] px-2.5 py-1 rounded-full border border-white/10">
                        <CheckCircle2 size={13} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 border border-rose-500/30 px-2.5 py-1 rounded-full">
                        HIGH STAKES
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-black text-white uppercase mb-1">
                    Vault Grid Mines
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-4">
                    Uncover diamonds on a 5x5 matrix while avoiding hidden explosives. Cash out anytime.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Type: Cash-Out Matrix</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setScreen('numberguess')}
                  disabled={playedGames.has('numberguess')}
                  className={`relative p-6 rounded-2xl border transition-all text-left group cursor-pointer ${playedGames.has('numberguess')
                    ? 'bg-[#12151E]/60 border-[#232938] opacity-60 cursor-not-allowed'
                    : 'bg-[#12151E] border-[#283248] hover:border-emerald-500/60 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#181D2A] border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Target size={24} />
                    </div>
                    {playedGames.has('numberguess') ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#181D2A] px-2.5 py-1 rounded-full border border-white/10">
                        <CheckCircle2 size={13} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        2X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-black text-white uppercase mb-1">
                    Cipher Pin Code
                  </h3>
                  <p className="text-slate-400 text-xs font-sans mb-4">
                    Crack the secret 1-10 pin code within 5 precision attempts to double your chips.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#232938]">
                    <span className="text-slate-500">Payout: 2.0x</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ENTER TABLE <ChevronRight size={14} />
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center flex-shrink-0 mt-2">
            <button
              onClick={() => {
                if (currentChips <= 0) {
                  onChipUpdate(30); // Guaranteed starter bailout if wheel was skipped
                }
                onComplete(0);
              }}
              className="py-2.5 sm:py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              Continue To Next Stage
            </button>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 mt-1.5">
              Side games are optional. You can proceed directly to the tournament.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'wheel') {
    return (
      <NeuralWheel
        onBack={handleWheelBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  if (screen === 'datadash') {
    return (
      <DataPatternGame
        onBack={handleDataDashBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  if (screen === 'cardgame') {
    return (
      <CardGame
        onBack={handleCardGameBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  if (screen === 'dicegame') {
    return (
      <DiceGame
        onBack={handleDiceGameBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  if (screen === 'minesgame') {
    return (
      <MinesGame
        onBack={handleMinesGameBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  if (screen === 'numberguess') {
    return (
      <NumberGuessGame
        onBack={handleNumberGuessBack}
        onSelectBonusBet={handleSelectBonusBet}
        onChipUpdate={onChipUpdate}
        selectedBet={selectedBet}
        result=""
        currentChips={currentChips}
      />
    );
  }

  return null;
}