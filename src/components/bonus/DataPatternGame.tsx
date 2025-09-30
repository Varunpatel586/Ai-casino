import React, { useState, useEffect } from 'react';
import Button from '../UIComponents/Button';

interface DataPatternGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

const DataPatternGame: React.FC<DataPatternGameProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const [pattern, setPattern] = useState('');
  const [answer, setAnswer] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const patterns = [
      { pattern: '101?101', answer: '0' },
      { pattern: '110?11', answer: '0' },
      { pattern: '01?010', answer: '1' },
      { pattern: '111?111', answer: '1' },
      { pattern: '00?000', answer: '0' }
    ];
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setPattern(selectedPattern.pattern);
    setAnswer(selectedPattern.answer);
    setUserInput('');
    setShowResult(false);
  };

  const handleSubmit = () => {
    if (!selectedBet) {
      alert('Please place your bet first!');
      return;
    }
    setShowResult(true);
  };

  const getPatternDisplay = () => {
    if (!showResult) return pattern;
    return pattern.replace('?', answer);
  };

  const isCorrect = userInput === answer;

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Data Dash</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'data')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'data')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'data')}
        >
          $30
        </div>
      </div>
      <div className="text-4xl font-mono my-8 text-center">
        {getPatternDisplay()}
      </div>
      <div className="flex flex-col items-center">
        <input 
          type="text" 
          className="pattern-input w-20 text-3xl text-center p-2 rounded border-2 border-gray-300 focus:border-blue-500 focus:outline-none" 
          maxLength={1}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.replace(/[^01]/g, ''))}
          placeholder="0/1"
        />
        <Button 
          onClick={handleSubmit} 
          className="mt-4"
          disabled={!userInput || !selectedBet}
        >
          Submit
        </Button>
      </div>
      {showResult && (
        <div className={`text-2xl font-bold text-center my-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {isCorrect ? 'Correct!' : `Incorrect! The answer was ${answer}`}
        </div>
      )}
      <div id="dataResult" className="text-center text-xl font-semibold">{result}</div>
    </div>
  );
};

export default DataPatternGame;
