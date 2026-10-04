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
    <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="bg-[#12151E] border border-[#232938] p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <span>AI Casino • Operator Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black mb-6 text-white uppercase tracking-tight">Puter Auth Setup</h1>
        
        <div className="mb-5 bg-[#181D2A] border border-[#283248] rounded-xl p-4">
          <p className="text-xs uppercase font-mono text-slate-400 mb-1">Station Authentication Status</p>
          {isSignedIn ? (
            <div className="text-xl font-mono font-black text-emerald-400">Authenticated ✓</div>
          ) : (
            <div className="text-xl font-mono font-black text-rose-400">Not Connected ✕</div>
          )}

          {isSignedIn && username && (
            <div className="mt-2 text-xs font-mono text-slate-300">
              Active Operator: <span className="text-white font-bold">@{username}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSignIn}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl text-slate-950 font-display font-black text-base uppercase tracking-wider shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
        >
          Sign in to Puter
        </button>

        <div className="mt-6 text-xs text-slate-400 text-left bg-[#0A0D15] border border-[#1E2536] p-3.5 rounded-xl font-mono">
          <h3 className="font-bold text-slate-200 mb-1.5 uppercase text-[11px] tracking-wider">Protocol Instructions:</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Authorize Puter once per PC station before the tournament.</li>
            <li>Session remains active throughout all game rounds.</li>
            <li><strong>Do not use Incognito/Private browsing</strong> mode.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
