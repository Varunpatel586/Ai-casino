import { useState, useEffect } from 'react';
import { UserCheck, Shield, ChevronRight, Hash, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';

interface UsernameScreenProps {
  onSubmit: (username: string, roomCode: string) => void;
  defaultRoom?: string;
}

export default function UsernameScreen({ onSubmit, defaultRoom }: UsernameScreenProps) {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState(defaultRoom || 'TABLE_01');
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const [puterUsername, setPuterUsername] = useState<string | null>(null);
  const [isPuterLoading, setIsPuterLoading] = useState(false);

  // Check existing Puter authentication session on mount
  useEffect(() => {
    const checkPuter = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).puter) {
          const puter = (window as any).puter;
          const signedIn = typeof puter.auth?.isSignedIn === 'function'
            ? puter.auth.isSignedIn()
            : (typeof puter.isSignedIn === 'function' ? puter.isSignedIn() : false);
          
          setIsPuterSignedIn(signedIn);

          if (signedIn) {
            const user = typeof puter.auth?.getUser === 'function'
              ? await puter.auth.getUser()
              : (typeof puter.getUser === 'function' ? await puter.getUser() : null);
            if (user?.username) {
              setPuterUsername(user.username);
              // Pre-fill contestant moniker if empty
              setUsername(prev => prev || user.username);
            }
          }
        }
      } catch (err) {
        console.warn('Puter session check error:', err);
      }
    };

    checkPuter();
  }, []);

  const handlePuterSignIn = async () => {
    setIsPuterLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).puter) {
        const puter = (window as any).puter;
        if (typeof puter.auth?.signIn === 'function') {
          await puter.auth.signIn();
        } else if (typeof puter.signIn === 'function') {
          await puter.signIn();
        }

        const signedIn = typeof puter.auth?.isSignedIn === 'function'
          ? puter.auth.isSignedIn()
          : (typeof puter.isSignedIn === 'function' ? puter.isSignedIn() : false);

        setIsPuterSignedIn(signedIn);

        if (signedIn) {
          const user = typeof puter.auth?.getUser === 'function'
            ? await puter.auth.getUser()
            : (typeof puter.getUser === 'function' ? await puter.getUser() : null);
          if (user?.username) {
            setPuterUsername(user.username);
            setUsername(prev => prev || user.username);
          }
        }
      } else {
        window.open('https://puter.com', '_blank');
      }
    } catch (e) {
      console.warn('Puter sign in error:', e);
    } finally {
      setIsPuterLoading(false);
    }
  };

  const handlePuterSignOut = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).puter?.auth?.signOut) {
        await (window as any).puter.auth.signOut();
      }
      setIsPuterSignedIn(false);
      setPuterUsername(null);
    } catch (e) {
      console.warn('Puter sign out error:', e);
    }
  };

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

          {/* Puter AI Image Generation Credits Card */}
          <div className="bg-[#10141F] border border-[#232B3D] rounded-xl p-3.5 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Zap size={14} className={isPuterSignedIn ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  AI Image Credits (Round 2)
                </span>
              </div>
              {isPuterSignedIn ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  <span>CREDITS READY</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  FREE SIGN-IN
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-mono mb-2.5 leading-relaxed">
              {isPuterSignedIn
                ? `Connected to @${puterUsername}. Your personal Puter free quota will be used for Round 2 image synthesis.`
                : 'Sign in to Puter once so your individual free credits power Round 2 prompt duels.'}
            </p>

            {isPuterSignedIn ? (
              <div className="flex items-center justify-between pt-1 border-t border-[#1C2333]">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Signed In: @{puterUsername}
                </span>
                <button
                  type="button"
                  onClick={handlePuterSignOut}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Change Account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePuterSignIn}
                disabled={isPuterLoading}
                className="w-full py-2.5 px-3 bg-[#181F2E] hover:bg-[#20293D] border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <Zap size={13} className="text-amber-400" />
                <span>{isPuterLoading ? 'Opening Puter Auth...' : 'Connect Puter (1-Click Free Sign-Up)'}</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>
            )}
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
        </div>
      </div>
    </div>
  );
}
