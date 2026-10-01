import { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Video, 
  Trophy, 
  Coins,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  multiplayerSocket, 
  TableState, 
  PlayerSeat, 
  FeedRevealedData 
} from '../services/multiplayerSocket';
import LiveLeaderboardSide from '../components/LiveLeaderboardSide';

export default function HostRound1Controller() {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const roomParam = urlParams.get('room');
  const [roomId] = useState<string>(roomParam ? roomParam.toLowerCase().replace(/\s+/g, '-') : 'table_01');
  const [tableState, setTableState] = useState<TableState | null>(null);
  const [feedReveal, setFeedReveal] = useState<FeedRevealedData | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload all Round 1 images and video buffers for instant zero-latency host display
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

  const hostId = useRef(`host-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`).current;

  // Connect socket as Host
  useEffect(() => {
    const socket = multiplayerSocket.connect();

    socket.on('table_state', (state: TableState) => {
      setTableState(state);
      setCountdown(state.roundTimer);
    });

    socket.on('timer_tick', ({ secondsLeft }) => {
      setCountdown(secondsLeft);
    });

    socket.on('wager_phase_started', (data?: { duration?: number }) => {
      setFeedReveal(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
    });

    socket.on('feed_started', (data?: { duration?: number }) => {
      setFeedReveal(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    });

    socket.on('feed_revealed', (data: FeedRevealedData) => {
      setFeedReveal(data);
    });

    socket.on('error_message', ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    // Register this client as Host
    multiplayerSocket.joinAsHost(roomId, hostId);

    return () => {
      // socket disconnect managed globally
    };
  }, [roomId, hostId]);

  // Sync video on feed change
  useEffect(() => {
    if (tableState?.status === 'playing' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [tableState?.status, tableState?.currentFeedIndex]);

  const handleStartGame = () => {
    multiplayerSocket.hostStartGame(roomId);
  };

  const handleAddBots = () => {
    multiplayerSocket.addBots(roomId);
  };

  const handleResetTable = () => {
    multiplayerSocket.resetTable(roomId);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(tableState?.roomCode || roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyPlayerInvite = () => {
    const inviteUrl = `${window.location.origin}/?room=${tableState?.roomCode || roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const players = tableState?.players || [];
  const readyCount = players.filter((p) => p.isReady).length;
  const occupiedCount = players.length;

  const currentFeedIndex = tableState?.currentFeedIndex ?? 0;
  const totalFeeds = tableState?.totalFeeds || 15;
  const isVideoRound = currentFeedIndex >= 10;
  const challengeDuration = isVideoRound ? 45 : 30;

  // Active Multiplier calculation based on elapsed time
  const elapsed = Math.max(0, challengeDuration - countdown);
  let liveMultiplier = 1;
  let nextThresholdSecs = 0;

  if (isVideoRound) {
    if (elapsed <= 20) {
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
    if (elapsed <= 10) {
      liveMultiplier = 3;
      nextThresholdSecs = 10 - elapsed;
    } else if (elapsed <= 20) {
      liveMultiplier = 2;
      nextThresholdSecs = 20 - elapsed;
    } else {
      liveMultiplier = 1;
      nextThresholdSecs = 0;
    }
  }

  // Helper to get player in seat
  const getPlayerInSeat = (seatNum: number): PlayerSeat | undefined => {
    return players.find((p) => p.seatNumber === seatNum);
  };

  // Compact Player Seat Pod
  const renderSeatPod = (seatNum: number) => {
    const seatPlayer = getPlayerInSeat(seatNum);
    const isReady = Boolean(seatPlayer?.isReady);

    return (
      <div 
        key={seatNum}
        className={`relative z-20 flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 select-none shadow-md ${
          seatPlayer
            ? 'bg-[#0E121B]/95 border-[#2A3448]'
            : 'bg-[#080B10]/80 border-dashed border-[#1E2536] opacity-70'
        }`}
        style={{ minWidth: '140px', maxWidth: '180px' }}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181F2E] text-slate-400 border border-[#2B354D]">
            SEAT {seatNum}
          </span>
          {seatPlayer && (
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isReady
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {isReady ? 'READY ✓' : 'NOT READY'}
            </span>
          )}
        </div>

        {seatPlayer ? (
          <div>
            <div className="text-xs font-display font-black text-white truncate flex items-center gap-1 mb-0.5">
              <span className="truncate">{seatPlayer.username}</span>
              {seatPlayer.playerId.startsWith('bot-') && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  BOT
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-[#1C2333]">
              <span className="font-black text-amber-400">
                ${seatPlayer.chips}
              </span>
              <span className="text-[10px] text-slate-400">
                {tableState?.status === 'betting' ? (
                  seatPlayer.betAmount > 0 ? (
                    <strong className="text-white">Bet: ${seatPlayer.betAmount}</strong>
                  ) : (
                    <span className="text-slate-500">Choosing...</span>
                  )
                ) : tableState?.status === 'playing' ? (
                  seatPlayer.answerStatus === 'answered' ? (
                    <span className="text-emerald-400 font-bold">LOCKED ✓</span>
                  ) : (
                    <span className="text-slate-500 animate-pulse">THINKING</span>
                  )
                ) : (
                  <span className="text-slate-500 uppercase">{seatPlayer.betStatus}</span>
                )}
              </span>
            </div>

            {/* Instant Seat Chip Delta during reveal */}
            {seatPlayer.lastDelta !== undefined && (
              <div className={`mt-1 py-0.5 px-1.5 rounded text-[10px] font-mono font-black text-center ${
                seatPlayer.lastDelta >= 0
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
              }`}>
                {seatPlayer.lastDelta >= 0 ? `+$${seatPlayer.lastDelta}` : `-$${Math.abs(seatPlayer.lastDelta)}`}
                {seatPlayer.lastMultiplier && seatPlayer.lastMultiplier > 1 && seatPlayer.lastDelta > 0 && (
                  <span className="ml-1 text-amber-300">⚡{seatPlayer.lastMultiplier}x</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 text-center text-slate-600 font-mono text-xs">
            Vacant
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-amber-500 selection:text-black antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SEPARATE HOST CONTROLLER AREA */}
        <div className="bg-[#10131B] border border-[#232B3E] rounded-3xl p-5 mb-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest font-black">
                  Pit Boss Terminal
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  HOST CONTROLLER
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                Round 1 Multiplayer Control
              </h1>
            </div>
          </div>

          {/* Room ID, Player Count & Ready status */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-[#171D2A] border border-[#2B354D] px-3 py-1.5 rounded-xl font-mono text-xs">
              <span className="text-slate-400 uppercase text-[10px]">Room:</span>
              <strong className="text-white text-xs tracking-wider uppercase">
                {tableState?.roomCode || roomId}
              </strong>
              <button
                onClick={copyRoomCode}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Copy Room Code"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            <button
              onClick={copyPlayerInvite}
              className="px-3 py-1.5 bg-[#171D2A] hover:bg-[#202738] border border-[#2B354D] text-slate-300 hover:text-white rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Copy URL for Players"
            >
              <ExternalLink size={13} className="text-blue-400" />
              <span>Copy Player Link</span>
            </button>

            {/* Mobile Standings Trigger */}
            <button
              onClick={() => setShowMobileLeaderboard(true)}
              className="lg:hidden px-3 py-1.5 bg-[#171D2A] hover:bg-[#202738] border border-amber-400/40 text-amber-400 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="View Live Standings"
            >
              <Trophy size={13} />
              <span>Standings ({occupiedCount})</span>
            </button>

            <div className="px-3 py-1.5 bg-[#171D2A] border border-[#2B354D] rounded-xl font-mono text-xs">
              <span className="text-slate-400 text-[10px] uppercase">Players: </span>
              <strong className="text-amber-400">{occupiedCount}/6</strong>
              <span className="text-slate-500 ml-1.5">({readyCount} Ready)</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171D2A] border border-[#2B354D] rounded-xl font-mono text-xs">
              <Clock size={14} className={countdown <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
              <strong className={`text-xs ${countdown <= 10 ? 'text-rose-400 font-black' : 'text-white'}`}>
                {countdown}s
              </strong>
            </div>
          </div>
        </div>

        {/* HOST ACTION BAR */}
        <div className="bg-[#0E121B] border border-[#1E2536] rounded-2xl px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>Host Role:</strong> You manage the table and start games. You have NO seat, NO chips, and do NOT bet.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {tableState?.status === 'waiting' && (
              <>
                <button
                  onClick={handleAddBots}
                  className="px-3.5 py-1.5 bg-[#171D2B] hover:bg-[#21293B] border border-[#2A354A] text-slate-200 hover:text-white rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Fill vacant seats up to 6 with automated AI Bots"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Fill with Bots</span>
                </button>

                <button
                  onClick={handleStartGame}
                  disabled={occupiedCount === 0}
                  className="px-5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play size={13} />
                  <span>START GAME</span>
                </button>
              </>
            )}

            <button
              onClick={handleResetTable}
              className="px-3 py-1.5 bg-[#141822] hover:bg-[#1E2433] border border-[#252D3F] text-slate-400 hover:text-rose-400 rounded-xl font-mono text-xs transition-all cursor-pointer flex items-center gap-1"
              title="Reset table state to initial waiting lobby"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* MAIN ARENA LAYOUT: 3D Table on Left, Live Leaderboard on Right */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* 3D Table Area */}
          <div className="flex-1 w-full min-w-0">
            {/* 3D TABLE AS MAIN ENVIRONMENT WITH 6 PERIMETER SEATS (No Host Seat) */}
            <div className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] rounded-3xl overflow-hidden border border-[#1E2535] bg-[#07090E] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between p-4 sm:p-7">
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
          <div className="relative z-20 flex items-center justify-between gap-4 w-full">
            <div>{renderSeatPod(1)}</div>
            <div>{renderSeatPod(2)}</div>
          </div>

          {/* MIDDLE ROW: PLAYER 6 (Left), CENTER STAGE, PLAYER 3 (Right) */}
          <div className="relative z-20 flex items-center justify-between gap-3 sm:gap-6 my-auto w-full">
            {/* Left: Player 6 */}
            <div className="shrink-0">{renderSeatPod(6)}</div>

            {/* CENTER TABLE STAGE */}
            <div className="flex-1 max-w-xl mx-auto flex items-center justify-center pointer-events-auto">
              {tableState?.status === 'waiting' ? (
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
                    {occupiedCount} of 6 Seats Occupied • {readyCount} Ready
                  </p>

                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={handleAddBots}
                      className="py-2 px-3.5 bg-[#171E2D] hover:bg-[#222B3E] border border-[#2D3950] text-slate-200 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Fill with Bots</span>
                    </button>

                    <button
                      onClick={handleStartGame}
                      disabled={occupiedCount === 0}
                      className="py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Play size={13} />
                      <span>START ROUND 1</span>
                    </button>
                  </div>
                </div>
              ) : tableState?.status === 'betting' ? (
                /* PER-CHALLENGE WAGER PHASE CONSOLE */
                <div className="bg-[#0B1019]/95 backdrop-blur-md border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl max-w-md w-full">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Coins size={24} />
                  </div>
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold mb-1">
                    CHALLENGE {currentFeedIndex + 1} OF {totalFeeds} • {isVideoRound ? '🎥 VIDEO ROUND' : '📸 IMAGE ROUND'}
                  </div>
                  <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                    Players Selecting Wagers
                  </h4>
                  <div className="text-3xl font-mono font-black text-amber-400">
                    {countdown}s REMAINING
                  </div>
                </div>
              ) : (tableState?.status === 'playing' || tableState?.status === 'revealing') ? (
                /* LIVE MEDIA CHALLENGE FEED (IMAGES & VIDEOS) */
                <div className="bg-[#0A0D15]/95 backdrop-blur-md border border-[#2B354D] rounded-3xl p-3 sm:p-4 shadow-2xl w-full">
                  <div className="flex justify-between items-center mb-2 px-1 text-xs font-mono">
                    <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Feed {currentFeedIndex + 1} of {totalFeeds} • {isVideoRound ? '🎥 Surveillance Video' : '📸 Intelligence Image'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {countdown}s left
                    </span>
                  </div>

                  <div className="aspect-video max-h-[340px] bg-black rounded-2xl overflow-hidden border border-[#242C3E] relative flex items-center justify-center shadow-inner mx-auto">
                    {tableState.currentVideo?.type === 'image' || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc || '') ? (
                      <img
                        key={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        src={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        alt={tableState.currentVideo?.title || 'Feed Image'}
                        className="w-full h-full object-contain select-none animate-fade-in transition-opacity duration-200"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <video
                        key={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        ref={videoRef}
                        src={tableState.currentVideo?.mediaSrc || tableState.currentVideo?.videoSrc}
                        className="w-full h-full object-contain"
                        preload="auto"
                        playsInline
                        autoPlay
                        muted
                        loop={false}
                      />
                    )}

                    {/* Speed Multiplier Badge */}
                    {tableState.status === 'playing' && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[11px] font-black uppercase flex items-center gap-1 shadow-lg border ${
                          liveMultiplier === 3
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                            : liveMultiplier === 2
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                            : 'bg-black/60 border-slate-700 text-slate-400'
                        }`}>
                          <Zap size={12} className={liveMultiplier === 3 ? 'text-amber-400' : 'text-cyan-400'} />
                          <span>{liveMultiplier}x MULTIPLIER {liveMultiplier > 1 ? `(${nextThresholdSecs}s left)` : ''}</span>
                        </div>
                      </div>
                    )}

                    {/* Reveal Overlay */}
                    {feedReveal && (
                      <div className="absolute inset-0 bg-[#090A0F]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border ${
                          feedReveal.isAI 
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        }`}>
                          {feedReveal.isAI ? <Video size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <span className="text-xs font-mono uppercase text-slate-400">Host Verified Truth:</span>
                        <h4 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider my-1">
                          {feedReveal.classification}
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0B1019]/95 backdrop-blur-md border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl max-w-md w-full">
                  <Trophy size={36} className="text-amber-400 mb-2 mx-auto" />
                  <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                    Round 1 Completed
                  </h4>
                  <button
                    onClick={handleResetTable}
                    className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile cursor-pointer"
                  >
                    Reset Table for Next Session
                  </button>
                </div>
              )}
            </div>

            {/* Right: Player 3 */}
            <div className="shrink-0">{renderSeatPod(3)}</div>
          </div>

          {/* BOTTOM ROW: PLAYER 5 (Left) & PLAYER 4 (Right) */}
          <div className="relative z-20 flex items-center justify-between gap-4 w-full">
            <div>{renderSeatPod(5)}</div>
            <div>{renderSeatPod(4)}</div>
          </div>
        </div>
      </div>

      {/* DEDICATED RIGHT-SIDE LIVE LEADERBOARD (Desktop) */}
      <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-24">
        <LiveLeaderboardSide
          players={players}
          currentFeedIndex={currentFeedIndex}
          totalFeeds={totalFeeds}
          status={tableState?.status}
        />
      </div>
    </div>

    {/* MOBILE STANDINGS DRAWER MODAL */}
    {showMobileLeaderboard && (
      <div className="fixed inset-0 z-50 bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center p-4 lg:hidden animate-fade-in">
        <div className="w-full max-w-sm">
          <LiveLeaderboardSide
            players={players}
            currentFeedIndex={currentFeedIndex}
            totalFeeds={totalFeeds}
            status={tableState?.status}
            isMobileDrawer
            onClose={() => setShowMobileLeaderboard(false)}
          />
        </div>
      </div>
    )}

    {/* SETTLEMENT TABLE & WINNERS PODIUM (When round completes) */}
    {tableState?.status === 'settled' && (
          <div className="mt-8 bg-[#10131B] border border-[#232B3E] rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={22} className="text-amber-400" />
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                Final Round Settlements & Live Leaderboard
              </h3>
            </div>

            {/* Top 3 Podium Cards */}
            {tableState.settlements && tableState.settlements.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {tableState.settlements.slice(0, 3).map((s, idx) => (
                  <div key={s.playerId} className={`p-4 rounded-2xl border text-center ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                      : idx === 1
                      ? 'bg-slate-500/10 border-slate-400 text-slate-200'
                      : 'bg-amber-800/10 border-amber-700 text-amber-600'
                  }`}>
                    <div className="font-mono text-sm font-black mb-1">
                      {idx === 0 ? '🥇 1ST PLACE' : idx === 1 ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}
                    </div>
                    <div className="text-base font-display font-black text-white truncate">
                      {s.username}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {s.score}/{totalFeeds} Correct • <strong className="text-amber-400">${s.finalChips}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#232B3E] text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Contestant</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Net Gain/Loss</th>
                    <th className="py-2.5 px-3">Final Bankroll</th>
                  </tr>
                </thead>
                <tbody>
                  {tableState.settlements.map((s, idx) => (
                    <tr key={s.playerId} className="border-b border-[#1A2030] hover:bg-[#141926]">
                      <td className="py-3 px-3 font-bold text-amber-400">#{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-300">Seat {s.seatNumber}</td>
                      <td className="py-3 px-3 font-black text-white">{s.username}</td>
                      <td className="py-3 px-3 text-slate-300">{s.score} / {totalFeeds}</td>
                      <td className={`py-3 px-3 font-bold ${s.netEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.netEarnings >= 0 ? `+$${s.netEarnings}` : `-$${Math.abs(s.netEarnings)}`}
                      </td>
                      <td className="py-3 px-3 font-black text-amber-400">${s.finalChips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
