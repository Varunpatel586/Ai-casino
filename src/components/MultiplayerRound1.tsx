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
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  multiplayerSocket, 
  TableState, 
  PlayerSeat, 
  FeedRevealedData 
} from '../services/multiplayerSocket';
import { Player, BetAmount } from '../types';

interface MultiplayerRound1Props {
  player: Player;
  onComplete: (score: number, bet: number) => void;
  roomId?: string;
}

export default function MultiplayerRound1({ player, onComplete, roomId: propRoomId }: MultiplayerRound1Props) {
  // Read room code from prop, URL query param, or default to table_01
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const roomParam = propRoomId || urlParams.get('room');
  const roomId = roomParam ? roomParam.toLowerCase().replace(/\s+/g, '-') : 'table_01';

  const [tableState, setTableState] = useState<TableState | null>(null);
  const [mySeatNumber, setMySeatNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetAmount | null>(null);
  const [myAnswer, setMyAnswer] = useState<'real' | 'ai' | null>(null);
  const [feedReveal, setFeedReveal] = useState<FeedRevealedData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(45); // Round 1 video/challenge timer: 45s
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Connect to multiplayer room
  useEffect(() => {
    const socket = multiplayerSocket.connect();

    socket.on('table_state', (state: TableState) => {
      setTableState(state);
      setCountdown(state.roundTimer);
    });

    socket.on('seat_assigned', ({ seatNumber, playerId }) => {
      if (playerId === player.id) {
        setMySeatNumber(seatNumber);
      }
    });

    socket.on('timer_tick', ({ secondsLeft }) => {
      setCountdown(secondsLeft);
    });

    socket.on('feed_started', () => {
      setMyAnswer(null);
      setFeedReveal(null);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
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

    // Join room as player
    multiplayerSocket.joinTable(roomId, player.id, player.username, player.chips);

    return () => {
      // socket disconnect managed globally
    };
  }, [roomId, player.id, player.username, player.chips]);

  // Video playback sync
  useEffect(() => {
    if (tableState?.status === 'playing' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [tableState?.status, tableState?.currentFeedIndex]);

  const mySeat = tableState?.players.find((p) => p.playerId === player.id);
  const isMyBetPlaced = mySeat?.betStatus === 'placed' || mySeat?.betStatus === 'locked';

  const handleToggleReady = () => {
    if (!mySeat) return;
    const newReady = !mySeat.isReady;
    multiplayerSocket.toggleReady(roomId, player.id, newReady);
  };

  const handlePlaceBet = (amount: BetAmount) => {
    setSelectedBet(amount);
    const numericBet = amount === 'ALL_IN' ? player.chips : amount;
    multiplayerSocket.placeBet(roomId, player.id, numericBet);
  };

  const handleSelectAnswer = (answer: 'real' | 'ai') => {
    if (myAnswer !== null || tableState?.status !== 'playing') return;
    setMyAnswer(answer);
    multiplayerSocket.submitAnswer(roomId, player.id, tableState.currentFeedIndex, answer);
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
      multiplayerSocket.joinTable(roomId, player.id, player.username, player.chips);
    }, 250);
  };

  const handleFinalizeAndProceed = () => {
    if (!tableState?.settlements) return;
    const mySettlement = tableState.settlements.find((s) => s.playerId === player.id);
    const score = mySettlement ? mySettlement.score : 0;
    const bet = mySettlement ? mySettlement.betAmount : (mySeat?.betAmount || 10);
    onComplete(score, bet);
  };

  // Helper to get player in seat 1..6
  const getPlayerInSeat = (seatNum: number): PlayerSeat | undefined => {
    return tableState?.players.find((p) => p.seatNumber === seatNum);
  };

  const readyCount = tableState?.players.filter((p) => p.isReady).length || 0;
  const totalOccupied = tableState?.players.length || 0;

  // Compact Player Seat Pod (No large rectangular cards)
  const renderSeatPod = (seatNum: number) => {
    const seatPlayer = getPlayerInSeat(seatNum);
    const isMe = seatPlayer?.playerId === player.id;
    const isReady = Boolean(seatPlayer?.isReady);

    return (
      <div 
        key={seatNum}
        className={`relative z-20 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200 select-none shadow-md ${
          isMe
            ? 'bg-[#151C2C]/95 border-amber-400 ring-1 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
            : seatPlayer
            ? 'bg-[#0E121B]/90 border-[#263045]'
            : 'bg-[#0A0D14]/80 border-dashed border-[#202738] opacity-75'
        }`}
        style={{ minWidth: '135px', maxWidth: '175px' }}
      >
        {/* Seat Number Tag */}
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
          isMe ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#181F2E] text-slate-400 border border-[#2B354D]'
        }`}>
          S{seatNum}
        </span>

        {/* Player Moniker & Ready Status */}
        <div className="flex-1 min-w-0">
          {seatPlayer ? (
            <>
              <div className="text-xs font-display font-black text-white truncate flex items-center gap-1">
                <span className="truncate">{seatPlayer.username}</span>
                {isMe && <span className="text-[9px] text-amber-400 font-mono">★</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`} />
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                  isReady ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {isReady ? 'READY' : 'NOT READY'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-slate-500 font-mono text-[11px]">
              {tableState?.status === 'waiting' && !mySeat ? (
                <button
                  onClick={() => handleSelectSeat(seatNum)}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  + Sit Here
                </button>
              ) : (
                <span>Vacant</span>
              )}
            </div>
          )}
        </div>

        {/* Online Indicator Dot */}
        {seatPlayer && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            seatPlayer.connected ? 'bg-emerald-400' : 'bg-rose-500'
          }`} title={seatPlayer.connected ? 'Connected' : 'Disconnected'} />
        )}
      </div>
    );
  };

  if (!tableState) {
    return (
      <div className="min-h-screen casino-table-bg flex items-center justify-center p-6 pt-24 text-slate-100">
        <div className="max-w-md w-full bg-[#12151E] border border-[#2B354D] rounded-3xl p-8 shadow-2xl text-center">
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

  return (
    <div className="min-h-screen casino-table-bg text-slate-100 p-3 sm:p-6 pt-20 pb-36">
      <div className="max-w-6xl mx-auto">
        {/* Top Notification Bar */}
        {errorMessage && (
          <div className="mb-4 bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2 animate-bounce">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header HUD */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-[#12151E] border border-[#232938] rounded-2xl px-6 py-3.5 mb-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Video size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-blue-400 tracking-widest font-bold">
                  Event I • Real vs AI
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <Users size={10} />
                  <span>Room: {tableState.roomCode || roomId}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {readyCount}/{totalOccupied} Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                The Reality Bet (6-Player Table)
              </h2>
            </div>
          </div>

          {/* Table Room Controls / Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`/host?room=${roomId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#181D2A] hover:bg-[#202738] border border-[#2D374D] text-amber-400 hover:text-amber-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Open the Host Controller in a new window"
            >
              <ExternalLink size={13} />
              <span>Host Controller View</span>
            </a>

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

        {/* 3D TABLE AS MAIN ENVIRONMENT WITH NATURAL PERIMETER SEATS */}
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

          {/* MIDDLE ROW: PLAYER 6 (Left), CENTER STAGE (Covers 'WHITE BLACKJACK'), PLAYER 3 (Right) */}
          <div className="relative z-20 flex items-center justify-between gap-3 sm:gap-6 my-auto w-full">
            {/* Left: Player 6 */}
            <div className="shrink-0">{renderSeatPod(6)}</div>

            {/* CENTER TABLE STAGE: Naturally conceals 'WHITE BLACKJACK' */}
            <div className="flex-1 max-w-xl mx-auto flex items-center justify-center pointer-events-auto">
              {tableState.status === 'waiting' ? (
                /* LOBBY FELT CREST: Seamless felt emblem concealing 'WHITE BLACKJACK' text naturally */
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
                /* WAGER PHASE CONSOLE */
                <div className="bg-[#0B1019]/95 backdrop-blur-md border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl max-w-md w-full">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Coins size={24} />
                  </div>
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold mb-1">
                    WAGER PLACEMENT PHASE
                  </div>
                  <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                    Place Your Wager Below
                  </h4>
                  <div className="text-3xl font-mono font-black text-amber-400">
                    {countdown}s REMAINING
                  </div>
                </div>
              ) : (tableState.status === 'playing' || tableState.status === 'revealing') ? (
                /* LIVE VIDEO SURVEILLANCE FEED (45S TIMER) */
                <div className="bg-[#0A0D15]/95 backdrop-blur-md border border-[#2B354D] rounded-3xl p-3 sm:p-4 shadow-2xl w-full">
                  <div className="flex justify-between items-center mb-2 px-1 text-xs font-mono">
                    <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Feed {(tableState.currentFeedIndex ?? 0) + 1} of 5 • {tableState.currentVideo?.title}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {countdown}s
                    </span>
                  </div>

                  <div className="aspect-video max-h-[340px] bg-black rounded-2xl overflow-hidden border border-[#242C3E] relative flex items-center justify-center shadow-inner mx-auto">
                    <video
                      ref={videoRef}
                      src={tableState.currentVideo?.videoSrc}
                      className="w-full h-full object-contain"
                      playsInline
                      autoPlay
                      muted
                      loop={false}
                      onPlay={() => setIsPlayingVideo(true)}
                      onPause={() => setIsPlayingVideo(false)}
                      onEnded={() => setIsPlayingVideo(false)}
                    />

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
                        <span className="text-xs font-mono uppercase text-slate-400">Verified Reality Truth:</span>
                        <h4 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider my-1">
                          {feedReveal.classification}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1.5 justify-center max-w-sm">
                          {feedReveal.playerResults.map((pr) => (
                            <span 
                              key={pr.playerId}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                                pr.isCorrect 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                              }`}
                            >
                              S{pr.seatNumber}: {pr.answer.toUpperCase()} {pr.isCorrect ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono text-center mt-1.5">
                    {isPlayingVideo ? '▶ Synchronized stream (45s challenge)' : 'Feed paused • Select classification below'}
                  </p>
                </div>
              ) : (
                /* ROUND 1 COMPLETED */
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
          <div className="relative z-20 flex items-center justify-between gap-4 w-full">
            <div>{renderSeatPod(5)}</div>
            <div>{renderSeatPod(4)}</div>
          </div>
        </div>

        {/* SETTLEMENT MODAL (When round completes) */}
        {tableState?.status === 'settled' && (
          <div className="fixed inset-0 z-50 bg-[#090A0F]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-[#12151E] border border-[#2B354D] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} />
              </div>

              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
                Round 1 Settlement Completed
              </div>
              <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-6">
                Table Reality Ledger
              </h3>

              {/* Table Scores */}
              <div className="space-y-2 mb-6">
                {tableState.settlements.map((s, idx) => {
                  const isMe = s.playerId === player.id;
                  const isPositive = s.netEarnings >= 0;

                  return (
                    <div 
                      key={s.playerId}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-mono ${
                        isMe 
                          ? 'bg-[#181E2E] border-amber-400/60 ring-1 ring-amber-400/30' 
                          : 'bg-[#181D2A] border-[#252C3E]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <div className="text-left">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{s.username}</span>
                            {isMe && <span className="text-[10px] text-amber-400 font-mono">(YOU)</span>}
                          </div>
                          <span className="text-[10px] text-slate-500">Seat {s.seatNumber} • Bet: ${s.betAmount}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-bold text-slate-300">{s.score} / 5 Correct</div>
                          <div className={`font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? `+$${s.netEarnings}` : `-$${Math.abs(s.netEarnings)}`}
                          </div>
                        </div>
                        <div className="border-l border-[#2B354D] pl-4">
                          <div className="text-[10px] text-slate-500 uppercase">Bankroll</div>
                          <div className="font-black text-amber-400 text-sm">${s.finalChips}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleFinalizeAndProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>CONTINUE TO BONUS INTERMISSION</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIVE PLAYER ACTION DOCK */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1119]/95 backdrop-blur-md border-t border-[#232938] p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
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
                  Wallet: <span className="font-black text-amber-400">${player.chips.toLocaleString()}</span>
                  {mySeat?.betAmount ? (
                    <span className="text-slate-400 ml-2">| Bet: <strong className="text-white">${mySeat.betAmount}</strong></span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ACTION CONTROLS */}
            {tableState?.status === 'betting' ? (
              /* BETTING CONTROLS */
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold hidden sm:inline">
                  Select Wager:
                </span>
                {([10, 30, 'ALL_IN'] as BetAmount[]).map((amount) => {
                  const betVal: number = amount === 'ALL_IN' ? player.chips : amount;
                  const canAfford: boolean = player.chips >= betVal;
                  const isSelected: boolean = selectedBet === amount || mySeat?.betAmount === betVal;

                  return (
                    <button
                      key={amount}
                      onClick={() => handlePlaceBet(amount)}
                      disabled={!canAfford || isMyBetPlaced}
                      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all duration-150 cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-tactile'
                          : canAfford && !isMyBetPlaced
                          ? 'bg-[#181D2A] text-slate-200 border-[#2E374D] hover:border-amber-400/60'
                          : 'bg-[#10131B] text-slate-600 border-[#1C2230] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {amount === 'ALL_IN' ? `ALL-IN ($${betVal})` : `$${amount}`}
                    </button>
                  );
                })}
              </div>
            ) : tableState?.status === 'playing' ? (
              /* CLASSIFICATION ANSWER BUTTONS */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSelectAnswer('real')}
                  disabled={myAnswer !== null || !!feedReveal}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-2 ${
                    myAnswer === 'real'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-tactile'
                      : myAnswer === null && !feedReveal
                      ? 'bg-gradient-to-b from-[#163826] to-[#0D2418] hover:from-[#1E4D34] hover:to-[#123322] border-emerald-500/40 text-emerald-300'
                      : 'bg-[#10131B] border-[#1C2230] text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>REAL LIFE</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('ai')}
                  disabled={myAnswer !== null || !!feedReveal}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-2 ${
                    myAnswer === 'ai'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-tactile'
                      : myAnswer === null && !feedReveal
                      ? 'bg-gradient-to-b from-[#3D141E] to-[#260B12] hover:from-[#521B29] hover:to-[#330F19] border-rose-500/40 text-rose-300'
                      : 'bg-[#10131B] border-[#1C2230] text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Video size={18} />
                  <span>AI GENERATED</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs font-mono text-slate-400">
                  {tableState.status === 'waiting'
                    ? (mySeat ? `Seated at S${mySeatNumber} • ${mySeat.isReady ? 'Ready for Host' : 'Set Ready'}` : 'Click any vacant seat above')
                    : 'Settling table results...'}
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
