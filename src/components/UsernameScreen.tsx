import { useState } from 'react';
import { User } from 'lucide-react';

interface UsernameScreenProps {
  onSubmit: (username: string) => void;
}

export default function UsernameScreen({ onSubmit }: UsernameScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-cyan-500/20 rounded-full mb-4">
            <User className="text-cyan-400" size={48} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Welcome, Player</h1>
          <p className="text-white/60 text-lg">Enter your name to begin the challenge</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              className="w-full px-6 py-4 text-xl bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          >
            START GAME
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Your username will appear on the leaderboard
        </p>
      </div>
    </div>
  );
}
