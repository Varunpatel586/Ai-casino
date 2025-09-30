import React, { useState } from 'react';
import Button from '../UIComponents/Button';

interface DiceGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

const DiceGame: React.FC<DiceGameProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const [dice1, setDice1] = useState<number | string>('?');
  const [dice2, setDice2] = useState<number | string>('?');
  const [rolling, setRolling] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const handleRoll = () => {
    if (!selectedBet || rolling || !userGuess) return;
    
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
        setIsWin(sum === guess);
      }
    }, 100);
  };

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Dice Roll</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'dice')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'dice')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'dice')}
        >
          $30
        </div>
      </div>
      
      <div className="my-8 text-center">
        <label htmlFor="diceSumInput" className="block text-xl mb-2">
          Guess the sum (2-12):
        </label>
        <input 
          type="number" 
          id="diceSumInput"
          className="w-24 text-2xl p-2 text-center rounded border-2 border-gray-300 focus:border-blue-500 focus:outline-none" 
          min="2" 
          max="12"
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          disabled={rolling}
        />
      </div>
      
      <div className="flex justify-center items-center my-8">
        <div className={`dice ${rolling ? 'dice-rolling' : ''} mx-4`}>
          {dice1}
        </div>
        <div className={`dice ${rolling ? 'dice-rolling' : ''} mx-4`}>
          {dice2}
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={handleRoll} 
          disabled={rolling || !selectedBet || !userGuess}
          className="px-8 py-3 text-xl"
        >
          {rolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </div>
      
      {showResult && (
        <div className={`text-2xl font-bold text-center my-4 ${isWin ? 'text-green-500' : 'text-red-500'}`}>
          {isWin ? 'You won!' : 'You lost!'} Sum was {parseInt(dice1.toString()) + parseInt(dice2.toString())}
        </div>
      )}
      
      <div id="diceResult" className="text-center text-xl font-semibold">{result}</div>
    </div>
  );
};

export default DiceGame;
