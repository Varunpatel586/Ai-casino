import { useState, useEffect } from 'react';
import { ensurePuterAuth } from '../services/huggingFaceService';

export default function OperatorSetup() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const checkAuth = async () => {
    if (window.puter) {
      const signedIn = typeof window.puter.auth?.isSignedIn === 'function' 
        ? window.puter.auth.isSignedIn() 
        : window.puter.isSignedIn();
      
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        try {
          const user = typeof window.puter.auth?.getUser === 'function'
            ? await window.puter.auth.getUser()
            : await window.puter.getUser();
          setUsername(user?.username || 'Unknown');
        } catch (error) {
          console.error("Failed to fetch user", error);
        }
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      await ensurePuterAuth();
      await checkAuth();
    } catch (e) {
      console.error("Sign in error:", e);
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg text-white flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="casino-vip-card border border-amber-500/30 p-4 sm:p-6 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] w-full max-w-md text-center relative my-auto">
        <div className="card-neon-edge" />
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-lowest/90 border border-amber-500/40 text-amber-400 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <span className="text-amber-400">♦</span>
          <span>AI Casino • Operator Gateway</span>
          <span className="text-amber-400">♦</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-display font-black mb-3 text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider drop-shadow-[0_2px_12px_rgba(244,208,104,0.3)]">
          Puter Auth Setup
        </h1>
        
        <div className="mb-4 bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3 shadow-inner">
          <p className="text-[11px] uppercase font-mono text-amber-200/60 mb-0.5">Station Authentication Status</p>
          {isSignedIn ? (
            <div className="text-lg font-mono font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">Authenticated ✓</div>
          ) : (
            <div className="text-lg font-mono font-black text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">Not Connected ✕</div>
          )}

          {isSignedIn && username && (
            <div className="mt-1 text-xs font-mono text-slate-300">
              Active Operator: <span className="text-white font-bold">@{username}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSignIn}
          className="btn-marquee-gold w-full py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
        >
          Sign in to Puter
        </button>

        <div className="mt-4 text-xs text-amber-200/70 text-left bg-surface-lowest/95 border border-amber-500/20 p-3 rounded-xl font-mono shadow-inner">
          <h3 className="font-bold text-amber-300 mb-1 uppercase text-[10px] tracking-wider">Protocol Instructions:</h3>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            <li>Authorize Puter once per PC station before the tournament.</li>
            <li>Session remains active throughout all game rounds.</li>
            <li><strong>Do not use Incognito/Private browsing</strong> mode.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
