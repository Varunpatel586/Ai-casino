import { DollarSign } from 'lucide-react';
import { BetAmount } from '../types';

interface BettingPanelProps {
  currentChips: number;
  onBet: (amount: BetAmount) => void;
  disabled?: boolean;
}

export default function BettingPanel({ currentChips, onBet, disabled }: BettingPanelProps) {
  const bets: { amount: BetAmount; label: string; color: string }[] = [
    { amount: 10, label: '$10', color: 'from-green-500 to-green-600' },
    { amount: 30, label: '$30', color: 'from-blue-500 to-blue-600' },
    { amount: 'ALL_IN', label: 'ALL IN', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">Place Your Bet</h3>
      <p className="text-white/60 text-center mb-6">Choose wisely. Higher risk, higher reward.</p>

      <div className="grid grid-cols-3 gap-4">
        {bets.map((bet) => {
          const betValue = bet.amount === 'ALL_IN' ? currentChips : bet.amount;
          const canAfford = currentChips >= betValue;

          return (
            <button
              key={bet.label}
              onClick={() => onBet(bet.amount)}
              disabled={disabled || !canAfford}
              className={`relative group px-6 py-8 rounded-xl font-bold text-white bg-gradient-to-br ${bet.color}
                hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                disabled:hover:scale-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]`}
            >
              <div className="flex flex-col items-center gap-2">
                <DollarSign size={32} />
                <span className="text-2xl">{bet.label}</span>
                {bet.amount === 'ALL_IN' && (
                  <span className="text-xs opacity-80">${currentChips}</span>
                )}
              </div>
              {!canAfford && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl text-sm">
                  Not enough chips
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center text-white/50 text-sm">
        Current chips: <span className="text-yellow-400 font-bold">${currentChips}</span>
      </div>
    </div>
  );
}
