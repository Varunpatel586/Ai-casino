import { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  Crown,
  Check
} from 'lucide-react';
import { 
  multiplayerSocket, 
  TableState, 
  PlayerSeat, 
  FeedRevealedData 
} from '../services/multiplayerSocket';
import { Player, BetAmount } from '../types';
import LiveLeaderboardSide from './LiveLeaderboardSide';

interface MultiplayerRound1Props {
  player: Player;
  onComplete: (score: number, bet: number, totalFeeds?: number, finalChips?: number) => void;
  roomId?: string;
  onChipUpdate?: (chips: number) => void;
}

export default function MultiplayerRound1({ player, onComplete, roomId: propRoomId, onChipUpdate }: MultiplayerRound1Props) {
  // Read room code from prop, URL query param, or default to table_01
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const roomParam = propRoomId || urlParams.get('room');
  const roomId = roomParam ? roomParam.toLowerCase().replace(/\s+/g, '-') : 'table_01';

  const [tableState, setTableState] = useState<TableState | null>(null);
  const [mySeatNumber, setMySeatNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetAmount | null>(null);
  const [myAnswer, setMyAnswer] = useState<'real' | 'ai' | null>(null);
  const [lockedTimeTaken, setLockedTimeTaken] = useState<number | null>(null);
  const [lockedMultiplier, setLockedMultiplier] = useState<number | null>(null);
  const [feedReveal, setFeedReveal] = useState<FeedRevealedData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [winnersTimer, setWinnersTimer] = useState<number>(15); // 15s celebration before auto-proceed
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedChipsRef = useRef<number>(player.chips);

  useEffect(() => {
    lastReportedChipsRef.current = player.chips;
  }, [player.chips]);

  // Preload all Round 1 images and video buffers into browser cache for instant zero-latency rendering
  useEffect(() => {
    const imagesToPreload = [
      '/images/round1/img1.jpg',
      '/images/round1/img2.jpg',
      '/images/round1/img3.jpg',
      '/images/round1/img4.jpg',
      '/images/round1/img5.jpg',
      '/images/round1/img6.jpg',
      '/images/round1/img7.jpg',
      '/images/round1/img8.jpg',
      '/images/round1/img9.jpg',
      '/images/round1/img10.jpg',
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const videosToPreload = [
      '/Videos/round1/vid1.mp4',
      '/Videos/round1/vid2.mp4',
      '/Videos/round1/vid3.mp4',
      '/Videos/round1/vid4.mp4',
      '/Videos/round1/vid5.mp4',
    ];
    videosToPreload.forEach((src) => {
      const vid = document.createElement('video');
      vid.src = src;
      vid.preload = 'auto';
    });
  }, []);

  // Connect to multiplayer room
  useEffect(() => {
    const socket = multiplayerSocket.connect();

    const handleTableState = (state: TableState) => {
      setTableState(state);
      setCountdown(state.roundTimer);
      const me = state.players?.find((p) => p.playerId === player.id);
      if (me && typeof me.chips === 'number' && me.chips !== lastReportedChipsRef.current) {
        lastReportedChipsRef.current = me.chips;
        onChipUpdate?.(me.chips);
      }
    };

    const handleSeatAssigned = ({ seatNumber, playerId }: { seatNumber: number; playerId: string }) => {
      if (playerId === player.id) {
        setMySeatNumber(seatNumber);
      }
    };

    const handleTimerTick = ({ secondsLeft }: { secondsLeft: number }) => {
      setCountdown(secondsLeft);
    };

    const handleWagerPhaseStarted = (data?: { duration?: number }) => {
      setMyAnswer(null);
      setFeedReveal(null);
      setSelectedBet(null);
      setLockedTimeTaken(null);
      setLockedMultiplier(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
    };

    const handleFeedStarted = (data?: { duration?: number }) => {
      setMyAnswer(null);
      setFeedReveal(null);
      setLockedTimeTaken(null);
      setLockedMultiplier(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    };

    const handleFeedRevealed = (data: FeedRevealedData) => {
      setFeedReveal(data);
      const meResult = data.playerResults?.find((pr) => pr.playerId === player.id);
      if (meResult && typeof meResult.newChips === 'number' && meResult.newChips !== lastReportedChipsRef.current) {
        lastReportedChipsRef.current = meResult.newChips;
        onChipUpdate?.(meResult.newChips);
      }
    };

    const handleErrorMessage = ({ message }: { message: string }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    };

    socket.on('table_state', handleTableState);
    socket.on('seat_assigned', handleSeatAssigned);
    socket.on('timer_tick', handleTimerTick);
    socket.on('wager_phase_started', handleWagerPhaseStarted);
    socket.on('feed_started', handleFeedStarted);
    socket.on('feed_revealed', handleFeedRevealed);
    socket.on('error_message', handleErrorMessage);

    // Join room as player
    multiplayerSocket.joinTable(roomId, player.id, player.username, player.chips);

    return () => {
      socket.off('table_state', handleTableState);
      socket.off('seat_assigned', handleSeatAssigned);
      socket.off('timer_tick', handleTimerTick);
      socket.off('wager_phase_started', handleWagerPhaseStarted);
      socket.off('feed_started', handleFeedStarted);
      socket.off('feed_revealed', handleFeedRevealed);
      socket.off('error_message', handleErrorMessage);
    };
  }, [roomId, player.id, player.username]);

  // Video playback sync on feed change
  useEffect(() => {
    if (tableState?.status === 'playing' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [tableState?.status, tableState?.currentFeedIndex]);

  // Celebratory timer for winners showcase
  useEffect(() => {
    if (tableState?.status === 'settled') {
      const interval = setInterval(() => {
        setWinnersTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tableState?.status]);

  const mySeat = tableState?.players?.find((p) => p.playerId === player.id);
  const isMyBetPlaced = mySeat?.betStatus === 'placed' || mySeat?.betStatus === 'locked';
  const myCurrentChips = mySeat ? (mySeat.chips ?? 0) : (player.chips ?? 0);

  // Compute challenge mode (5 Images 0-4 vs 5 Videos 5-9)
  const currentFeedIndex = tableState?.currentFeedIndex ?? 0;
  const isVideoRound = tableState?.currentVideo?.type === 'video' || currentFeedIndex >= 5;
  const totalFeeds = tableState?.totalFeeds || 10;
  const challengeDuration = isVideoRound ? 45 : 30;

  // Active Multiplier calculation based on elapsed time:
  // Images (30s): <=5s -> 5x, <=10s -> 4x, <=15s -> 3x, <=20s -> 2x, >20s -> 1x
  // Videos (45s): <=5s -> 5x, <=10s -> 4x, <=20s -> 3x, <=30s -> 2x, >30s -> 1x
  const elapsed = Math.max(0, challengeDuration - countdown);
  let liveMultiplier = 1;
  let nextThresholdSecs = 0;

  if (isVideoRound) {
    if (elapsed <= 5) {
      liveMultiplier = 5;
      nextThresholdSecs = 5 - elapsed;
    } else if (elapsed <= 10) {
      liveMultiplier = 4;
      nextThresholdSecs = 10 - elapsed;
    } else if (elapsed <= 20) {
      liveMultiplier = 3;
      nextThresholdSecs = 20 - elapsed;
    } else if (elapsed <= 30) {
      liveMultiplier = 2;
      nextThresholdSecs = 30 - elapsed;
    } else {
      liveMultiplier = 1;
      nextThresholdSecs = 0;
    }
  } else {
    if (elapsed <= 5) {
      liveMultiplier = 5;
      nextThresholdSecs = 5 - elapsed;
    } else if (elapsed <= 10) {
      liveMultiplier = 4;
      nextThresholdSecs = 10 - elapsed;
    } else if (elapsed <= 15) {
      liveMultiplier = 3;
      nextThresholdSecs = 15 - elapsed;
    } else if (elapsed <= 20) {
      liveMultiplier = 2;
      nextThresholdSecs = 20 - elapsed;
    } else {
      liveMultiplier = 1;
      nextThresholdSecs = 0;
    }
  }

  const handleToggleReady = () => {
    if (!mySeat) return;
    const newReady = !mySeat.isReady;
    multiplayerSocket.toggleReady(roomId, player.id, newReady);
  };

  const handlePlaceBet = (amount: BetAmount) => {
    if (myCurrentChips <= 0) return;
    setSelectedBet(amount);
    const numericBet = amount === 'ALL_IN' ? myCurrentChips : amount;
    if (numericBet <= 0) return;
    multiplayerSocket.placeBet(roomId, player.id, numericBet);
  };

  const handleSelectAnswer = (answer: 'real' | 'ai') => {
    if (myAnswer !== null || tableState?.status !== 'playing') return;
    setMyAnswer(answer);
    setLockedTimeTaken(elapsed);
    setLockedMultiplier(liveMultiplier);
    multiplayerSocket.submitAnswer(roomId, player.id, currentFeedIndex, answer);
  };

  const handleQuickStart = () => {
    multiplayerSocket.quickStart(roomId);
  };

  const handleSelectSeat = (seatNum: number) => {
    multiplayerSocket.selectSeat(roomId, player.id, seatNum);
  };

  const handleResetTable = () => {
    multiplayerSocket.resetTable(roomId);
    setTimeout(() => {
      multiplayerSocket.joinTable(roomId, player.id, player.username, myCurrentChips);
    }, 250);
  };

  const handleFinalizeAndProceed = () => {
    const mySettlement = tableState?.settlements?.find((s) => s.playerId === player.id);
    const score = mySettlement ? mySettlement.score : 0;
    const bet = mySettlement ? mySettlement.betAmount : (mySeat?.betAmount || 10);
    const finalChips = mySettlement ? (mySettlement.finalChips ?? 0) : (myCurrentChips ?? 0);
    onChipUpdate?.(finalChips);
    onComplete(score, bet, totalFeeds, finalChips);
  };

  // Helper to get player in seat 1..6
  const getPlayerInSeat = (seatNum: number): PlayerSeat | undefined => {
    return tableState?.players?.find((p) => p.seatNumber === seatNum);
  };

  const readyCount = tableState?.players?.filter((p) => p.isReady).length || 0;
  const totalOccupied = tableState?.players?.length || 0;

  // Compact Player Seat Pod with Real-time Chip Balance & Delta Badge
  const renderSeatPod = (seatNum: number) => {
    const seatPlayer = getPlayerInSeat(seatNum);
    const isMe = seatPlayer?.playerId === player.id;
    const isReady = Boolean(seatPlayer?.isReady);

    const revealMatch = feedReveal?.playerResults?.find((pr) => pr.seatNumber === seatNum || (seatPlayer && pr.playerId === seatPlayer.playerId));
    const activeDelta = revealMatch ? revealMatch.netDelta : seatPlayer?.lastDelta;
    const activeMultiplier = revealMatch ? revealMatch.multiplier : seatPlayer?.lastMultiplier;

    return (
      <div 
        key={seatNum}
        className={`relative z-20 flex flex-col justify-between p-1.5 sm:p-2 rounded-xl border transition-all duration-300 select-none shadow-xl ${
          isMe
            ? 'bg-[#121826]/95 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
            : seatPlayer
            ? 'bg-[#0B0F19]/90 border-[#222B3D]'
            : 'bg-[#07090F]/70 border-dashed border-[#1B2233] opacity-60'
        }`}
        style={{ minWidth: '115px', maxWidth: '145px' }}
      >
        {/* Top Header: Seat Number & Status */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
            isMe ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-[#181F2E] text-slate-400 border border-[#2B354D]'
          }`}>
            S{seatNum}
          </span>

          {seatPlayer ? (
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                seatPlayer.connected ? 'bg-emerald-400' : 'bg-rose-500'
              }`} />
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                isReady ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isReady ? 'READY' : 'WAIT'}
              </span>
            </div>
          ) : (
            <span className="text-[8px] font-mono text-slate-500 uppercase">VACANT</span>
          )}
        </div>

        {/* Moniker & Chips */}
        {seatPlayer ? (
          <div>
            <div className="text-[11px] sm:text-xs font-display font-black text-white truncate flex items-center gap-1">
              <span className="truncate">{seatPlayer.username}</span>
              {isMe && <span className="text-[9px] text-amber-400 font-mono">★</span>}
              {seatPlayer.playerId.startsWith('bot-') && (
                <span className="text-[7px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  BOT
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono">
              <div className="flex items-center gap-0.5">
                <Coins size={10} className="text-amber-400" />
                <span className="font-black text-amber-400">${(seatPlayer.chips ?? 0).toLocaleString()}</span>
              </div>
              {(seatPlayer.betAmount ?? 0) > 0 ? (
                <span className="text-[9px] text-slate-400 font-bold">
                  Bet: ${seatPlayer.betAmount}
                </span>
              ) : (seatPlayer.chips ?? 0) <= 0 ? (
                <span className="text-[9px] text-cyan-400 font-bold font-mono">
                  Watching
                </span>
              ) : null}
            </div>

            {/* Answer Status in Playing Phase */}
            {tableState?.status === 'playing' && (
              <div className="mt-0.5 pt-0.5 border-t border-[#1C2333] flex items-center justify-between text-[8px] font-mono">
                <span className="text-slate-500 uppercase">CHOICE:</span>
                {seatPlayer.answerStatus === 'answered' ? (
                  <span className="text-emerald-400 font-black flex items-center gap-0.5">
                    <Check size={8} />
                    <span>LOCKED</span>
                  </span>
                ) : (
                  <span className="text-amber-400 animate-pulse font-bold">THINKING</span>
                )}
              </div>
            )}

            {/* Live Delta Badge (Shown during reveal) */}
            {(tableState?.status === 'revealing' || !!feedReveal) && activeDelta !== undefined && (
              <div className={`mt-0.5 py-0.5 px-1.5 rounded text-[10px] font-sans font-bold text-center animate-fade-in ${
                activeDelta > 0
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : activeDelta < 0
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400'
              }`}>
                <span>{activeDelta > 0 ? `+$${activeDelta}` : activeDelta < 0 ? `-$${Math.abs(activeDelta)}` : '$0 (Watching)'}</span>
                {(activeMultiplier ?? 0) > 1 && activeDelta > 0 ? (
                  <span className="ml-0.5 text-amber-300 font-mono">⚡{activeMultiplier}x</span>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="py-1 text-center text-slate-500 font-mono text-[10px]">
            {tableState?.status === 'waiting' && !mySeat ? (
              <button
                onClick={() => handleSelectSeat(seatNum)}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                + Take Seat
              </button>
            ) : (
              <span>Empty</span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!tableState) {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-4 text-slate-100 select-none overflow-hidden">
        <div className="max-w-md w-full bg-[#12151E] border border-[#2B354D] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users size={28} />
          </div>
          <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
            Entering Arena Table
          </h3>
          <p className="text-slate-400 text-xs font-mono mb-6">
            Joining room <strong className="text-white uppercase">{roomId}</strong> as <strong className="text-amber-400">{player.username}</strong>...
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => multiplayerSocket.joinTable(roomId, player.id, player.username, player.chips)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile cursor-pointer"
            >
              TAKE SEAT NOW
            </button>
            <button
              onClick={handleResetTable}
              className="w-full py-2.5 bg-[#181D2A] hover:bg-[#202738] border border-[#2D374D] text-slate-400 rounded-xl font-mono text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset Room State</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find local player result for current feed reveal
  const myRevealResult = feedReveal?.playerResults?.find((pr) => pr.playerId === player.id);

  return (
    <div className="w-full h-full flex-1 min-h-0 casino-table-bg text-slate-100 p-2 sm:p-3 flex flex-col justify-between overflow-hidden select-none">
      <div className="w-full max-w-[1440px] mx-auto h-full flex flex-col justify-between overflow-hidden">
        {/* Top Notification Bar */}
        {errorMessage && (
          <div className="mb-2 bg-rose-500/20 border border-rose-500 text-rose-300 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Phase Transition Banner (Challenge 6 / Video phase starts) */}
        {currentFeedIndex === 5 && tableState.status === 'betting' && (
          <div className="mb-2 bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-blue-900/60 border border-cyan-400/60 p-2.5 rounded-xl text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-fade-in flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-[10px] font-black uppercase mb-0.5">
              <Sparkles size={11} />
              <span>STAGE II: VIDEO SURVEILLANCE</span>
            </div>
            <h3 className="text-sm font-display font-black text-white uppercase tracking-tight">
              📸 5 Image Challenges Done! Next: 5 Surveillance Feeds (45s • up to 5x multiplier)
            </h3>
          </div>
        )}

        {/* Header HUD */}
        <div className="flex flex-wrap justify-between items-center gap-2 bg-[#12151E] border border-[#232938] rounded-xl px-4 py-2 mb-2 shadow-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Video size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-blue-400 tracking-widest font-bold">
                  Round 1 • Real vs AI Intelligence
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <Users size={10} />
                  <span>Room: {tableState.roomCode || roomId}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {readyCount}/{totalOccupied} Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>The Reality Bet</span>
                {tableState.status === 'playing' && (
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isVideoRound
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {isVideoRound ? '🎥 Video Challenge' : '📸 Image Challenge'}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Table Room Controls / Multiplier HUD / Status */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Speed Multiplier Badge during Playing Phase */}
            {tableState.status === 'playing' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border transition-all duration-300 ${
                liveMultiplier >= 4
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.35)] animate-pulse'
                  : liveMultiplier >= 2
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <Zap size={14} className={liveMultiplier >= 4 ? 'text-amber-400' : liveMultiplier >= 2 ? 'text-cyan-400' : 'text-slate-400'} />
                <span>
                  {liveMultiplier}x Speed Multiplier {liveMultiplier > 1 ? `(${nextThresholdSecs}s left)` : ''}
                </span>
              </div>
            )}

            {/* Mobile Standings Drawer Trigger Button */}
            <button
              onClick={() => setShowMobileLeaderboard(true)}
              className="lg:hidden px-3 py-2 bg-[#181D2A] hover:bg-[#202738] border border-amber-400/40 text-amber-400 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="View Live Standings"
            >
              <Trophy size={13} />
              <span>Standings ({tableState?.players?.length ?? 0})</span>
            </button>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#181D2A] border border-[#2D374D] rounded-xl font-mono text-sm">
              <Clock size={16} className={countdown <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
              <span className="text-slate-400 text-xs uppercase">Clock:</span>
              <span className={`font-black text-base ${countdown <= 10 ? 'text-rose-400' : 'text-white'}`}>
                {countdown}s
              </span>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE LAYOUT: 3D Table on Left, Live Leaderboard on Right */}
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row gap-3 items-stretch overflow-hidden">
          {/* 3D TABLE AS MAIN ENVIRONMENT */}
          <div className="flex-1 w-full min-w-0 h-full flex flex-col overflow-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#1E2535] bg-[#07090E] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between p-2 sm:p-3">
          {/* STATIC HIGH-PERFORMANCE TABLE BACKGROUND */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <img
              src="/images/blackjack-table-bg.jpg"
              alt="Casino Blackjack Table"
              className="w-full h-full object-cover select-none pointer-events-none brightness-95 contrast-105"
            />
            {/* Subtle table edge vignette & ambient shading */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#07090E]/60 via-transparent to-[#07090E]/40" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(7,9,14,0.85)]" />
          </div>

          {/* TOP ROW: PLAYER 1 (Left) & PLAYER 2 (Right) */}
          <div className="relative z-20 flex items-center justify-between gap-2 sm:gap-4 w-full shrink-0">
            <div>{renderSeatPod(1)}</div>
            <div>{renderSeatPod(2)}</div>
          </div>

          {/* MIDDLE ROW: PLAYER 6 (Left), CENTER STAGE (Covers 'WHITE BLACKJACK'), PLAYER 3 (Right) */}
          <div className="relative z-20 flex-1 min-h-0 flex items-center justify-between gap-2 sm:gap-4 my-1 w-full overflow-hidden">
            {/* Left: Player 6 */}
            <div className="shrink-0">{renderSeatPod(6)}</div>

            {/* CENTER TABLE STAGE: Conceals 'WHITE BLACKJACK' */}
            <div className="flex-1 min-h-0 h-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto flex items-center justify-center pointer-events-auto px-1 sm:px-2">
              {tableState.status === 'waiting' ? (
                /* LOBBY FELT CREST */
                <div className="bg-[#0B1713]/92 backdrop-blur-sm border border-amber-500/40 rounded-3xl px-6 py-5 sm:px-8 sm:py-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(11,23,19,0.9)] max-w-md w-full animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                    Event I • The Reality Protocol
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1.5">
                    Multiplayer Table Lobby
                  </h3>
                  <p className="text-slate-400 text-xs font-mono mb-4">
                    {totalOccupied} of 6 Seats Occupied • {readyCount} Players Ready
                  </p>

                  <div className="flex items-center justify-center gap-2.5">
                    {mySeat && (
                      <button
                        onClick={handleToggleReady}
                        className={`py-2 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          mySeat.isReady
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                            : 'bg-amber-400 text-slate-950 border-amber-400 hover:bg-amber-300 shadow-tactile'
                        }`}
                      >
                        {mySeat.isReady ? 'YOU ARE READY ✓' : 'CLICK TO BECOME READY'}
                      </button>
                    )}
                    <button
                      onClick={handleQuickStart}
                      className="py-2 px-3.5 bg-[#171E2D] hover:bg-[#222B3E] border border-[#2D3950] text-slate-200 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      title="Fill remaining seats with AI Bots and start immediately"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Quick Demo</span>
                    </button>
                  </div>
                  <div className="mt-3 text-[10px] font-mono">
                    {tableState.hostConnected ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Host Connected (Pit Boss) • Awaiting Host Start
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Waiting for Host to start Round 1...
                      </span>
                    )}
                  </div>
                </div>
              ) : tableState.status === 'betting' ? (
                /* PER-CHALLENGE WAGER PHASE CONSOLE */
                <div className="bg-[#0B1019]/95 backdrop-blur-md border border-amber-500/50 rounded-3xl p-5 sm:p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-lg w-full animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Coins size={24} />
                  </div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1 tracking-wider">
                    CHALLENGE {currentFeedIndex + 1} OF {totalFeeds} • {isVideoRound ? '🎥 VIDEO ROUND' : '📸 IMAGE ROUND'}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
                    {isMyBetPlaced ? `Wager Placed: $${mySeat?.betAmount ?? 0}` : 'Select Wager for this Challenge'}
                  </h4>
                  <p className="text-slate-400 text-xs font-mono mb-4">
                    {isVideoRound ? '45s Video • Speed Multipliers: ≤5s 5x, ≤10s 4x, ≤20s 3x, ≤30s 2x, >30s 1x' : '30s Image • Speed Multipliers: ≤5s 5x, ≤10s 4x, ≤15s 3x, ≤20s 2x, >20s 1x'}
                  </p>

                  <div className="text-3xl font-mono font-black text-amber-400 mb-4">
                    {countdown}s REMAINING
                  </div>

                  {/* Inline Quick Bet Selectors for Center Felt */}
                  <div className="flex items-center justify-center gap-2">
                    {([10, 30, 'ALL_IN'] as BetAmount[]).map((amount) => {
                      const betVal = amount === 'ALL_IN' ? Math.max(0, myCurrentChips) : amount;
                      const canAfford = myCurrentChips >= betVal && betVal > 0;
                      const isSelected = selectedBet === amount || (mySeat?.betAmount === betVal && betVal > 0);

                      return (
                        <button
                          key={amount}
                          onClick={() => handlePlaceBet(amount)}
                          disabled={!canAfford || isMyBetPlaced || myCurrentChips <= 0}
                          className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all duration-150 border ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-tactile'
                              : canAfford && !isMyBetPlaced && myCurrentChips > 0
                              ? 'bg-[#181D2A] text-slate-200 border-[#2E374D] hover:border-amber-400/60 cursor-pointer'
                              : 'bg-[#10131B] text-slate-600 border-[#1C2230] opacity-40 cursor-not-allowed'
                          }`}
                          title={myCurrentChips <= 0 ? 'Unable to wager with $0 chips' : undefined}
                        >
                          {amount === 'ALL_IN' ? `ALL-IN ($${betVal})` : `$${amount}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (tableState.status === 'playing' || tableState.status === 'revealing') ? (
                /* LIVE MEDIA CHALLENGE FEED (IMAGES & VIDEOS) */
                <div className="bg-[#0A0D15]/95 backdrop-blur-md border border-[#2B354D] rounded-2xl p-2 sm:p-2.5 shadow-2xl w-full h-full max-h-[52vh] sm:max-h-[56vh] flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1 px-1 text-xs font-mono shrink-0">
                    <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Feed {currentFeedIndex + 1} of {totalFeeds} • {isVideoRound ? '🎥 Video Surveillance' : '📸 Intelligence Image'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {countdown}s left
                    </span>
                  </div>

                  <div className="w-full flex-1 min-h-[260px] sm:min-h-[320px] bg-black/95 rounded-xl overflow-hidden border border-[#242C3E] relative flex items-center justify-center shadow-inner mx-auto">
                    {tableState.currentVideo?.type === 'image' || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc || '') ? (
                      <img
                        key={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        src={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        alt={tableState.currentVideo?.title || 'Reality Feed'}
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none animate-fade-in transition-opacity duration-200 shadow-2xl"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <video
                        key={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        ref={videoRef}
                        src={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
                        preload="auto"
                        playsInline
                        autoPlay
                        muted
                        loop={false}
                        onPlay={() => setIsPlayingVideo(true)}
                        onPause={() => setIsPlayingVideo(false)}
                        onEnded={() => setIsPlayingVideo(false)}
                      />
                    )}

                    {/* Speed Multiplier Watermark Badge */}
                    {tableState.status === 'playing' && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[11px] font-black uppercase flex items-center gap-1 shadow-lg border ${
                          liveMultiplier >= 4
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                            : liveMultiplier >= 2
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                            : 'bg-black/60 border-slate-700 text-slate-400'
                        }`}>
                          <Zap size={12} className={liveMultiplier >= 4 ? 'text-amber-400' : liveMultiplier >= 2 ? 'text-cyan-400' : 'text-slate-400'} />
                          <span>{liveMultiplier}x MULTIPLIER</span>
                        </div>
                      </div>
                    )}

                    {/* Lock-in Notification Badge */}
                    {myAnswer && !feedReveal && (
                      <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/80 backdrop-blur-md border border-emerald-500/60 text-emerald-300 px-3 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 shadow-lg">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Locked in: {myAnswer.toUpperCase()} (⚡{lockedMultiplier}x at {lockedTimeTaken?.toFixed(1)}s)</span>
                      </div>
                    )}

                    {/* Instant Reveal Overlay (4.5s) */}
                    {feedReveal && (
                      <div className="absolute inset-0 bg-[#090A0F]/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center animate-fade-in z-20 overflow-y-auto">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-1.5 border shadow-lg shrink-0 ${
                          feedReveal.isAI 
                            ? 'bg-rose-500/20 border-rose-500/60 text-rose-400' 
                            : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                        }`}>
                          {feedReveal.isAI ? <Video size={22} /> : <CheckCircle2 size={22} />}
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 tracking-wider shrink-0">Verified Reality Classification:</span>
                        <h4 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider my-1 shrink-0">
                          {feedReveal.classification}
                        </h4>

                        {/* Local Player Payout Banner */}
                        {myRevealResult && (
                          <div className={`my-1.5 py-1 px-4 rounded-xl font-mono text-xs sm:text-sm font-black border shrink-0 ${
                            (myRevealResult.netDelta ?? 0) === 0
                              ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                              : myRevealResult.isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300'
                          }`}>
                            {(myRevealResult.netDelta ?? 0) === 0
                              ? '👁️ Watching Feed ($0 at risk)'
                              : myRevealResult.isCorrect
                              ? `🎉 CORRECT! +$${myRevealResult.netDelta} (⚡${myRevealResult.multiplier}x Multiplier Applied)`
                              : `❌ INCORRECT (-$${Math.abs(myRevealResult.netDelta ?? (mySeat?.betAmount || 10))})`}
                          </div>
                        )}

                        {/* Compact Table Seat Chip Ledger */}
                        <div className="mt-1 flex flex-wrap gap-1.5 justify-center max-w-lg shrink-0">
                          {feedReveal?.playerResults?.map((pr) => (
                            <span 
                              key={pr.playerId}
                              className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded border ${
                                (pr.netDelta ?? 0) === 0
                                  ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                                  : pr.isCorrect 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                              }`}
                            >
                              S{pr.seatNumber}: {(pr.netDelta ?? 0) === 0 ? '$0 (Watching)' : pr.isCorrect ? `+$${pr.netDelta} (⚡${pr.multiplier}x)` : `-$${Math.abs(pr.netDelta ?? 10)}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs font-mono text-center mt-1.5 shrink-0 truncate">
                    {isVideoRound 
                      ? (isPlayingVideo ? '▶ Surveillance stream active (45s) • Guess under 5s for 5x speed multiplier' : '▶ Surveillance stream ready (45s) • Guess under 5s for 5x speed multiplier') 
                      : '📸 Image challenge (30s) • Guess under 5s for 5x speed multiplier'}
                  </p>
                </div>
              ) : (
                /* ROUND 1 COMPLETED LOBBY */
                <div className="bg-[#0B1019]/95 backdrop-blur-md border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl max-w-md w-full">
                  <Trophy size={36} className="text-amber-400 mb-2 mx-auto" />
                  <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                    Round 1 Completed
                  </h4>
                  <button
                    onClick={handleFinalizeAndProceed}
                    className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile cursor-pointer"
                  >
                    CONTINUE TO NEXT ROUND
                  </button>
                </div>
              )}
            </div>

            {/* Right: Player 3 */}
            <div className="shrink-0">{renderSeatPod(3)}</div>
          </div>

          {/* BOTTOM ROW: PLAYER 5 (Left) & PLAYER 4 (Right) */}
          <div className="relative z-20 flex items-center justify-between gap-2 sm:gap-4 w-full shrink-0">
            <div>{renderSeatPod(5)}</div>
            <div>{renderSeatPod(4)}</div>
          </div>
        </div>
      </div>

      {/* DEDICATED RIGHT-SIDE LIVE LEADERBOARD (Desktop) */}
      <div className="hidden lg:flex flex-col w-[260px] xl:w-[280px] h-full shrink-0 overflow-hidden">
        <LiveLeaderboardSide
          players={tableState?.players || []}
          currentFeedIndex={currentFeedIndex}
          totalFeeds={totalFeeds}
          status={tableState?.status}
          currentPlayerId={player.id}
          feedReveal={feedReveal}
        />
      </div>
    </div>

    {/* MOBILE STANDINGS DRAWER MODAL */}
    {showMobileLeaderboard && (
      <div className="fixed inset-0 z-50 bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center p-4 lg:hidden animate-fade-in">
        <div className="w-full max-w-sm">
          <LiveLeaderboardSide
            players={tableState?.players || []}
            currentFeedIndex={currentFeedIndex}
            totalFeeds={totalFeeds}
            status={tableState?.status}
            currentPlayerId={player.id}
            feedReveal={feedReveal}
            isMobileDrawer
            onClose={() => setShowMobileLeaderboard(false)}
          />
        </div>
      </div>
    )}

    {/* GRAND END-OF-ROUND 1 WINNERS SHOWCASE & LIVE LEADERBOARD */}
    {tableState?.status === 'settled' && (
          <div className="fixed inset-0 z-50 bg-[#06080E]/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-3xl w-full bg-[#0F1420] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(251,191,36,0.35)] text-center my-8 animate-fade-in">
              {/* Grand Trophy & Crown Header */}
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/60 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                  <Trophy size={34} />
                </div>
                <Crown size={20} className="text-amber-300 absolute -top-3 -right-2 animate-bounce" />
              </div>

              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                Event I Champions Decided
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight mb-2">
                Round 1 Winners Showcase
              </h3>
              <p className="text-slate-400 text-xs font-mono max-w-lg mx-auto mb-6">
                All 5 Image & 5 Surveillance Video challenges settled. Final scores & chip balances locked into the arena ledger.
              </p>

              {/* PODIUM OF TOP 3 CONTESTANTS */}
              {(tableState?.settlements?.length ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto mb-8 items-end">
                  {/* 2nd Place (Silver) */}
                  {tableState?.settlements?.[1] && (
                    <div className="bg-[#121826] border border-slate-400/40 rounded-2xl p-3 sm:p-4 text-center order-1 h-[190px] flex flex-col justify-between shadow-lg">
                      <div className="w-9 h-9 rounded-xl bg-slate-400/20 border border-slate-400/40 text-slate-300 flex items-center justify-center mx-auto font-mono font-black text-sm">
                        🥈 2
                      </div>
                      <div>
                        <div className="text-xs font-display font-black text-white truncate">
                          {tableState.settlements[1].username}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {tableState.settlements[1].score}/{totalFeeds} Correct
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#1C2538]">
                        <div className="text-base font-mono font-black text-amber-400">
                          ${(tableState.settlements[1].finalChips ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Gold Champion) */}
                  {tableState?.settlements?.[0] && (
                    <div className="bg-gradient-to-b from-[#1C2638] to-[#121826] border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-center order-2 h-[225px] flex flex-col justify-between shadow-[0_0_25px_rgba(251,191,36,0.35)]">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/30 border border-amber-400 text-amber-300 flex items-center justify-center mx-auto font-mono font-black text-base shadow-sm">
                        🥇 1
                      </div>
                      <div>
                        <div className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider mb-0.5">
                          CHAMPION
                        </div>
                        <div className="text-sm font-display font-black text-white truncate">
                          {tableState.settlements[0].username}
                        </div>
                        <div className="text-[11px] font-mono text-slate-300">
                          {tableState.settlements[0].score}/{totalFeeds} Correct
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-500/40">
                        <div className="text-lg font-mono font-black text-amber-400">
                          ${(tableState.settlements[0].finalChips ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place (Bronze) */}
                  {tableState?.settlements?.[2] && (
                    <div className="bg-[#121826] border border-amber-700/40 rounded-2xl p-3 sm:p-4 text-center order-3 h-[175px] flex flex-col justify-between shadow-lg">
                      <div className="w-9 h-9 rounded-xl bg-amber-700/20 border border-amber-700/40 text-amber-600 flex items-center justify-center mx-auto font-mono font-black text-sm">
                        🥉 3
                      </div>
                      <div>
                        <div className="text-xs font-display font-black text-white truncate">
                          {tableState.settlements[2].username}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {tableState.settlements[2].score}/{totalFeeds} Correct
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#1C2538]">
                        <div className="text-base font-mono font-black text-amber-400">
                          ${(tableState.settlements[2].finalChips ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMPLETE RANKED LEADERBOARD TABLE */}
              <div className="bg-[#0B0F19] border border-[#20293D] rounded-2xl overflow-hidden mb-6 text-left">
                <div className="px-4 py-2.5 bg-[#141A28] border-b border-[#20293D] flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
                  <span>Contestant Arena Standings</span>
                  <span>{totalFeeds} Challenges Completed</span>
                </div>
                <div className="divide-y divide-[#182133]">
                  {tableState?.settlements?.map((s, idx) => {
                    const isMe = s.playerId === player.id;
                    const isPositive = (s.netEarnings ?? 0) >= 0;

                    return (
                      <div 
                        key={s.playerId}
                        className={`flex items-center justify-between p-3 text-xs font-mono transition-colors ${
                          isMe 
                            ? 'bg-[#182135] font-bold' 
                            : 'hover:bg-[#101624]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 text-center font-bold ${
                            idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-display font-black text-white flex items-center gap-1.5">
                              <span>{s.username}</span>
                              {isMe && <span className="text-[9px] text-amber-400 font-mono font-bold">(YOU)</span>}
                            </div>
                            <span className="text-[10px] text-slate-500">Seat {s.seatNumber}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-slate-300">{s.score} / {totalFeeds}</span>
                            <div className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? `+$${s.netEarnings ?? 0}` : `-$${Math.abs(s.netEarnings ?? 0)}`}
                            </div>
                          </div>
                          <div className="border-l border-[#20293D] pl-3 min-w-[70px]">
                            <div className="text-[9px] text-slate-500 uppercase">Bankroll</div>
                            <div className="font-black text-amber-400 text-sm">${(s.finalChips ?? 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Celebratory Auto-proceed Counter & Proceed Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleFinalizeAndProceed}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>CONTINUE TO ROUND 2 & BONUS</span>
                  <ArrowRight size={18} />
                </button>
                {winnersTimer > 0 && (
                  <span className="text-xs font-mono text-slate-400">
                    Auto-proceeding in <strong className="text-amber-400">{winnersTimer}s</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIVE PLAYER ACTION DOCK */}
        <div className="w-full flex-shrink-0 z-40 bg-[#0E1119]/95 backdrop-blur-md border border-[#232938] rounded-xl px-3 py-2 shadow-lg mt-1.5">
          <div className="w-full flex flex-wrap items-center justify-between gap-3">
            {/* Player Info Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-mono font-black text-sm">
                S{mySeatNumber || '?'}
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">
                  Contestant: <span className="font-bold text-white">{player.username}</span>
                </div>
                <div className="text-xs font-mono">
                  Wallet: <span className="font-black text-amber-400">${(myCurrentChips ?? 0).toLocaleString()}</span>
                  {mySeat?.betAmount ? (
                    <span className="text-slate-400 ml-2">| Challenge Bet: <strong className="text-white">${mySeat.betAmount}</strong></span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ACTION CONTROLS */}
            {tableState?.status === 'betting' ? (
              /* PER-CHALLENGE BETTING CONTROLS */
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold hidden sm:inline">
                  Challenge Bet:
                </span>
                {([10, 30, 'ALL_IN'] as BetAmount[]).map((amount) => {
                  const betVal: number = amount === 'ALL_IN' ? Math.max(0, myCurrentChips) : amount;
                  const canAfford: boolean = myCurrentChips >= betVal && betVal > 0;
                  const isSelected: boolean = selectedBet === amount || (mySeat?.betAmount === betVal && betVal > 0);

                  return (
                    <button
                      key={amount}
                      onClick={() => handlePlaceBet(amount)}
                      disabled={!canAfford || isMyBetPlaced || myCurrentChips <= 0}
                      className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all duration-150 border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-tactile'
                          : canAfford && !isMyBetPlaced && myCurrentChips > 0
                          ? 'bg-[#181D2A] text-slate-200 border-[#2E374D] hover:border-amber-400/60 cursor-pointer'
                          : 'bg-[#10131B] text-slate-600 border-[#1C2230] opacity-40 cursor-not-allowed'
                      }`}
                      title={myCurrentChips <= 0 ? 'Unable to wager with $0 chips' : undefined}
                    >
                      {amount === 'ALL_IN' ? `ALL-IN ($${betVal})` : `$${amount}`}
                    </button>
                  );
                })}
              </div>
            ) : tableState?.status === 'playing' ? (
              /* CLASSIFICATION ANSWER BUTTONS WITH DYNAMIC MULTIPLIER REWARDS */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSelectAnswer('real')}
                  disabled={myAnswer !== null || !!feedReveal}
                  className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-2 ${
                    myAnswer === 'real'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-tactile'
                      : myAnswer === null && !feedReveal
                      ? 'bg-gradient-to-b from-[#163826] to-[#0D2418] hover:from-[#1E4D34] hover:to-[#123322] border-emerald-500/40 text-emerald-300'
                      : 'bg-[#10131B] border-[#1C2230] text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>REAL</span>
                  {myAnswer === null && !feedReveal && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      ⚡{liveMultiplier}x
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectAnswer('ai')}
                  disabled={myAnswer !== null || !!feedReveal}
                  className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-2 ${
                    myAnswer === 'ai'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-tactile'
                      : myAnswer === null && !feedReveal
                      ? 'bg-gradient-to-b from-[#3D141E] to-[#260B12] hover:from-[#521B29] hover:to-[#330F19] border-rose-500/40 text-rose-300'
                      : 'bg-[#10131B] border-[#1C2230] text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Video size={18} />
                  <span>AI</span>
                  {myAnswer === null && !feedReveal && (
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30">
                      ⚡{liveMultiplier}x
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs font-mono text-slate-400">
                  {tableState.status === 'waiting'
                    ? (mySeat ? `Seated at S${mySeatNumber} • ${mySeat.isReady ? 'Ready for Host' : 'Set Ready'}` : 'Click any vacant seat above')
                    : 'Settling challenge results...'}
                </span>
                {tableState.status === 'waiting' && mySeat && (
                  <button
                    onClick={handleToggleReady}
                    className={`px-3 py-1.5 font-mono font-black text-xs rounded-lg shadow-sm cursor-pointer border ${
                      mySeat.isReady
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-400 text-slate-950 border-amber-400 hover:bg-amber-300'
                    }`}
                  >
                    {mySeat.isReady ? 'Mark Not Ready' : 'Set Ready'}
                  </button>
                )}
                {tableState.status === 'waiting' && !mySeat && (
                  <button
                    onClick={() => handleSelectSeat(1)}
                    className="px-3 py-1.5 bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-lg shadow-sm cursor-pointer hover:bg-amber-300"
                  >
                    Take Seat 1
                  </button>
                )}
                {tableState.status === 'waiting' && (
                  <button
                    onClick={handleQuickStart}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                  >
                    Quick Demo
                  </button>
                )}
                <button
                  onClick={handleResetTable}
                  className="px-2.5 py-1.5 bg-[#181D2A] hover:bg-[#202738] border border-[#2D374D] text-slate-400 hover:text-white rounded-lg font-mono text-xs cursor-pointer flex items-center gap-1"
                  title="Reset table state"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
