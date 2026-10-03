import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  MessageSquareCode, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Laptop
} from 'lucide-react';
import HostRound1Controller from './HostRound1Controller';
import HostChatInterface from './HostChatInterface';

interface UnifiedHostViewProps {
  initialTab?: 'round1' | 'round3' | 'puter';
}

export default function UnifiedHostView({ initialTab = 'round1' }: UnifiedHostViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'round1' | 'round3' | 'puter'>(
    tabParam === 'round3' || tabParam === 'turing'
      ? 'round3'
      : tabParam === 'puter' || tabParam === 'setup'
      ? 'puter'
      : initialTab
  );

  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const [puterUsername, setPuterUsername] = useState<string | null>(null);
  const [isPuterLoading, setIsPuterLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // 6 Station Readiness Checklist for Puter
  const [stationChecks, setStationChecks] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const checkPuterAuth = async () => {
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
          }
        }
      }
    } catch (err) {
      console.warn('Puter session check error:', err);
    }
  };

  useEffect(() => {
    checkPuterAuth();
  }, []);

  useEffect(() => {
    if (tabParam === 'round3' || tabParam === 'turing') {
      setActiveTab('round3');
    } else if (tabParam === 'round1') {
      setActiveTab('round1');
    } else if (tabParam === 'puter' || tabParam === 'setup') {
      setActiveTab('puter');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'round1' | 'round3' | 'puter') => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

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
        await checkPuterAuth();
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

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(label);
      setTimeout(() => setCopiedLink(null), 2500);
    }
  };

  const toggleStation = (stationNum: number) => {
    setStationChecks(prev => ({ ...prev, [stationNum]: !prev[stationNum] }));
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
  const playerLobbyUrl = `${originUrl}/`;
  const operatorSetupUrl = `${originUrl}/operator-setup`;

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex flex-col text-slate-100 font-sans overflow-hidden">
      {/* Global Host Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#10131B]/95 backdrop-blur-md border-b border-[#232938] px-4 py-2 sm:px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                Casino Host Operations
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                Pit Boss Multi-Event Controller
              </span>
            </div>
          </div>

          {/* Tab Switcher & Host Puter Status */}
          <div className="flex items-center gap-3">
            {/* Quick Host Puter Pill */}
            {isPuterSignedIn ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <CheckCircle2 size={13} />
                <span>Puter: @{puterUsername}</span>
              </div>
            ) : (
              <button
                onClick={() => handleTabChange('puter')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold transition-all cursor-pointer"
                title="Connect Puter account for free image generation credits"
              >
                <Zap size={13} />
                <span>Puter Setup</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 p-1 bg-[#181D2A] border border-[#283248] rounded-xl text-xs font-mono">
              <button
                onClick={() => handleTabChange('round1')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'round1'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={14} />
                <span>Round 1 Table</span>
              </button>

              <button
                onClick={() => handleTabChange('round3')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'round3'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquareCode size={14} />
                <span>Round 3 Turing</span>
              </button>

              <button
                onClick={() => handleTabChange('puter')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'puter'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap size={14} className={isPuterSignedIn ? 'text-emerald-400' : 'text-amber-400'} />
                <span>Puter &amp; Players</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {activeTab === 'round1' ? (
          <HostRound1Controller />
        ) : activeTab === 'round3' ? (
          <HostChatInterface />
        ) : (
          /* DEDICATED PUTER & PLAYER AUTH MANAGEMENT VIEW */
          <div className="max-w-5xl mx-auto w-full h-full py-6 px-4 sm:px-6 overflow-y-auto">
            {/* Header Banner */}
            <div className="bg-[#121622] border border-[#232B3E] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                    <Zap size={13} />
                    <span>Cost Optimization Protocol</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                    Puter Authentication &amp; Player Credits
                  </h1>
                  <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                    By signing up each contestant to Puter on their computer, Round 2 AI image generation (<span className="text-amber-400 font-bold">FLUX 1.1 Pro</span>) uses their individual free daily quota, completely preserving your backend server credits and API quotas!
                  </p>
                </div>

                {/* Host Station Auth Card */}
                <div className="bg-[#171D2D] border border-[#2A344A] rounded-xl p-5 min-w-[280px] shadow-md">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Host Station Puter Status
                  </span>
                  {isPuterSignedIn ? (
                    <div>
                      <div className="text-lg font-mono font-black text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>@{puterUsername}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block mt-1">
                        Active Free Session
                      </span>
                      <button
                        onClick={handlePuterSignOut}
                        className="mt-3 text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Sign Out / Switch Account
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1.5 mb-3">
                        <AlertCircle size={16} />
                        <span>Not Connected on Host PC</span>
                      </div>
                      <button
                        onClick={handlePuterSignIn}
                        disabled={isPuterLoading}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Zap size={14} />
                        <span>{isPuterLoading ? 'Opening...' : 'Connect Puter Account'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Share Links for Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Card 1: Player Registration Lobby Link */}
              <div className="bg-[#121622] border border-[#232B3E] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <Users size={14} />
                      <span>1. Main Contestant Lobby</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1A2030] text-slate-400">
                      Standard
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Contestant Start &amp; Sign-In</h3>
                  <p className="text-xs font-mono text-slate-400 mb-4 leading-relaxed">
                    Contestants opening this link can enter their moniker and click the built-in <strong>"Connect Puter"</strong> 1-click button before taking their seat.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 bg-[#0C0E14] border border-[#232B3E] rounded-xl p-2 font-mono text-xs text-slate-300 select-all mb-3 overflow-x-auto">
                    <span className="truncate flex-1">{playerLobbyUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(playerLobbyUrl, 'lobby')}
                      className="flex-1 py-2 px-3 bg-[#1A2234] hover:bg-[#232D44] border border-[#2E3B56] text-amber-400 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedLink === 'lobby' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedLink === 'lobby' ? 'Copied Link!' : 'Copy Lobby Link'}</span>
                    </button>
                    <a
                      href={playerLobbyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#1A2234] hover:bg-[#232D44] border border-[#2E3B56] text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>Open</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Standalone Puter Setup Page Link */}
              <div className="bg-[#121622] border border-[#232B3E] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-pink-400 font-bold flex items-center gap-1.5">
                      <Laptop size={14} />
                      <span>2. Dedicated Station Setup</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1A2030] text-slate-400">
                      Operator Page
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Direct Puter Auth Station</h3>
                  <p className="text-xs font-mono text-slate-400 mb-4 leading-relaxed">
                    Open this URL on all contestant PCs prior to the event to verify authentication and lock in their browser session.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 bg-[#0C0E14] border border-[#232B3E] rounded-xl p-2 font-mono text-xs text-slate-300 select-all mb-3 overflow-x-auto">
                    <span className="truncate flex-1">{operatorSetupUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(operatorSetupUrl, 'setup')}
                      className="flex-1 py-2 px-3 bg-[#1A2234] hover:bg-[#232D44] border border-[#2E3B56] text-pink-400 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedLink === 'setup' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedLink === 'setup' ? 'Copied Link!' : 'Copy Setup Link'}</span>
                    </button>
                    <a
                      href={operatorSetupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#1A2234] hover:bg-[#232D44] border border-[#2E3B56] text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>Open</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 6-Player Station Pre-Flight Checklist */}
            <div className="bg-[#121622] border border-[#232B3E] rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">6-Player Station Pre-Flight Readiness</h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Click each seat pod once the contestant PC has logged into Puter:
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#181F2E] border border-[#29354D] text-amber-400 font-bold">
                  {Object.values(stationChecks).filter(Boolean).length} / 6 Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isChecked = stationChecks[num];
                  return (
                    <button
                      key={num}
                      onClick={() => toggleStation(num)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                          : 'bg-[#181D2A] border-[#283248] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold uppercase">Seat {num}</span>
                        {isChecked ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                      <span className={`text-[11px] font-mono block ${isChecked ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                        {isChecked ? 'Puter Active ✓' : 'Unchecked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operator Protocol Notice */}
            <div className="bg-[#0D1017] border border-[#1E2536] rounded-xl p-4 flex items-start gap-3 text-xs font-mono text-slate-400">
              <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Security &amp; Persistence Protocol:</strong>
                Puter sessions persist in the browser automatically across all tabs and reloads. <strong>Do not use Incognito/Private browsing mode</strong> on player stations, or their session will reset upon closing the window.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

