import React, { useRef, useState } from 'react';
import Button from '../UIComponents/Button';

interface NeuralWheelProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  selectedBet: number | null;
  result: string;
}

interface WheelSegment {
  color: string;
  result: string;
  multiplier: number;
}

const NeuralWheel: React.FC<NeuralWheelProps> = ({ onBack, onSelectBonusBet, selectedBet, result }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<WheelSegment | null>(null);
  const [showResult, setShowResult] = useState(false);

  const wheelSegments: WheelSegment[] = [
    { color: '#FF0000', result: '10 Points #FF0000', multiplier: 1.5 },
    { color: '#00FF00', result: '20 Points #00FF00', multiplier: 2 },
    { color: '#0000FF', result: '30 Points #0000FF', multiplier: 2.5 },
    { color: '#FFFF00', result: '40 Points #FFFF00', multiplier: 3 },
    { color: '#FF00FF', result: '50 Points #FF00FF', multiplier: 5 },
    { color: '#00FFFF', result: 'Try Next time! #00FFFF', multiplier: 0 },
    { color: '#FFA500', result: 'Jackpot, 100 points #FFA500', multiplier: 10 },
    { color: '#800080', result: 'Nothing to Win #800080', multiplier: -1 },
  ];

  const handleSpin = () => {
    if (isSpinning || !selectedBet) return;

    setIsSpinning(true);
    setShowResult(false);
    setWheelResult(null);
    
    // Generate a random spin (multiple rotations plus a random segment)
    const spins = 5; // Number of full rotations
    const degreesPerSegment = 360 / wheelSegments.length;
    const randomSegment = Math.floor(Math.random() * wheelSegments.length);
    const totalDegrees = spins * 360 + randomSegment * degreesPerSegment;

    // Apply the rotation
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
      wheelRef.current.style.transform = `rotate(${totalDegrees}deg)`;
    }

    // After the animation, determine the result
    setTimeout(() => {
      const result = wheelSegments[wheelSegments.length - 1 - randomSegment];
      setWheelResult(result);
      setShowResult(true);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <div className="mini-game-container active">
      <div className="mini-game-header">
        <h3>Neural Wheel</h3>
        <Button className="btn-secondary" onClick={onBack}>Back</Button>
      </div>
      
      <div className="betting-options">
        <div 
          className={`bet-option ${selectedBet === 10 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(10, 'wheel')}
        >
          $10
        </div>
        <div 
          className={`bet-option ${selectedBet === 20 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(20, 'wheel')}
        >
          $20
        </div>
        <div 
          className={`bet-option ${selectedBet === 30 ? 'selected' : ''}`}
          onClick={() => onSelectBonusBet(30, 'wheel')}
        >
          $30
        </div>
      </div>

      <div className="wheel-section my-8">
        <div className="relative w-64 h-64 mx-auto">
          <div className="wheel-pointer absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-600 z-10"></div>
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full transition-transform duration-4000 ease-out"
            style={{
              background: `conic-gradient(
                ${wheelSegments.map((segment, index) => 
                  `${segment.color} ${index * 45}deg ${(index + 1) * 45}deg`
                ).join(', ')}
              )`,
              transform: 'rotate(0deg)'
            }}
          ></div>
        </div>
        
        <div className="wheel-reference mt-8 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-xl font-bold text-center mb-4">Prize Reference</h4>
          <ul className="grid grid-cols-2 gap-2">
            {wheelSegments.map((segment, index) => (
              <li key={index} className="flex items-center text-sm">
                <span 
                  className="color-indicator w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: segment.color }}
                ></span>
                <span className="truncate">{segment.result}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={handleSpin} 
          disabled={isSpinning || !selectedBet}
          className={`px-8 py-3 text-xl ${isSpinning ? 'opacity-75' : ''}`}
        >
          {isSpinning ? 'Spinning...' : 'Spin Wheel'}
        </Button>
      </div>
      
      {showResult && wheelResult && (
        <div className="mt-6 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">
            {wheelResult.multiplier > 0 
              ? `You won ${selectedBet && selectedBet * wheelResult.multiplier} chips!` 
              : 'Better luck next time!'}
          </div>
          <div className="text-lg">{wheelResult.result}</div>
        </div>
      )}
      
      <div id="wheelResult" className="text-center text-xl font-semibold mt-4">{result}</div>
    </div>
  );
};

export default NeuralWheel;
