import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, MessageSquareCode, ShieldCheck } from 'lucide-react';
import HostRound1Controller from './HostRound1Controller';
import HostChatInterface from './HostChatInterface';

interface UnifiedHostViewProps {
  initialTab?: 'round1' | 'round3';
}

export default function UnifiedHostView({ initialTab = 'round1' }: UnifiedHostViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'round1' | 'round3'>(
    tabParam === 'round3' || tabParam === 'turing' || initialTab === 'round3' 
      ? 'round3' 
      : 'round1'
  );

  useEffect(() => {
    if (tabParam === 'round3' || tabParam === 'turing') {
      setActiveTab('round3');
    } else if (tabParam === 'round1') {
      setActiveTab('round1');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'round1' | 'round3') => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col text-slate-100 font-sans">
      {/* Global Host Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#10131B]/95 backdrop-blur-md border-b border-[#232938] px-4 py-2.5 sm:px-6">
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
                Multi-Event Controller Dashboard
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
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
              <span>Round 1 Table Control</span>
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
              <span>Round 3 Turing Host Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'round1' ? (
          <HostRound1Controller />
        ) : (
          <HostChatInterface />
        )}
      </main>
    </div>
  );
}
