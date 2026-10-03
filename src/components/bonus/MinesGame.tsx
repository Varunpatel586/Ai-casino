import React, { useState, useEffect } from 'react';

interface MinesGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

interface Cell {
  index: number;
  revealed: boolean;
  isMine: boolean;
  content: string;
}

const MinesGame: React.FC<MinesGameProps> = ({ onBack, onSelectBonusBet, onChipUpdate, selectedBet, currentChips }) => {
  const [minesGrid, setMinesGrid] = useState<Cell[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [diamondsFound, setDiamondsFound] = useState(0);
  const [hasDeductedBet, setHasDeductedBet] = useState(false);
  const [canCashOut, setCanCashOut] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const gridSize = 25;
    const mineCount = 2; // Lowered from 5 to 2 so wipeouts are less common
    const newMines: number[] = [];

    // Place mines randomly
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * gridSize);
      if (!newMines.includes(pos)) {
        newMines.push(pos);
      }
    }

    setMines(newMines);
    setGameOver(false);
    setGameWon(false);
    setRevealedCount(0);
    setDiamondsFound(0);
    setCanCashOut(false);
    setHasDeductedBet(false);

    // Create grid cells
    const grid: Cell[] = [];
    for (let i = 0; i < gridSize; i++) {
      grid.push({
        index: i,
        revealed: false,
        isMine: newMines.includes(i),
        content: ''
      });
    }
    setMinesGrid(grid);
  };

  const handleBetSelect = (amount: number) => {
    if (amount > currentChips) {
      alert(`You don't have enough chips! You need ${amount} chips but only have ${currentChips}.`);
      return;
    }

    // Deduct chips immediately when bet is placed
    console.log('MinesGame: Deducting', amount, 'chips for mines game');
    onChipUpdate(currentChips - amount);
    setHasDeductedBet(true);
    onSelectBonusBet(amount, 'mines');
  };

  const handleCellClick = (index: number) => {
    if (gameOver || gameWon || minesGrid[index].revealed || !selectedBet || !hasDeductedBet) return;

    const newGrid = [...minesGrid];
    newGrid[index].revealed = true;
    const newRevealedCount = revealedCount + 1;
    setRevealedCount(newRevealedCount);

    if (mines.includes(index)) {
      // Hit a mine - lose all chips
      newGrid[index].isMine = true;
      newGrid[index].content = '💣';
      setGameOver(true);

      // Reveal all mines
      mines.forEach(mineIndex => {
        newGrid[mineIndex].revealed = true;
        newGrid[mineIndex].isMine = true;
        newGrid[mineIndex].content = '💣';
      });

      // Lose all chips
      console.log('MinesGame: Player hit mine! Setting chips to 0');
      onChipUpdate(0);

      setMinesGrid(newGrid);
      return;
    } else {
      // Found a diamond - give immediate reward
      newGrid[index].content = '💎';
      const newDiamondsFound = diamondsFound + 1;
      setDiamondsFound(newDiamondsFound);
      setCanCashOut(true);

      // Give immediate chip reward for each diamond
      const diamondReward = Math.floor(selectedBet * 0.5); // 0.5x bet per diamond
      console.log('MinesGame: Found diamond! Awarding', diamondReward, 'chips');
      onChipUpdate(currentChips + diamondReward);

      setMinesGrid(newGrid);
    }
  };

  const handleCashOut = () => {
    if (!canCashOut || gameOver || gameWon) return;

    setGameWon(true);
    console.log('MinesGame: Player cashed out with', diamondsFound, 'diamonds found');
  };

  const getCellClass = (cell: Cell) => {
    let classes = 'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-xl transition-all duration-200 cursor-pointer select-none border-2';

    if (cell.revealed) {
      if (cell.isMine) {
        classes += ' bg-rose-950/90 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-105';
      } else {
        classes += ' bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-105';
      }
    } else {
      classes += ' bg-[#181D2A] border-[#283248] text-slate-500 hover:border-amber-400/60 hover:bg-[#1E2536] hover:scale-105 active:scale-95 shadow-sm';
    }

    return classes;
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      <div className="max-w-md sm:max-w-lg w-full bg-[#12151E] border border-[#232938] rounded-2xl p-4 sm:p-6 text-center shadow-2xl my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-rose-500/30 text-rose-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
          <span>Side Action // High Stakes</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
          Vault Grid Mines
        </h2>
        <p className="text-slate-400 text-xs font-sans mb-3">
          Uncover hidden diamonds in a 5x5 security grid. Each diamond pays +0.5x. Cash out anytime before hitting a mine.
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
              <p className="text-xs font-mono text-rose-400 mt-2">Insufficient chips to enter this vault.</p>
            )}
          </div>
        )}

        {/* Active Grid Control Header */}
        {hasDeductedBet && (
          <div className="flex items-center justify-between p-3.5 bg-[#181D2A] border border-[#283248] rounded-xl mb-5">
            <div className="text-left font-mono">
              <span className="text-[10px] uppercase text-slate-400 block">Diamonds Found</span>
              <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                💎 {diamondsFound}
              </span>
            </div>

            {canCashOut && !gameOver && !gameWon && (
              <button
                onClick={handleCashOut}
                className="py-2 px-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer"
              >
                Cash Out (+{Math.floor((selectedBet || 0) * 0.5 * diamondsFound)} Chips)
              </button>
            )}
          </div>
        )}

        {/* 5x5 Vault Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 max-w-fit mx-auto mb-6 p-3 sm:p-4 bg-[#0E1118] border border-[#232938] rounded-2xl shadow-inner">
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
                <span className="text-xs font-mono text-slate-600 select-none">#</span>
              )}
            </div>
          ))}
        </div>

        {/* Game Status Messages */}
        {gameOver && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 mb-6 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-0.5 text-rose-400">
              Security Breach Triggered
            </span>
            <p className="text-xl font-display font-black uppercase mb-1">
              Mine Detonated!
            </p>
            <p className="text-xs font-mono">
              You uncovered a mine in the security vault. Bankroll cleared to 0.
            </p>
          </div>
        )}

        {gameWon && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 mb-6 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-0.5 text-emerald-400">
              Vault Evacuated Safely
            </span>
            <p className="text-xl font-display font-black uppercase mb-1">
              Chips Secured!
            </p>
            <p className="text-xs font-mono">
              Successfully cashed out with +{Math.floor((selectedBet || 0) * 0.5 * diamondsFound)} chips added to bankroll.
            </p>
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

export default MinesGame;
