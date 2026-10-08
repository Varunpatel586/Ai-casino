import { useState } from 'react';
import { Sparkles, Layers, Binary, Dices, Bomb, Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { NeuralWheel, DataPatternGame, CardGame, DiceGame, MinesGame, NumberGuessGame } from './bonus';

interface BonusRoundsProps {
  currentChips: number;
  onComplete: (earnings: number) => void;
  onChipUpdate: (chips: number) => void;
  currentRound?: number;
  playedGames?: string[];
  onMarkGamePlayed?: (gameName: string) => void;
}

export default function BonusRounds({
  currentChips,
  onComplete,
  onChipUpdate,
  currentRound,
  playedGames = [],
  onMarkGamePlayed
}: BonusRoundsProps) {
  const [screen, setScreen] = useState<'menu' | 'wheel' | 'cardgame' | 'datadash' | 'dicegame' | 'minesgame' | 'numberguess' | 'results'>('menu');
  const [selectedBet, setSelectedBet] = useState<number | null>(null);

  const playedGamesSet = new Set(playedGames);

  const handleSelectBonusBet = (amount: number) => {
    setSelectedBet(amount);
  };

  const markGameAsPlayed = (gameName: string) => {
    onMarkGamePlayed?.(gameName);
  };

  const handleWheelBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const handleCardGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const handleDataDashBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const handleDiceGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const handleMinesGameBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const handleNumberGuessBack = () => {
    setScreen('menu');
    setSelectedBet(null);
  };

  const renderNeuralWheelButton = () => {
    const isSettled = playedGamesSet.has('wheel');
    return (
      <button
        key="wheel-button"
        onClick={() => setScreen('wheel')}
        disabled={isSettled}
        className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${
          isSettled
            ? 'opacity-60 cursor-not-allowed border-amber-500/20'
            : 'hover:border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.2)] active:translate-y-0.5 cursor-pointer'
        }`}
      >
        <div className="card-neon-edge" />
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.35)]">
            <Sparkles size={18} />
          </div>
          {isSettled ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-amber-400/20">
              <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
              FREE SPIN
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
          Neural Roulette
        </h3>
        <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
          Calibrate the probabilistic wheel for an immediate chip injection without risking your stack.
        </p>
        <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
          <span className="text-amber-200/60 text-[11px]">Risk: None</span>
          <span className="text-amber-300 font-bold flex items-center gap-1 text-[11px]">
            {isSettled ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
          </span>
        </div>
      </button>
    );
  };

  if (screen === 'menu') {
    const stageLabel = currentRound === 1.5
      ? 'STAGE I INTERMISSION'
      : currentRound === 2.5
        ? 'STAGE II INTERMISSION'
        : 'FINAL VAULT LOUNGE';

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-3xl w-full text-center h-full max-h-full flex flex-col justify-between py-1 sm:py-2">
          {/* Header Plaque */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span>✨ {stageLabel}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
              Side Action Tables
            </h1>
            <p className="text-amber-200/70 text-xs sm:text-sm font-sans max-w-lg mx-auto">
              Amplify your tournament chip bankroll before proceeding. Each side table can be played once per intermission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-2.5 sm:gap-3.5 my-auto text-left w-full">
            {/* Round 1: Neural Wheel and Card Game */}
            {currentRound === 1.5 && (
              <>
                {renderNeuralWheelButton()}

                <button
                  onClick={() => setScreen('cardgame')}
                  disabled={playedGamesSet.has('cardgame')}
                  className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${playedGamesSet.has('cardgame')
                    ? 'opacity-60 cursor-not-allowed border-blue-500/20'
                    : 'hover:border-blue-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(59,130,246,0.2)] active:translate-y-0.5 cursor-pointer'
                    }`}
                >
                  <div className="card-neon-edge" />
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(59,130,246,0.35)]">
                      <Layers size={18} />
                    </div>
                    {playedGamesSet.has('cardgame') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-blue-400/20">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-blue-300 bg-blue-950/60 border border-blue-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                        2X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
                    High-Card Duel
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
                    Wager on Spades vs Hearts against the house deck. Double your wager on correct prediction.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
                    <span className="text-amber-200/60 text-[11px]">Payout: 2.0x</span>
                    <span className="text-blue-300 font-bold flex items-center gap-1 text-[11px]">
                      {playedGamesSet.has('cardgame') ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
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
                  disabled={playedGamesSet.has('datadash')}
                  className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${playedGamesSet.has('datadash')
                    ? 'opacity-60 cursor-not-allowed border-emerald-500/20'
                    : 'hover:border-emerald-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(16,185,129,0.2)] active:translate-y-0.5 cursor-pointer'
                    }`}
                >
                  <div className="card-neon-edge" />
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                      <Binary size={18} />
                    </div>
                    {playedGamesSet.has('datadash') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-emerald-400/20">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                        FREE ENTRY
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
                    Binary Decryption
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
                    Deduce the missing bit in algorithmic sequences to collect bounty chips with zero risk.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
                    <span className="text-amber-200/60 text-[11px]">Reward: +10 Chips</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1 text-[11px]">
                      {playedGamesSet.has('datadash') ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setScreen('dicegame')}
                  disabled={playedGamesSet.has('dicegame')}
                  className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${playedGamesSet.has('dicegame')
                    ? 'opacity-60 cursor-not-allowed border-purple-500/20'
                    : 'hover:border-purple-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(168,85,247,0.2)] active:translate-y-0.5 cursor-pointer'
                    }`}
                >
                  <div className="card-neon-edge" />
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                      <Dices size={18} />
                    </div>
                    {playedGamesSet.has('dicegame') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-purple-400/20">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                        3X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
                    Dice Sum Wager
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
                    Predict the exact total sum of two precision casino dice (2-12). High variance, 3x payout.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
                    <span className="text-amber-200/60 text-[11px]">Payout: 3.0x</span>
                    <span className="text-purple-300 font-bold flex items-center gap-1 text-[11px]">
                      {playedGamesSet.has('dicegame') ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
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
                  disabled={playedGamesSet.has('minesgame')}
                  className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${playedGamesSet.has('minesgame')
                    ? 'opacity-60 cursor-not-allowed border-rose-500/20'
                    : 'hover:border-rose-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(225,29,72,0.2)] active:translate-y-0.5 cursor-pointer'
                    }`}
                >
                  <div className="card-neon-edge" />
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(225,29,72,0.35)]">
                      <Bomb size={18} />
                    </div>
                    {playedGamesSet.has('minesgame') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-rose-400/20">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                        HIGH STAKES
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
                    Vault Grid Mines
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
                    Uncover diamonds on a 5x5 matrix while avoiding hidden explosives. Cash out anytime.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
                    <span className="text-amber-200/60 text-[11px]">Type: Cash-Out Matrix</span>
                    <span className="text-rose-300 font-bold flex items-center gap-1 text-[11px]">
                      {playedGamesSet.has('minesgame') ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setScreen('numberguess')}
                  disabled={playedGamesSet.has('numberguess')}
                  className={`casino-vip-card relative p-3.5 sm:p-4 rounded-xl border transition-all text-left group overflow-hidden ${playedGamesSet.has('numberguess')
                    ? 'opacity-60 cursor-not-allowed border-emerald-500/20'
                    : 'hover:border-emerald-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(16,185,129,0.2)] active:translate-y-0.5 cursor-pointer'
                    }`}
                >
                  <div className="card-neon-edge" />
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                      <Target size={18} />
                    </div>
                    {playedGamesSet.has('numberguess') ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#180c19] px-2 py-0.5 rounded-full border border-emerald-400/20">
                        <CheckCircle2 size={11} className="text-emerald-400" /> SETTLED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                        2X PAYOUT
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase mb-0.5">
                    Cipher Pin Code
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans mb-2 line-clamp-2">
                    Crack the secret 1-10 pin code within 5 precision attempts to double your chips.
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-400/20">
                    <span className="text-amber-200/60 text-[11px]">Payout: 2.0x</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1 text-[11px]">
                      {playedGamesSet.has('numberguess') ? 'SETTLED' : 'ENTER TABLE'} <ChevronRight size={13} />
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
                  onChipUpdate(30);
                }
                onComplete(0);
              }}
              className="btn-marquee-gold py-2.5 px-7 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50"
            >
              Continue To Next Stage
            </button>
            <span className="text-[10px] sm:text-xs font-mono text-amber-200/60 mt-1 tracking-wider">
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
        onPlayed={() => markGameAsPlayed('wheel')}
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
        onPlayed={() => markGameAsPlayed('datadash')}
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
        onPlayed={() => markGameAsPlayed('cardgame')}
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
        onPlayed={() => markGameAsPlayed('dicegame')}
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
        onPlayed={() => markGameAsPlayed('minesgame')}
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
        onPlayed={() => markGameAsPlayed('numberguess')}
      />
    );
  }

  return null;
}