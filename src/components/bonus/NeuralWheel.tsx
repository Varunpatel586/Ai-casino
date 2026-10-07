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
    { color: '#e11d48', result: 'Lose Turn', multiplier: 0, displayText: 'LOSE' },
    { color: '#0d9488', result: '50 Points', multiplier: 50, displayText: '50' },
    { color: '#0284c7', result: '20 Points', multiplier: 20, displayText: '20' },
    { color: '#059669', result: '30 Points', multiplier: 30, displayText: '30' },
    { color: '#d97706', result: '10 Points', multiplier: 10, displayText: '10' },
    { color: '#9333ea', result: 'Jackpot!', multiplier: 100, displayText: '100' },
    { color: '#be123c', result: 'Try Again', multiplier: 0, displayText: 'TRY' },
    { color: '#2563eb', result: '40 Points', multiplier: 40, displayText: '40' },
  ];

  useEffect(() => {
    console.log('NeuralWheel: Component mounted with', wheelSegments.length, 'segments');
  }, []);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWheelResult(null);
    setHasSpun(true);

    const spins = 5 + Math.random() * 3;
    const degreesPerSegment = 360 / wheelSegments.length;
    
    const winningSegments = [1, 2, 3, 5, 7];
    const randomSegment = currentChips <= 0
      ? winningSegments[Math.floor(Math.random() * winningSegments.length)]
      : Math.floor(Math.random() * wheelSegments.length);
    const totalDegrees = spins * 360 + randomSegment * degreesPerSegment;

    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
      requestAnimationFrame(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
          wheelRef.current.style.transform = `rotate(${totalDegrees}deg)`;
        }
      });
    }

    setTimeout(() => {
      const result = wheelSegments[randomSegment];
      setWheelResult(result);
      setIsSpinning(false);

      let earnings = 0;
      if (result.multiplier > 0) {
        earnings = result.multiplier;
        onChipUpdate(currentChips + earnings);
      } else if (currentChips <= 0) {
        earnings = 30;
        onChipUpdate(currentChips + earnings);
      }
    }, 4000);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md w-full casino-vip-card rounded-2xl p-4 sm:p-5 text-center shadow-2xl my-auto relative overflow-hidden">
        <div className="card-neon-edge" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1b0d18]/90 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <span>✨ Free Side Action</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight mb-0.5 white-metallic-text">
          Neural Roulette
        </h2>
        <p className="text-amber-200/70 text-xs font-sans mb-2.5">
          Zero-risk house spin. Land on points or the Jackpot to credit your tournament bankroll.
        </p>

        {/* Wheel Assembly */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 max-h-[28vh] max-w-[28vh] mx-auto mb-3 p-1 rounded-full bg-[#08040a] border-3 border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.35),inset_0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-[0_4px_8px_rgba(245,158,11,0.8)]">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-amber-300" />
          </div>

          {wheelSegments.length > 0 ? (
            <svg
              ref={wheelRef}
              className="w-full h-full rounded-full"
              viewBox="0 0 400 400"
              style={{
                transformOrigin: 'center',
                transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
              }}
            >
              {wheelSegments.map((segment, index) => {
                const angle = (360 / wheelSegments.length) * index;
                const nextAngle = (360 / wheelSegments.length) * (index + 1);

                const startAngleRad = (angle * Math.PI) / 180;
                const endAngleRad = (nextAngle * Math.PI) / 180;

                const outerRadius = 185;
                const x1 = 200 + outerRadius * Math.cos(startAngleRad);
                const y1 = 200 + outerRadius * Math.sin(startAngleRad);
                const x2 = 200 + outerRadius * Math.cos(endAngleRad);
                const y2 = 200 + outerRadius * Math.sin(endAngleRad);

                return (
                  <g key={index}>
                    <path
                      d={`M 200 200 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#08040a"
                      strokeWidth="2.5"
                    />
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
                      strokeWidth="0.8"
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] border-2 border-amber-200/90 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#120712] border border-amber-400/60 flex items-center justify-center shadow-inner">
                <span className="text-[9px] font-mono font-black text-amber-300 tracking-wider">
                  {isSpinning ? '...' : 'TURING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spin Result Display */}
        {wheelResult && (
          <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 mb-3 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[9px] font-mono uppercase text-amber-200/70 tracking-[0.2em] block mb-0.5">
              Wheel Settlement
            </span>
            <p className="text-lg font-display font-black text-white mb-0.5">
              {wheelResult.result}
            </p>
            <p
              className="text-xs font-mono font-bold"
              style={{
                color: (wheelResult.multiplier > 0 || currentChips <= 0) ? '#34d399' : '#fb7185',
              }}
            >
              {wheelResult.multiplier > 0
                ? `+${wheelResult.multiplier} Chips Credited`
                : currentChips <= 0
                ? '+30 Chips Credited'
                : 'No chips credited. Better luck on the main floor.'}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2.5">
          {!isSpinning && !wheelResult && (
            <button
              onClick={handleSpin}
              disabled={hasSpun}
              className="btn-marquee-gold py-2.5 px-7 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Spin Wheel
            </button>
          )}

          <button
            onClick={onBack}
            className="py-2.5 px-5 bg-[#180c19] hover:bg-[#241126] border border-amber-400/35 hover:border-amber-400/70 text-amber-200/90 font-mono text-xs font-bold uppercase tracking-[0.16em] rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0.5"
          >
            Back To Tables
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralWheel;
