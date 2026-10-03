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
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      <div className="max-w-md w-full bg-[#12151E] border border-[#262D3D] rounded-2xl p-4 sm:p-6 shadow-2xl relative my-auto">
        {/* Top Metallic Accent */}
        <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mx-auto mb-3" />

        <div className="text-center mb-4 sm:mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
            <UserCheck size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
            Player Registration
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Issue your credentials and enter the shared multiplayer room.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="username-input" className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                Contestant Moniker
              </label>
              <span className="text-[10px] font-mono text-slate-500">
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
                className="w-full px-3.5 py-2 sm:py-2.5 bg-[#181D2A] border border-[#2E374D] focus:border-amber-400 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="room-input" className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <Hash size={12} className="text-amber-400" />
                <span>Room ID / Join Code</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
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
                className="w-full px-3.5 py-2 sm:py-2.5 bg-[#181D2A] border border-[#2E374D] focus:border-amber-400 rounded-xl text-amber-400 font-mono font-bold tracking-wider uppercase text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              All 6 players enter the same Room ID created by the Host.
            </p>
          </div>

          {/* Puter AI Image Generation Credits Card */}
          <div className="bg-[#10141F] border border-[#232B3D] rounded-xl p-2.5 sm:p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Zap size={13} className={isPuterSignedIn ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                  AI Image Credits (Round 2)
                </span>
              </div>
              {isPuterSignedIn ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 size={9} />
                  <span>READY</span>
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  FREE SIGN-IN
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-mono mb-2 leading-relaxed">
              {isPuterSignedIn
                ? `Connected to @${puterUsername}. Free quota active for Round 2 image synthesis.`
                : 'Sign in to Puter once so your individual free credits power Round 2 prompt duels.'}
            </p>

            {isPuterSignedIn ? (
              <div className="flex items-center justify-between pt-1 border-t border-[#1C2333]">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Signed In: @{puterUsername}
                </span>
                <button
                  type="button"
                  onClick={handlePuterSignOut}
                  className="text-[9px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Change Account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePuterSignIn}
                disabled={isPuterLoading}
                className="w-full py-1.5 px-2.5 bg-[#181F2E] hover:bg-[#20293D] border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <Zap size={12} className="text-amber-400" />
                <span>{isPuterLoading ? 'Opening Puter Auth...' : 'Connect Puter (1-Click Free Sign-Up)'}</span>
                <ExternalLink size={11} className="opacity-70" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer mt-1"
          >
            <span>CONTINUE TO RULES</span>
            <ChevronRight size={16} />
          </button>
        </form>

        <div className="mt-3 pt-2.5 border-t border-[#232938] flex flex-col gap-1.5 text-center text-[10px] font-mono text-slate-400">
          <div className="flex items-center justify-center gap-1.5 text-slate-500">
            <Shield size={12} className="text-emerald-400" />
            <span>Starting bankroll ($50) credited automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}
