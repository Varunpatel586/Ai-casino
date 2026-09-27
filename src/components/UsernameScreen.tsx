import { useState } from 'react';
import { UserCheck, Shield, ChevronRight, Hash } from 'lucide-react';

interface UsernameScreenProps {
  onSubmit: (username: string, roomCode: string) => void;
  defaultRoom?: string;
}

export default function UsernameScreen({ onSubmit, defaultRoom }: UsernameScreenProps) {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(defaultRoom || 'TABLE_01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const cleanRoom = (roomCode.trim() || 'TABLE_01').toUpperCase().replace(/\s+/g, '-');
      onSubmit(username.trim(), cleanRoom);
    }
  };

  return (
    <div className="min-h-screen casino-table-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#12151E] border border-[#262D3D] rounded-2xl p-8 shadow-2xl relative">
        {/* Top Metallic Accent */}
        <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mx-auto mb-6" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserCheck size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Player Registration
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Issue your credentials and enter the shared multiplayer room.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="username-input" className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Contestant Moniker
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {username.length}/20 max
              </span>
            </div>
            <div className="relative">
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Maverick, Turing01"
                maxLength={20}
                className="w-full px-4 py-3 bg-[#181D2A] border border-[#2E374D] focus:border-amber-400 rounded-xl text-white placeholder-slate-500 font-mono text-base focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="room-input" className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <Hash size={13} className="text-amber-400" />
                <span>Room ID / Join Code</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Shared Room
              </span>
            </div>
            <div className="relative">
              <input
                id="room-input"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. TABLE_01"
                maxLength={20}
                className="w-full px-4 py-3 bg-[#181D2A] border border-[#2E374D] focus:border-amber-400 rounded-xl text-amber-400 font-mono font-bold tracking-wider uppercase text-base focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1.5">
              All 6 players enter the same Room ID created by the Host.
            </p>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer mt-2"
          >
            <span>CONTINUE TO RULES</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#232938] flex flex-col gap-2.5 text-center text-xs font-mono text-slate-400">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Shield size={13} className="text-emerald-400" />
            <span>Starting bankroll ($50) credited automatically</span>
          </div>

          <div className="pt-2 border-t border-[#1C2230]">
            <a 
              href="/host" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
            >
              👑 Are you the Host? Open Pit Boss Controller →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
