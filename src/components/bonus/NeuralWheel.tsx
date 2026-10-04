import React, { useRef, useState, useEffect } from 'react';

interface NeuralWheelProps {
  onBack: () => void;
  onSelectBonusBet: (amount: number, gameType: string) => void;
  onChipUpdate: (chips: number) => void;
  selectedBet: number | null;
  result: string;
  currentChips: number;
}

interface WheelSegment {
  color: string;
  result: string;
  multiplier: number;
  displayText: string;
}

const NeuralWheel: React.FC<NeuralWheelProps> = ({ onBack, onChipUpdate, currentChips }) => {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wheelResult, setWheelResult] = useState<WheelSegment | null>(null);


  const wheelSegments: WheelSegment[] = [
    { color: '#FF6B6B', result: 'Lose Turn', multiplier: 0, displayText: 'LOSE' },
    { color: '#4ECDC4', result: '50 Points', multiplier: 50, displayText: '50' },
    { color: '#45B7D1', result: '20 Points', multiplier: 20, displayText: '20' },
    { color: '#96CEB4', result: '30 Points', multiplier: 30, displayText: '30' },
    { color: '#FFEAA7', result: '10 Points', multiplier: 10, displayText: '10' },
    { color: '#DDA0DD', result: 'Jackpot!', multiplier: 100, displayText: '100' },
    { color: '#FF7675', result: 'Try Again', multiplier: 0, displayText: 'TRY' },
    { color: '#74B9FF', result: '40 Points', multiplier: 40, displayText: '40' },
  ];

  // Debug logging
  useEffect(() => {
    console.log('NeuralWheel: Component mounted with', wheelSegments.length, 'segments');
    console.log('NeuralWheel: Wheel segments:', wheelSegments);
  }, []);

  useEffect(() => {
    console.log('NeuralWheel: isSpinning changed to', isSpinning);
  }, [isSpinning]);

  useEffect(() => {
    console.log('NeuralWheel: wheelResult changed to', wheelResult);
  }, [wheelResult]);

  useEffect(() => {
    console.log('NeuralWheel: Component is rendering');
  });

  useEffect(() => {
    console.log('NeuralWheel: Wheel segments loaded:', wheelSegments);
  }, []);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    console.log('NeuralWheel: Starting spin');
    setIsSpinning(true);

    setWheelResult(null);
    setHasSpun(true); // Prevent multiple spins

    // Generate a random spin (multiple rotations plus a random segment)
    const spins = 5 + Math.random() * 3; // 5-8 full rotations for more unpredictability
    const degreesPerSegment = 360 / wheelSegments.length;
    
    // When player is broke or out of chips, guarantee landing on a winning segment (multiplier > 0)
    // Indices [1, 2, 3, 5, 7] correspond to 50, 20, 30, 100, 40 points (guaranteeing $20-$100 chips for next rounds)
    const winningSegments = [1, 2, 3, 5, 7];
    const randomSegment = currentChips <= 0
      ? winningSegments[Math.floor(Math.random() * winningSegments.length)]
      : Math.floor(Math.random() * wheelSegments.length);
    const totalDegrees = spins * 360 + randomSegment * degreesPerSegment;

    console.log('NeuralWheel: Spinning to segment', randomSegment, 'with total degrees:', totalDegrees);

    // Apply the rotation
    if (wheelRef.current) {
      // Force a style recalculation
      wheelRef.current.style.transform = 'rotate(0deg)';

      // Use requestAnimationFrame to ensure the style is applied before starting the animation
      requestAnimationFrame(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
          wheelRef.current.style.transform = `rotate(${totalDegrees}deg)`;
          console.log('NeuralWheel: Applied rotation transform');
        }
      });
    }

    // After the animation, determine the result
    setTimeout(() => {
      const result = wheelSegments[randomSegment];
      console.log('NeuralWheel: Spin result:', result);
      setWheelResult(result);

      setIsSpinning(false);

      // Calculate and update earnings (no chip deduction for free play)
      let earnings = 0;
      if (result.multiplier > 0) {
        earnings = result.multiplier; // Use the actual multiplier value
        console.log('NeuralWheel: Free spin! Awarding', earnings, 'chips for', result.result);
        onChipUpdate(currentChips + earnings);
      } else if (currentChips <= 0) {
        // Guaranteed bailout safety net: minimum 30 chips
        earnings = 30;
        console.log('NeuralWheel: Emergency rescue! Awarding', earnings, 'chips');
        onChipUpdate(currentChips + earnings);
      } else {
        console.log('NeuralWheel: No earnings for', result.result, '- multiplier:', result.multiplier);
      }
    }, 4000);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
      <div className="max-w-md w-full bg-[#12151E] border border-[#232938] rounded-2xl p-4 sm:p-6 text-center shadow-2xl my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
          <span>Free Side Action</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
          Neural Roulette
        </h2>
        <p className="text-slate-400 text-xs font-sans mb-2">
          Zero-risk house spin. Land on points or the Jackpot to credit your tournament bankroll.
        </p>


        {/* Wheel Assembly */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-4 p-1.5 rounded-full bg-[#0D0F16] border-4 border-[#283248] shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-amber-400"></div>
          </div>

          {wheelSegments.length > 0 ? (
            <svg
              ref={wheelRef}
              className="w-full h-full rounded-full"
              viewBox="0 0 400 400"
              style={{
                transformOrigin: 'center',
                transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none'
              }}
            >
              {wheelSegments.map((segment, index) => {
                const angle = (360 / wheelSegments.length) * index;
                const nextAngle = (360 / wheelSegments.length) * (index + 1);

                // Convert angles to radians for calculations
                const startAngleRad = (angle * Math.PI) / 180;
                const endAngleRad = (nextAngle * Math.PI) / 180;

                // Calculate path coordinates
                const outerRadius = 185;
                const x1 = 200 + outerRadius * Math.cos(startAngleRad);
                const y1 = 200 + outerRadius * Math.sin(startAngleRad);
                const x2 = 200 + outerRadius * Math.cos(endAngleRad);
                const y2 = 200 + outerRadius * Math.sin(endAngleRad);

                return (
                  <g key={index}>
                    {/* Segment background */}
                    <path
                      d={`M 200 200 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#12151E"
                      strokeWidth="3"
                    />

                    {/* Text label */}
                    <text
                      x={200 + 120 * Math.cos((angle + (360 / wheelSegments.length) / 2) * Math.PI / 180)}
                      y={200 + 120 * Math.sin((angle + (360 / wheelSegments.length) / 2) * Math.PI / 180)}
                      fill="#FFFFFF"
                      fontSize="17"
                      fontWeight="900"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      stroke="#000000"
                      strokeWidth="0.5"
                    >
                      {segment.displayText}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="text-white text-center">
              <div className="text-sm font-mono opacity-75">Loading wheel...</div>
            </div>
          )}

          {/* Center Brass Hub */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-700 border-2 border-amber-300 shadow-xl flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#12151E] border border-amber-500/40 flex items-center justify-center">
                <span className="text-[11px] font-mono font-black text-amber-400 tracking-wider">
                  {isSpinning ? '...' : 'TURING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spin Result Display */}
        {wheelResult && (
          <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4 mb-6 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest block mb-1">
              Wheel Settlement
            </span>
            <p className="text-2xl font-display font-black text-white mb-1">
              {wheelResult.result}
            </p>
            <p className="text-sm font-mono font-bold" style={{ color: (wheelResult.multiplier > 0 || currentChips <= 0) ? '#10B981' : '#F43F5E' }}>
              {wheelResult.multiplier > 0
                ? `+${wheelResult.multiplier} Chips Credited`
                : currentChips <= 0
                ? '+30 Chips Credited'
                : 'No chips credited. Better luck on the main floor.'}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isSpinning && !wheelResult && (
            <button
              onClick={handleSpin}
              disabled={hasSpun}
              className="py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Spin Wheel
            </button>
          )}

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

export default NeuralWheel;
