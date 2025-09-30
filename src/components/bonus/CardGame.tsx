import React, { useState, useEffect } from 'react';
import Button from '../UIComponents/Button';

interface CardGameProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

const CardGame: React.FC<CardGameProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const [winningCard, setWinningCard] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newWinningCard = Math.random() > 0.5 ? 'spade' : 'heart';
    setWinningCard(newWinningCard);
    setSelectedCard('');
    setShowResult(false);
  };

  const handleCardSelect = (cardType: string) => {
    if (!selectedBet || showResult) return;
    
    setSelectedCard(cardType);
    setShowResult(true);
  };

  const getCardClass = (cardType: string) => {
    let classes = 'w-32 h-48 flex items-center justify-center text-6xl rounded-xl m-4 transition-all duration-300 cursor-pointer';
    if (showResult) {
      if (cardType === 'spade') {
        classes += ' bg-black text-white';
      } else {
        classes += ' bg-red-600 text-white';
      }
      if (cardType === selectedCard) {
        classes += ' transform scale-110 ring-4 ring-yellow-400';
      }
    } else {
      classes += ' bg-gray-800 text-gray-600 hover:bg-gray-700';
    }
    return classes;
  };

  const getCardContent = (cardType: string) => {
    if (!showResult) return '?';
    return cardType === 'spade' ? '♠' : '♥';
  };

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Card Flip</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'card')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'card')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'card')}
        >
          $30
        </div>
      </div>
      <div className="flex justify-center items-center my-8">
        <div 
          className={getCardClass('spade')}
          onClick={() => handleCardSelect('spade')}
        >
          {getCardContent('spade')}
        </div>
        <div 
          className={getCardClass('heart')}
          onClick={() => handleCardSelect('heart')}
        >
          {getCardContent('heart')}
        </div>
      </div>
      {showResult && (
        <div className="text-2xl font-bold text-center my-4">
          {selectedCard === winningCard ? 'You won!' : 'You lost!'}
        </div>
      )}
      <div id="cardResult" className="text-center text-xl font-semibold">{result}</div>
    </div>
  );
};

export default CardGame;
