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
        const win = window as unknown as { puter?: { auth?: { isSignedIn?: () => boolean; getUser?: () => Promise<{ username?: string }> }; isSignedIn?: () => boolean; getUser?: () => Promise<{ username?: string }> } };
        if (typeof window !== 'undefined' && win.puter) {
          const puter = win.puter;
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
              setUsername(prev => prev || user.username || '');
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
      const win = window as unknown as { puter?: { auth?: { signIn?: () => Promise<void>; isSignedIn?: () => boolean; getUser?: () => Promise<{ username?: string }> }; signIn?: () => Promise<void>; isSignedIn?: () => boolean; getUser?: () => Promise<{ username?: string }> } };
      if (typeof window !== 'undefined' && win.puter) {
        const puter = win.puter;
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
            setUsername(prev => prev || user.username || '');
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
      const win = window as unknown as { puter?: { auth?: { signOut?: () => Promise<void> } } };
      if (typeof window !== 'undefined' && win.puter?.auth?.signOut) {
        await win.puter.auth.signOut();
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
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="max-w-md w-full max-h-full casino-vip-card rounded-2xl p-4 sm:p-5 shadow-2xl relative my-auto overflow-hidden">
        <div className="card-neon-edge" />
        
        {/* Top Metallic Accent */}
        <div className="w-16 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 rounded-full mx-auto mb-2 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />

        <div className="text-center mb-2.5 sm:mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-1.5 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
            <UserCheck size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight white-metallic-text">
            Player Registration
          </h2>
          <p className="text-amber-200/70 text-[11px] font-mono tracking-wider mt-0.5">
            Issue credentials to enter the multiplayer arena.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label htmlFor="username-input" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200/80 font-bold">
                Contestant Moniker
              </label>
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">
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
                className="w-full px-3 py-2 bg-[#180d19]/90 border border-amber-400/35 focus:border-amber-400 rounded-xl text-white placeholder-zinc-500 font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/60 shadow-inner transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label htmlFor="room-input" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200/80 font-bold flex items-center gap-1.5">
                <Hash size={11} className="text-amber-400" />
                <span>Room ID / Join Code</span>
              </label>
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">
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
                className="w-full px-3 py-2 bg-[#180d19]/90 border border-amber-400/35 focus:border-amber-400 rounded-xl text-amber-400 font-mono font-bold tracking-wider uppercase text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/60 shadow-inner transition-all"
              />
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-zinc-400 mt-0.5">
              All 6 players enter the same Room ID created by the Host.
            </p>
          </div>

          {/* Puter AI Image Generation Credits Card */}
          <div className="bg-gradient-to-br from-[#1c0c1b]/80 to-[#100510]/90 border border-amber-400/30 rounded-xl p-2.5 text-left">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className={isPuterSignedIn ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                  AI Image Credits (Round 2)
                </span>
              </div>
              {isPuterSignedIn ? (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.35)]">
                  <CheckCircle2 size={9} />
                  <span>READY</span>
                </span>
              ) : (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.35)]">
                  FREE SIGN-IN
                </span>
              )}
            </div>

            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono mb-1.5 leading-snug">
              {isPuterSignedIn
                ? `Connected to @${puterUsername}. Free quota active for Round 2 image synthesis.`
                : 'Sign in to Puter once so your individual free credits power Round 2 prompt duels.'}
            </p>

            {isPuterSignedIn ? (
              <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Signed In: @{puterUsername}
                </span>
                <button
                  type="button"
                  onClick={handlePuterSignOut}
                  className="text-[9px] font-mono text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Change Account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePuterSignIn}
                disabled={isPuterLoading}
                className="w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 hover:border-amber-400 text-amber-300 rounded-lg font-mono text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <Zap size={11} className="text-amber-400" />
                <span>{isPuterLoading ? 'Opening Puter Auth...' : 'Connect Puter (1-Click Free Sign-Up)'}</span>
                <ExternalLink size={10} className="opacity-70" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="btn-marquee-gold w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] rounded-xl cursor-pointer select-none group border border-amber-200/50 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            <span>CONTINUE TO RULES</span>
            <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-2.5 pt-2 border-t border-amber-400/20 flex flex-col gap-1 text-center text-[9px] sm:text-[10px] font-mono text-zinc-400">
          <div className="flex items-center justify-center gap-1.5">
            <Shield size={11} className="text-emerald-400" />
            <span>Starting bankroll ($50) credited automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}
