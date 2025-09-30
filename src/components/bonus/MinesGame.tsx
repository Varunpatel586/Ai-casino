import React, { useState, useEffect } from 'react';
import Button from '../UIComponents/Button';

interface MinesGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

interface Cell {
  index: number;
  revealed: boolean;
  isMine: boolean;
  content: string;
}

const MinesGame: React.FC<MinesGameProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const [minesGrid, setMinesGrid] = useState<Cell[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const gridSize = 25;
    const mineCount = 5;
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

  const handleCellClick = (index: number) => {
    if (gameOver || gameWon || minesGrid[index].revealed || !selectedBet) return;
    
    const newGrid = [...minesGrid];
    newGrid[index].revealed = true;
    const newRevealedCount = revealedCount + 1;
    setRevealedCount(newRevealedCount);
    
    if (mines.includes(index)) {
      // Hit a mine
      newGrid[index].isMine = true;
      newGrid[index].content = '💣';
      setGameOver(true);
      
      // Reveal all mines
      mines.forEach(mineIndex => {
        newGrid[mineIndex].revealed = true;
        newGrid[mineIndex].isMine = true;
        newGrid[mineIndex].content = '💣';
      });
      
      setMinesGrid(newGrid);
      return;
    } else {
      // Safe cell
      newGrid[index].content = '💎';
      setMinesGrid(newGrid);
      
      // Check if won
      if (newRevealedCount === 20) { // 25 total - 5 mines = 20 safe cells
        setGameWon(true);
      }
    }
  };

  const getCellClass = (cell: Cell) => {
    let classes = 'w-12 h-12 flex items-center justify-center text-2xl font-bold border border-gray-600 cursor-pointer transition-all duration-200';
    
    if (cell.revealed) {
      if (cell.isMine) {
        classes += ' bg-red-500';
      } else {
        classes += ' bg-green-100';
      }
    } else {
      classes += ' bg-gray-300 hover:bg-gray-200';
    }
    
    return classes;
  };

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Mines of Probability</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'mines')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'mines')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'mines')}
        >
          $30
        </div>
      </div>
      
      <div className="my-6 text-center">
        <p className="text-lg mb-2">Find the gems and avoid the mines!</p>
        <p className="text-sm text-gray-400">Reveal all gems to win</p>
      </div>
      
      <div className="mines-grid grid grid-cols-5 gap-1 max-w-xs mx-auto mb-6">
        {minesGrid.map((cell) => (
          <div
            key={cell.index}
            className={getCellClass(cell)}
            onClick={() => handleCellClick(cell.index)}
          >
            {cell.revealed ? cell.content : '?'}
          </div>
        ))}
      </div>
      
      {(gameOver || gameWon) && (
        <div className={`text-2xl font-bold text-center my-4 ${gameWon ? 'text-green-500' : 'text-red-500'}`}>
          {gameWon ? 'You Won! All gems found!' : 'Game Over! You hit a mine!'}
        </div>
      )}
      
      <div className="text-center mt-4">
        <Button onClick={initGame} className="px-6 py-2">
          New Game
        </Button>
      </div>
      
      <div id="minesResult" className="text-center text-xl font-semibold mt-4">{result}</div>
    </div>
  );
};

export default MinesGame;
