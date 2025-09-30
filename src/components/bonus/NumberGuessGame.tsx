import React, { useState, useEffect } from 'react';
import Button from '../UIComponents/Button';

interface NumberGuessGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

const NumberGuessGame: React.FC<NumberGuessGameProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetNumber(Math.floor(Math.random() * 10) + 1);
    setUserGuess(null);
    setMessage('');
    setGameOver(false);
    setAttempts(0);
  };

  const handleGuess = (number: number) => {
    if (gameOver || !selectedBet) return;
    
    setUserGuess(number);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (number === targetNumber) {
      setMessage(`Correct! The number was ${number}.`);
      setGameOver(true);
    } else if (newAttempts >= maxAttempts) {
      setMessage(`Game Over! The number was ${targetNumber}.`);
      setGameOver(true);
    } else {
      setMessage(`Wrong! Try again. Attempts left: ${maxAttempts - newAttempts}`);
    }
  };

  const renderNumberButtons = () => {
    return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => handleGuess(num)}
        disabled={gameOver || userGuess === num}
        className={`w-12 h-12 m-1 rounded-full text-xl font-bold transition-colors ${
          userGuess === num
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        } ${gameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {num}
      </button>
    ));
  };

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Number Guess</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'number')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'number')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'number')}
        >
          $30
        </div>
      </div>
      
      <div className="my-8 text-center">
        <div className="text-2xl font-bold mb-4">
          Guess a number between 1 and 10
        </div>
        <div className="text-xl mb-6">
          Attempts: {attempts} / {maxAttempts}
        </div>
        
        <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto mb-6">
          {renderNumberButtons()}
        </div>
        
        {message && (
          <div className={`text-xl font-semibold my-4 ${
            gameOver && userGuess === targetNumber ? 'text-green-500' : 
            gameOver ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {message}
          </div>
        )}
        
        {gameOver && (
          <Button 
            onClick={startNewGame}
            className="mt-4 px-6 py-2"
          >
            Play Again
          </Button>
        )}
      </div>
      
      <div id="numberResult" className="text-center text-xl font-semibold">{result}</div>
    </div>
  );
};

export default NumberGuessGame;
