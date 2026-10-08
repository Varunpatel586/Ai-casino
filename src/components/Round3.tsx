import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';
import ChatInterface from './chat/ChatInterface';
import { network_manager } from '../services/network';
import { reset_conversation } from '../services/gemini_chat';
import { getWsUrl } from '../services/apiConfig';
import { signOutPuter } from '../services/huggingFaceService';


interface Round3Props {
  currentChips: number;
  onComplete: (score: number, bet: number) => void;
  username: string;
  onBackToBonus?: () => void;
  onChipUpdate?: (chips: number) => void;
}

type ChatMode = 'ai' | 'human' | null;
type Phase = 'intro' | 'betting' | 'mode-select' | 'playing' | 'results';

const TOTAL_SUBROUNDS = 3;
const MESSAGES_PER_SUBROUND = 3;

export default function Round3({ currentChips, onComplete, username, onBackToBonus, onChipUpdate: _onChipUpdate }: Round3Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [actualMode, setActualMode] = useState<ChatMode>(null); // The actual randomly selected mode
  const [roundScore, setRoundScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0); // subround index
  const [messagesSent, setMessagesSent] = useState(0);
  const [showGuess, setShowGuess] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [isConnected, setIsConnected] = useState(false);



  // Handle bet placement
  const handleBet = useCallback((amount: BetAmount) => {
    const bet = amount === 'ALL_IN' ? currentChips : amount;
    setCurrentBet(bet);
    setPhase('mode-select');
  }, [currentChips]);

  // Handle connection status changes
  useEffect(() => {
    const handleConnectionChange = (connected: boolean, message: string) => {
      console.log('Connection status:', connected, message);
      setIsConnected(connected);
      setConnectionError(connected ? '' : message);

      if (connected && actualMode === 'human') {
        setPhase('playing');
      } else if (!connected && actualMode === 'human') {
        // Connection failed, fall back to AI mode
        console.log('Connection failed, falling back to AI mode');
        setActualMode('ai');
        reset_conversation();
        setPhase('playing');
        setConnectionError('');
      }
    };

    network_manager.connection_callback = handleConnectionChange;

    return () => {
      network_manager.connection_callback = null;
    };
  }, [actualMode]);

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = (message: unknown) => {
      console.log('Received message:', message);
    };

    network_manager.message_callback = handleMessage;
    
    return () => {
      network_manager.message_callback = null;
    };
  }, []);

  // If Human is selected
  const selectHumanChat = useCallback(async () => {
    setActualMode('human');
    setConnectionError('');

    try {
      if (!network_manager.is_connected()) {
        // Automatically connect to the WebSocket server
        const hostAddress = getWsUrl();
        console.log(`Connecting to ${hostAddress}...`);
        network_manager.set_username?.(username || '');
        await network_manager.connect_to_host(hostAddress);

        console.log('✅ Successfully connected to WebSocket server');
      }
    } catch (error: unknown) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(`Failed to connect to server: ${errorMessage}. Make sure the backend server is running with "npm run server".`);

      // Fall back to AI mode (this will be handled by the connection callback)
      console.log('🔄 Human connection failed, connection callback will handle fallback to AI mode');
    }
  }, [username]);

  // Randomly select AI or Human mode and set up connection
  const selectRandomMode = useCallback(async () => {
    // Randomly choose between AI and Human (70% AI, 30% Human chance)
    const randomMode: ChatMode = Math.random() < 0.7 ? 'ai' : 'human';
    setActualMode(randomMode);
    setConnectionError('');
    console.log('Selected mode (hidden from player):', randomMode);

    if (randomMode === 'human') {
      try {
        await selectHumanChat();
      } catch (error: unknown) {
        console.error('Connection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setConnectionError(`Failed to connect to host: ${errorMessage}`);
        // If connection fails, fall back to AI mode
        console.log('Falling back to AI mode due to connection failure');
        setActualMode('ai');
        reset_conversation();
        setPhase('playing');
      }
    } else {
      // AI mode - start immediately
      reset_conversation();
      setPhase('playing');
    }
  }, [selectHumanChat]);

  // Handle player's guess (AI or Human)
  const handleAnswer = useCallback(async (playerGuess: 'ai' | 'human') => {
    if (!actualMode) return;
    
    // Calculate score for this round
    const isCorrect = playerGuess === actualMode;
    const score = isCorrect ? 1 : 0;
    setRoundScore(prev => prev + score);

    try {
      // Disconnect if in human mode
      if (actualMode === 'human') {
        network_manager.disconnect();
      }
      
      if (currentRound < TOTAL_SUBROUNDS - 1) {
        // Next round
        setCurrentRound(prev => prev + 1);
        reset_conversation();
        setPhase('mode-select');
        setActualMode(null);
        setIsConnected(false);
      } else {
        // All rounds completed
        setPhase('results');
        signOutPuter();
      }
    } catch (error) {
      console.error('Error during round completion:', error);
      setConnectionError('Failed to complete round. Please refresh the page.');
    }
  }, [currentRound, actualMode]);

  // Handle time up (auto-submit wrong guess)
  const handleTimeUp = useCallback(() => {
    if (actualMode) {
      // If time runs out, count it as a wrong guess
      handleAnswer(actualMode === 'ai' ? 'human' : 'ai');
    }
  }, [actualMode, handleAnswer]);

  // Finish the round
  const handleFinishRound = useCallback(() => {
    network_manager.disconnect();
    signOutPuter();
    onComplete(roundScore, currentBet);
  }, [onComplete, roundScore, currentBet]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      network_manager.disconnect();
      network_manager.connection_callback = null;
      network_manager.message_callback = null;
    };
  }, []);

  // Auto-select random mode when entering mode-select phase
  useEffect(() => {
    if (phase === 'mode-select' && !actualMode) {
      const timer = setTimeout(() => {
        selectRandomMode();
      }, 1500); // Short delay for suspense

      return () => clearTimeout(timer);
    }
  }, [phase, actualMode, selectRandomMode]);

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-xl w-full casino-vip-card rounded-2xl p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center relative border border-amber-500/30 my-auto">
          <div className="card-neon-edge" />

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-lowest/90 border border-amber-500/40 text-amber-400 text-[11px] font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <span className="text-amber-400">♦</span>
            <MessageCircle size={13} />
            <span>Event III • The Ultimate Turing Test</span>
            <span className="text-amber-400">♦</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] tracking-wider uppercase mb-2 drop-shadow-[0_2px_12px_rgba(244,208,104,0.3)]">
            The Turing Table
          </h1>

          <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed mb-4 max-w-lg mx-auto font-sans">
            You will enter a blind, private terminal with an unknown counterpart. It is either an autonomous AI model or a real human operator. You have 3 messages to interrogate them and deduce their true nature.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5 text-left">
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-2.5 sm:p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Subrounds</span>
              <span className="text-lg sm:text-xl font-mono font-black text-white">{TOTAL_SUBROUNDS} Total</span>
            </div>
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-2.5 sm:p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Time Limit</span>
              <span className="text-lg sm:text-xl font-mono font-black text-amber-400">2 Min / Rd</span>
            </div>
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-2.5 sm:p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Message Cap</span>
              <span className="text-lg sm:text-xl font-mono font-black text-blue-400">{MESSAGES_PER_SUBROUND} msgs</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setPhase('betting')}
              className="btn-marquee-gold inline-flex items-center justify-center gap-2 px-8 py-3 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span>PLACE WAGER &amp; START</span>
            </button>
            {onBackToBonus && (
              <button
                type="button"
                onClick={onBackToBonus}
                className="py-3 px-6 bg-[#180c19] hover:bg-[#231225] border border-amber-400/35 hover:border-amber-400/70 text-amber-200/90 font-mono text-xs font-bold uppercase tracking-[0.16em] rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                ⬅ Back To Bonus Tables
              </button>
            )}
          </div>

          {/* Development skip button for testing transitions */}
          <div className="mt-2.5">
            <button
              onClick={() => {
                handleFinishRound();
              }}
              className="text-[11px] font-mono text-slate-500 hover:text-amber-400/70 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Skip Round (Dev Test)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Betting Screen
  if (phase === 'betting') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-2xl w-full my-auto flex flex-col gap-2.5">
          {onBackToBonus && (
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={onBackToBonus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#180c19] hover:bg-[#241126] border border-amber-400/35 text-amber-300 font-mono text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <span>⬅ Back To Bonus Tables</span>
              </button>
              <span className="text-[11px] font-mono text-amber-200/60">Intermission Side Action Available</span>
            </div>
          )}
          <BettingPanel 
            currentChips={currentChips} 
            onBet={handleBet}
            minBet={10}
            maxBet={Math.max(10, Math.min(100, currentChips))}
            onBackToBonus={onBackToBonus}
          />
        </div>
      </div>
    );
  }

  // Mode Selection Screen (random selection in progress)
  if (phase === 'mode-select') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-md w-full casino-vip-card rounded-2xl p-5 sm:p-6 text-center border border-amber-500/30 relative shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto">
          <div className="card-neon-edge" />
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <MessageCircle className="text-amber-400 animate-pulse" size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-2">
            Establishing Secure Line
          </h2>
          <p className="text-amber-200/60 text-xs font-mono mb-4">
            Subround {currentRound + 1} of {TOTAL_SUBROUNDS} • Pairing with blind counterpart...
          </p>
          <div className="w-full bg-surface-lowest rounded-full h-2 overflow-hidden border border-amber-500/20 p-0.5">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-2/3 animate-pulse rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          </div>
          {connectionError && (
            <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-mono">
              {connectionError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Human Chat Connection Screen (when connecting to host)
  if (phase === 'playing' && actualMode === 'human' && !isConnected) {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-md w-full casino-vip-card rounded-2xl p-5 sm:p-6 text-center border border-amber-500/30 relative shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto">
          <div className="card-neon-edge" />
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-2">
            Pairing With Remote Host
          </h2>
          <p className="text-amber-200/60 text-xs font-mono mb-2">
            Synchronizing encrypted WebSocket channel...
          </p>
          {connectionError && (
            <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-mono">
              {connectionError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle guess after 3 messages
  const handleSubroundGuess = (playerGuess: 'ai' | 'human') => {
    setShowGuess(false);
    setMessagesSent(0);
    // Calculate score for this subround
    const isCorrect = playerGuess === actualMode;
    setRoundScore(prev => prev + (isCorrect ? 1 : 0));
    // Disconnect if in human mode
    if (actualMode === 'human') {
      network_manager.disconnect();
    }
    // Next subround or finish
    if (currentRound < TOTAL_SUBROUNDS - 1) {
      setCurrentRound(prev => prev + 1);
      reset_conversation();
      setPhase('mode-select');
      setActualMode(null);
      setIsConnected(false);
    } else {
      setPhase('results');
    }
  };

  // Chat Interface Screen - with 3-message limit and verdict modal
  if (phase === 'playing' && actualMode) {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex flex-col overflow-hidden">
        {/* Subround HUD Banner */}
        <div className="bg-surface-lowest/95 border-b border-amber-500/25 px-3 sm:px-6 py-1.5 sm:py-2 flex-shrink-0 backdrop-blur-md">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to abandon this interrogation? Your progress will be lost.')) {
                    network_manager.disconnect();
                    setPhase('mode-select');
                    setActualMode(null);
                  }
                }}
                className="text-amber-200/60 hover:text-amber-200 transition-colors p-1 rounded-lg hover:bg-surface-lowest border border-transparent hover:border-amber-500/30"
                title="Abandon Subround"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Interrogation Session
                </span>
                <h3 className="text-xs sm:text-sm font-display font-black text-white">
                  Subround {currentRound + 1} of {TOTAL_SUBROUNDS}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 rounded-lg bg-surface-lowest border border-amber-500/30 text-xs font-mono text-slate-300 shadow-inner">
                Messages: <span className="text-amber-400 font-bold">{MESSAGES_PER_SUBROUND - messagesSent}</span> left
              </div>
            </div>
          </div>
        </div>

        {/* Chat Component Container */}
        <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto p-2 sm:p-4 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 casino-vip-card rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col relative">
            <div className="card-neon-edge" />
            <ChatInterface 
              key={`subround-${currentRound}`}
              mode={actualMode}
              onComplete={() => {}} // disable auto-complete
              timeLimit={120}
              onTimeUp={handleTimeUp}
              isConnected={actualMode === 'ai' ? true : isConnected}
              messageLimit={MESSAGES_PER_SUBROUND}
              messagesSent={messagesSent}
              onSendMessage={() => {
                setMessagesSent(prev => prev + 1);
              }}
              onReadyForVerdict={() => {
                setShowGuess(true);
              }}
              disableInput={messagesSent >= MESSAGES_PER_SUBROUND}
            />
          </div>

          {/* High-Stakes Verdict Modal */}
          {showGuess && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-50 p-3 sm:p-4 overflow-hidden">
              <div className="casino-vip-card border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 max-w-md w-full text-center shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative my-auto">
                <div className="card-neon-edge" />
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-lowest/90 border border-amber-500/40 text-amber-400 text-[11px] font-mono font-bold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <span className="text-amber-400">♦</span>
                  <span>Interrogation Concluded</span>
                  <span className="text-amber-400">♦</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-1.5">
                  Identify Your Counterpart
                </h2>
                <p className="text-amber-200/70 text-xs font-mono mb-4">
                  3 messages complete. Deliver your final classification to settle this subround.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-gradient-to-b from-[#131c2e] to-[#0a101b] hover:from-[#1b2a47] hover:to-[#10192b] border-2 border-blue-400/50 hover:border-blue-400 rounded-xl text-white shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer group"
                    onClick={() => handleSubroundGuess('ai')}
                  >
                    <span className="text-lg sm:text-xl font-black font-display text-blue-400 mb-0.5 group-hover:scale-105 transition-transform">ARTIFICIAL</span>
                    <span className="text-[10px] font-mono uppercase text-slate-300 tracking-wider">AI Model</span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-gradient-to-b from-[#2a1c0d] to-[#170e05] hover:from-[#3d2914] hover:to-[#221508] border-2 border-amber-400/50 hover:border-amber-400 rounded-xl text-white shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer group"
                    onClick={() => handleSubroundGuess('human')}
                  >
                    <span className="text-lg sm:text-xl font-black font-display text-amber-400 mb-0.5 group-hover:scale-105 transition-transform">HUMAN</span>
                    <span className="text-[10px] font-mono uppercase text-amber-200 tracking-wider">Live Host</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results Screen
  if (phase === 'results') {
    const scorePercentage = Math.round((roundScore / TOTAL_SUBROUNDS) * 100);
    const winnings = Math.max(0, Math.floor(currentBet * (scorePercentage / 50)));

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-xl w-full casino-vip-card rounded-2xl p-4 sm:p-6 text-center relative border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto">
          <div className="card-neon-edge" />
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <MessageCircle size={24} />
          </div>

          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400/70 mb-1">
            Round 3 Complete
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-4">
            Turing Trial Settled
          </h2>

          <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3.5 sm:p-4 mb-4 shadow-inner">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-surface-lowest rounded-lg p-2.5 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="text-xl font-mono font-black text-emerald-400">{roundScore}</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Correct Guesses</span>
              </div>
              <div className="bg-surface-lowest rounded-lg p-2.5 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                <span className="text-xl font-mono font-black text-rose-400">{TOTAL_SUBROUNDS - roundScore}</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Incorrect Guesses</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-amber-500/15 text-xs font-mono">
              <span className="text-amber-200/60">Round Wager:</span>
              <span className="text-white font-bold text-sm">${currentBet}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 text-xs font-mono">
              <span className="text-amber-200/60">Total Turing Accuracy:</span>
              <span className="text-amber-400 font-bold text-sm">{scorePercentage}%</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-amber-500/15 text-xs font-mono">
              <span className="text-amber-200/60">Settlement Payout:</span>
              <span className="text-emerald-400 font-bold text-sm">+{winnings} Chips</span>
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="btn-marquee-gold w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>COLLECT WINNINGS &amp; ENTER VAULT</span>
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex-1 min-h-0 bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl text-white mb-4">Something went wrong</h2>
        <button
          onClick={() => {
            setPhase('intro');
            setActualMode(null);
            network_manager.disconnect();
          }}
          className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
}