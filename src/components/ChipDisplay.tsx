import { DollarSign } from 'lucide-react';

interface ChipDisplayProps {
  chips: number;
  username: string;
}

export default function ChipDisplay({ chips, username }: ChipDisplayProps) {
  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
        <div className="text-white/60 text-sm mb-1">Player</div>
        <div className="text-white font-bold text-xl">{username}</div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 backdrop-blur-md border-2 border-yellow-400 rounded-2xl px-6 py-3 shadow-xl flex items-center gap-3">
        <DollarSign className="text-yellow-900" size={28} />
        <div>
          <div className="text-yellow-900 text-xs font-medium">CHIPS</div>
          <div className="text-yellow-900 font-black text-2xl">{chips}</div>
        </div>
      </div>
    </div>
  );
}
