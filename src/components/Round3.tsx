import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';
import ChatInterface from './chat/ChatInterface';
import { network_manager } from '../services/network';
import { reset_conversation } from '../services/gemini_chat';
import { getWsUrl } from '../services/apiConfig';


interface Round3Props {
  currentChips: number;
  onComplete: (score: number, bet: number) => void;
  username: string;
}

type ChatMode = 'ai' | 'human' | null;
type Phase = 'intro' | 'betting' | 'mode-select' | 'playing' | 'results';

const TOTAL_SUBROUNDS = 3;
const MESSAGES_PER_SUBROUND = 3;

export default function Round3({ currentChips, onComplete, username }: Round3Props) {
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
    const handleMessage = (message: any) => {
      console.log('Received message:', message);
      // Handle incoming chat messages
    };

    network_manager.message_callback = handleMessage;
    
    return () => {
      network_manager.message_callback = null;
    };
  }, []);

  // Randomly select AI or Human mode and set up connection
  const selectRandomMode = useCallback(async () => {
    // Randomly choose between AI and Human (70% AI, 30% Human chance)
    const randomMode: ChatMode = Math.random() < 0.7 ? 'ai' : 'human';
    setActualMode(randomMode);
    setConnectionError('');
    console.log('Selected mode (hidden from player):', randomMode);

    if (randomMode === 'human') {

      try {
        selectHumanChat();
      } catch (error: unknown) {
        console.error('Connection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setConnectionError(`Failed to connect to host: ${errorMessage}`);
        // If connection fails, fall back to AI mode
        console.log('Falling back to AI mode due to connection failure');
        setActualMode('ai');
        reset_conversation();
        setPhase('playing');
      } finally {

      }
    } else {
      // AI mode - start immediately
      reset_conversation();
      setPhase('playing');
    }
  }, []);
  //If Human is selected
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
    } finally {

    }
  }, [username]);

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
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24">
        <div className="max-w-2xl w-full bg-[#12151E] border border-[#232938] rounded-2xl p-8 sm:p-10 shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-[#2B354D] text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
            <MessageCircle size={14} />
            <span>Event III • The Ultimate Turing Test</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight uppercase mb-3">
            The Turing Table
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            You will enter a blind, private terminal with an unknown counterpart. It is either an autonomous AI model or a real human operator. You have 3 messages to interrogate them and deduce their true nature.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 text-left">
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Subrounds</span>
              <span className="text-2xl font-mono font-black text-white">{TOTAL_SUBROUNDS} Total</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Time Limit</span>
              <span className="text-2xl font-mono font-black text-amber-400">2 Min / Rd</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Message Cap</span>
              <span className="text-2xl font-mono font-black text-blue-400">{MESSAGES_PER_SUBROUND} msgs</span>
            </div>
          </div>

          <button
            onClick={() => setPhase('betting')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-lg uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>PLACE WAGER &amp; START</span>
          </button>

          {/* Development skip button for testing transitions */}
          <div className="mt-4">
            <button
              onClick={() => {
                handleFinishRound();
              }}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors cursor-pointer"
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
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24">
        <div className="max-w-2xl w-full">
          <BettingPanel currentChips={currentChips} onBet={handleBet} />
        </div>
      </div>
    );
  }

  // Mode Selection Screen (random selection in progress)
  if (phase === 'mode-select') {
    return (
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24">
        <div className="max-w-md w-full bg-[#12151E] border border-[#232938] rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#181D2A] border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="text-amber-400 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
            Establishing Secure Line
          </h2>
          <p className="text-slate-400 text-sm font-mono mb-4">
            Subround {currentRound + 1} of {TOTAL_SUBROUNDS} • Pairing with blind counterpart...
          </p>
          <div className="w-full bg-[#181D2A] rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full w-2/3 animate-pulse rounded-full" />
          </div>
          {connectionError && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-400 text-xs font-mono">
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
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24">
        <div className="max-w-md w-full bg-[#12151E] border border-[#232938] rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#181D2A] border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
            Pairing With Remote Host
          </h2>
          <p className="text-slate-400 text-sm font-mono mb-2">
            Synchronizing encrypted WebSocket channel...
          </p>
          {connectionError && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-400 text-xs font-mono">
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
      <div className="min-h-screen casino-table-bg flex flex-col pt-16">
        {/* Subround HUD Banner */}
        <div className="bg-[#12151E] border-b border-[#232938] px-4 sm:px-8 py-3">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to abandon this interrogation? Your progress will be lost.')) {
                    network_manager.disconnect();
                    setPhase('mode-select');
                    setActualMode(null);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#181D2A]"
                title="Abandon Subround"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Interrogation Session
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Subround {currentRound + 1} of {TOTAL_SUBROUNDS}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-[#181D2A] border border-[#2E374D] text-xs font-mono text-slate-300">
                Messages: <span className="text-amber-400 font-bold">{MESSAGES_PER_SUBROUND - messagesSent}</span> left
              </div>
            </div>
          </div>
        </div>

        {/* Chat Component Container */}
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-hidden flex flex-col">
          <div className="flex-1 bg-[#12151E] border border-[#232938] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <ChatInterface 
              mode={actualMode}
              onComplete={() => {}} // disable auto-complete
              timeLimit={120}
              onTimeUp={handleTimeUp}
              isConnected={actualMode === 'ai' ? true : isConnected}
              messageLimit={MESSAGES_PER_SUBROUND}
              messagesSent={messagesSent}
              onSendMessage={() => {
                const nextSent = messagesSent + 1;
                setMessagesSent(nextSent);
                if (nextSent >= MESSAGES_PER_SUBROUND) {
                  setTimeout(() => {
                    setShowGuess(true);
                  }, 2000);
                }
              }}
              disableInput={messagesSent >= MESSAGES_PER_SUBROUND}
            />
          </div>

          {/* High-Stakes Verdict Modal */}
          {showGuess && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#08090D]/90 backdrop-blur-md z-50 p-4">
              <div className="bg-[#12151E] border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-4">
                  <span>Interrogation Concluded</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
                  Identify Your Counterpart
                </h2>
                <p className="text-slate-400 text-sm font-mono mb-8">
                  3 messages complete. Deliver your final classification to settle this subround.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#182338] to-[#101726] hover:from-[#223250] hover:to-[#162035] border-2 border-blue-500/40 hover:border-blue-400 rounded-xl text-white shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer"
                    onClick={() => handleSubroundGuess('ai')}
                  >
                    <span className="text-2xl font-black font-display text-blue-400 mb-1">ARTIFICIAL</span>
                    <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">AI Model</span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2E1D10] to-[#1C120A] hover:from-[#3E2716] hover:to-[#26190E] border-2 border-amber-500/40 hover:border-amber-400 rounded-xl text-white shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer"
                    onClick={() => handleSubroundGuess('human')}
                  >
                    <span className="text-2xl font-black font-display text-amber-400 mb-1">HUMAN</span>
                    <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Live Host</span>
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
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24">
        <div className="max-w-2xl w-full bg-[#12151E] border border-[#232938] rounded-2xl p-8 sm:p-10 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
            Round 3 Complete
          </div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-6">
            Turing Trial Settled
          </h2>

          <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#12151E] rounded-lg p-3 border border-[#232938]">
                <span className="text-2xl font-mono font-black text-emerald-400">{roundScore}</span>
                <span className="text-xs font-mono text-slate-400 block mt-0.5">Correct Guesses</span>
              </div>
              <div className="bg-[#12151E] rounded-lg p-3 border border-[#232938]">
                <span className="text-2xl font-mono font-black text-rose-400">{TOTAL_SUBROUNDS - roundScore}</span>
                <span className="text-xs font-mono text-slate-400 block mt-0.5">Incorrect Guesses</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#232938] text-xs font-mono">
              <span className="text-slate-400">Round Wager:</span>
              <span className="text-white font-bold text-sm">${currentBet}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-xs font-mono">
              <span className="text-slate-400">Total Turing Accuracy:</span>
              <span className="text-amber-400 font-bold text-sm">{scorePercentage}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#232938] text-xs font-mono">
              <span className="text-slate-400">Settlement Payout:</span>
              <span className="text-emerald-400 font-bold text-sm">+{winnings} Chips</span>
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>COLLECT WINNINGS &amp; ENTER VAULT</span>
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
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