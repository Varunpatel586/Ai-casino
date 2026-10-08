import React, { useState, useEffect } from 'react';

interface MinesGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
  onPlayed?: () => void;
}

interface Cell {
  index: number;
  revealed: boolean;
  isMine: boolean;
  content: string;
}

const MinesGame: React.FC<MinesGameProps> = ({ onBack, onSelectBonusBet, onChipUpdate, selectedBet, currentChips, onPlayed }) => {
  const [minesGrid, setMinesGrid] = useState<Cell[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [diamondsFound, setDiamondsFound] = useState(0);
  const [canCashOut, setCanCashOut] = useState(false);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);

  const gridSize = 25; // 5x5 grid
  const mineCount = 5; // 5 mines

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Generate mines positions
    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const randomIndex = Math.floor(Math.random() * gridSize);
      if (!newMines.includes(randomIndex)) {
        newMines.push(randomIndex);
      }
    }
    setMines(newMines);

    // Initialize grid
    const initialGrid: Cell[] = [];
    for (let i = 0; i < gridSize; i++) {
      initialGrid.push({
        index: i,
        revealed: false,
        isMine: newMines.includes(i),
        content: '',
      });
    }
    setMinesGrid(initialGrid);
    setGameOver(false);
    setGameWon(false);
    setRevealedCount(0);
    setDiamondsFound(0);
    setCanCashOut(false);
    setHasDeductedBet(false);
  };

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'mines');
    onPlayed?.();
  };

  const handleCellClick = (index: number) => {
    if (gameOver || gameWon || minesGrid[index].revealed || !selectedBet || !hasDeductedBet) return;

    const newGrid = [...minesGrid];
    newGrid[index].revealed = true;
    const newRevealedCount = revealedCount + 1;
    setRevealedCount(newRevealedCount);

    if (mines.includes(index)) {
      newGrid[index].isMine = true;
      newGrid[index].content = '💣';
      setGameOver(true);

      mines.forEach(mineIndex => {
        newGrid[mineIndex].revealed = true;
        newGrid[mineIndex].isMine = true;
        newGrid[mineIndex].content = '💣';
      });

      // Mine detonation wipes total bankroll to 0 directly
      onChipUpdate(0);
      setMinesGrid(newGrid);
      return;
    } else {
      newGrid[index].content = '💎';
      const newDiamondsFound = diamondsFound + 1;
      setDiamondsFound(newDiamondsFound);
      setCanCashOut(true);

      if (newRevealedCount === gridSize - mineCount) {
        setGameWon(true);
        const profit = Math.floor((selectedBet || 0) * 0.5 * newDiamondsFound);
        onChipUpdate(currentChips + (selectedBet || 0) + profit);
      }
    }

    setMinesGrid(newGrid);
  };

  const handleCashOut = () => {
    if (!canCashOut || gameOver || gameWon) return;
    setGameWon(true);
    const profit = Math.floor((selectedBet || 0) * 0.5 * diamondsFound);
    onChipUpdate(currentChips + (selectedBet || 0) + profit);
  };

  const getCellClass = (cell: Cell) => {
    let classes = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer select-none border-2';

    if (cell.revealed) {
      if (cell.isMine) {
        classes += ' bg-rose-950/90 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-105';
      } else {
        classes += ' bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105';
      }
    } else {
      classes += ' bg-[#180c19] border-amber-400/25 text-amber-200/50 hover:border-amber-400 hover:bg-[#261327] hover:scale-105 active:scale-95 shadow-sm';
    }

    return classes;
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full casino-vip-card rounded-2xl p-4 sm:p-5 text-center shadow-2xl my-auto relative overflow-hidden">
        <div className="card-neon-edge" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-rose-400/40 text-rose-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-[0_0_12px_rgba(225,29,72,0.25)]">
          <span>💣 Side Action // High Stakes</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
          Vault Grid Mines
        </h2>
        <p className="text-amber-200/70 text-xs font-sans mb-3">
          Uncover hidden diamonds in a 5x5 security grid. Each diamond pays +0.5x. Cash out anytime before hitting a mine.
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
              <p className="text-xs font-mono text-rose-400 mt-1.5">Insufficient chips to enter this vault.</p>
            )}
          </div>
        )}

        {/* Active Grid Control Header */}
        {hasDeductedBet && (
          <div className="flex items-center justify-between p-2.5 bg-[#180c19] border border-amber-400/30 rounded-xl mb-3 shadow-sm">
            <div className="text-left font-mono">
              <span className="text-[9px] uppercase text-amber-200/70 tracking-wider block">Diamonds Found</span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                💎 {diamondsFound}
              </span>
            </div>

            {canCashOut && !gameOver && !gameWon && (
              <button
                onClick={handleCashOut}
                className="btn-marquee-gold py-1.5 px-4 text-black font-extrabold text-[11px] uppercase tracking-[0.16em] rounded-lg cursor-pointer select-none group border border-amber-200/50"
              >
                Cash Out (+{Math.floor((selectedBet || 0) * 0.5 * diamondsFound)} Chips)
              </button>
            )}
          </div>
        )}

        {/* 5x5 Vault Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-fit mx-auto mb-3 p-2 sm:p-3 bg-[#0a050b] border border-amber-400/30 rounded-xl shadow-inner">
          {minesGrid.map((cell) => (
            <div
              key={cell.index}
              className={getCellClass(cell)}
              onClick={() => handleCellClick(cell.index)}
            >
              {cell.revealed ? (
                <span className={cell.isMine ? 'animate-pulse' : ''}>
                  {cell.content}
                </span>
              ) : (
                <span className="text-xs font-mono text-amber-500/40 select-none">#</span>
              )}
            </div>
          ))}
        </div>

        {/* Game Status Messages */}
        {gameOver && (
          <div className="p-2.5 sm:p-3 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 mb-3 shadow-[0_0_20px_rgba(225,29,72,0.25)] animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] block mb-0.5 text-rose-400">
              Security Breach Triggered
            </span>
            <p className="text-lg font-display font-black uppercase mb-0.5">
              Mine Detonated!
            </p>
            <p className="text-xs font-mono">
              You uncovered a mine in the security vault. Bankroll reduced to $0.
            </p>
          </div>
        )}

        {gameWon && (
          <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] block mb-0.5 text-emerald-400">
              Vault Evacuated Safely
            </span>
            <p className="text-lg font-display font-black uppercase mb-0.5">
              Chips Secured!
            </p>
            <p className="text-xs font-mono">
              Successfully cashed out with +{Math.floor((selectedBet || 0) * 0.5 * diamondsFound)} chips added to bankroll.
            </p>
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

export default MinesGame;
