import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  TableSummary,
  PlayerSeat,
  FeedRevealedData
} from '../services/multiplayerSocket';
import LiveLeaderboardSide from '../components/LiveLeaderboardSide';

export default function HostRound1Controller() {
  // ?room=table_02 only SELECTS which table is active — it never filters
  // which tables appear in the Tables bar (that list always comes from
  // socket `tables_list` + REST /api/round1/tables).
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room');
  const requestedRoom = roomParam ? roomParam.toLowerCase().replace(/\s+/g, '-') : 'table_01';
  const [roomId, setRoomId] = useState<string>(requestedRoom);
  const [tables, setTables] = useState<TableSummary[]>([]);
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
  const roomIdRef = useRef<string>(requestedRoom);

  // Connect socket as Host
  useEffect(() => {
    console.log('[HostRound1] Connecting as host to room:', roomIdRef.current, 'hostId:', hostId);
    const socket = multiplayerSocket.connect();

    const handleTableState = (state: TableState) => {
      // Only render the selected table; ignore sibling overflow tables.
      if (state.roomId && state.roomId !== roomIdRef.current) return;
      console.log('[HostRound1] table_state received: status=', state.status, 'feed=', state.currentFeedIndex, 'players=', state.players.length);
      setTableState(state);
      setCountdown(state.roundTimer);
    };

    const mergeTables = (list: TableSummary[]) => {
      if (!Array.isArray(list) || list.length === 0) return;
      setTables((prev) => {
        // Union socket + REST so no table ever disappears from the bar.
        const byId = new Map(prev.map((t) => [t.room_id, t]));
        for (const t of list) byId.set(t.room_id, t);
        return [...byId.values()].sort((a, b) => a.room_id.localeCompare(b.room_id));
      });
    };

    const handleTablesList = ({ tables: list }: { tables: TableSummary[] }) => {
      mergeTables(list || []);
    };

    // REST fallback: merged SQLite + Supabase mirror (survives restarts).
    const refreshTablesRest = () => {
      multiplayerSocket.fetchTablesRest().then((data) => {
        if (data?.tables) mergeTables(data.tables);
      });
    };

    const handleTimerTick = ({ secondsLeft, roomId: tickRoom }: { secondsLeft: number; roomId?: string }) => {
      if (tickRoom && tickRoom !== roomIdRef.current) return;
      setCountdown(secondsLeft);
    };

    const handleWagerStarted = (data?: { duration?: number; roomId?: string }) => {
      if (data?.roomId && data.roomId !== roomIdRef.current) return;
      console.log('[HostRound1] wager_phase_started - duration:', data?.duration);
      setFeedReveal(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
    };

    const handleFeedStarted = (data?: { duration?: number; roomId?: string }) => {
      if (data?.roomId && data.roomId !== roomIdRef.current) return;
      console.log('[HostRound1] feed_started - duration:', data?.duration);
      setFeedReveal(null);
      if (data?.duration) {
        setCountdown(data.duration);
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    };

    const handleFeedRevealed = (data: FeedRevealedData & { roomId?: string }) => {
      if (data?.roomId && (data.roomId as string) !== roomIdRef.current) return;
      console.log('[HostRound1] feed_revealed - isAI:', data.isAI, 'results:', data.playerResults.length);
      setFeedReveal(data);
    };

    const handleErrorMessage = ({ message }: { message: string }) => {
      console.warn('[HostRound1] error_message:', message);
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    };

    const handleConnect = () => {
      console.log('[HostRound1] Socket connected, joining as host...');
      multiplayerSocket.joinAsHost(roomIdRef.current, hostId);
      multiplayerSocket.hostGetTables();
      // Also REST-refresh on reconnect so host always sees accurate table counts.
      refreshTablesRest();
    };

    const handleDisconnect = (reason: string) => {
      console.warn('[HostRound1] Socket disconnected:', reason);
    };

    socket.on('table_state', handleTableState);
    socket.on('tables_list', handleTablesList);
    socket.on('timer_tick', handleTimerTick);
    socket.on('wager_phase_started', handleWagerStarted);
    socket.on('feed_started', handleFeedStarted);
    socket.on('feed_revealed', handleFeedRevealed);
    socket.on('error_message', handleErrorMessage);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Register this client as Host (in case already connected)
    refreshTablesRest(); // immediate REST fetch so ALL tables render instantly
    if (socket.connected) {
      multiplayerSocket.joinAsHost(roomIdRef.current, hostId);
      multiplayerSocket.hostGetTables();
    } else {
      // Poll briefly until connected so the tables list still loads.
      const poll = setInterval(() => {
        if (socket.connected) {
          multiplayerSocket.joinAsHost(roomIdRef.current, hostId);
          multiplayerSocket.hostGetTables();
          clearInterval(poll);
        }
      }, 500);
      setTimeout(() => clearInterval(poll), 5000);
    }

    const tablesPoll = setInterval(() => {
      multiplayerSocket.hostGetTables();
      refreshTablesRest();
    }, 2000);

    // FIX BUG-012: Remove all listeners on cleanup to prevent accumulation
    return () => {
      console.log('[HostRound1] Cleaning up socket listeners');
      clearInterval(tablesPoll);
      socket.off('table_state', handleTableState);
      socket.off('tables_list', handleTablesList);
      socket.off('timer_tick', handleTimerTick);
      socket.off('wager_phase_started', handleWagerStarted);
      socket.off('feed_started', handleFeedStarted);
      socket.off('feed_revealed', handleFeedRevealed);
      socket.off('error_message', handleErrorMessage);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [hostId]);


  // Sync video on feed change
  useEffect(() => {
    if (tableState?.status === 'playing' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [tableState?.status, tableState?.currentFeedIndex]);

  const switchTable = (nextRoom: string) => {
    const clean = nextRoom.toLowerCase().replace(/\s+/g, '-');
    roomIdRef.current = clean;
    setRoomId(clean);
    setTableState(null);
    setFeedReveal(null);
    multiplayerSocket.joinAsHost(clean, hostId);
    multiplayerSocket.hostGetTables();
    multiplayerSocket.fetchTablesRest().then((data) => {
      if (data?.tables) setTables((prev) => {
        const byId = new Map(prev.map((t) => [t.room_id, t]));
        for (const t of data.tables) byId.set(t.room_id, t);
        return [...byId.values()].sort((a, b) => a.room_id.localeCompare(b.room_id));
      });
    });
    // Update ?room= via React Router so router state stays in sync.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('room', clean);
      return next;
    }, { replace: true });
  };

  // Sync when ?room= changes externally (browser back/forward, links, etc.)
  useEffect(() => {
    if (!roomParam) return;
    const clean = roomParam.toLowerCase().replace(/\s+/g, '-');
    if (clean === roomIdRef.current) return;
    roomIdRef.current = clean;
    setRoomId(clean);
    setTableState(null);
    setFeedReveal(null);
    multiplayerSocket.joinAsHost(clean, hostId);
    multiplayerSocket.hostGetTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomParam]);

  const handleStartGame = () => {
    multiplayerSocket.hostStartGame(roomIdRef.current);
  };

  const handleAddBots = () => {
    multiplayerSocket.addBots(roomIdRef.current);
  };

  const handleResetTable = () => {
    multiplayerSocket.resetTable(roomIdRef.current);
  };

  const [skipConfirm, setSkipConfirm] = useState(false);
  const handleSkipToRound2 = () => {
    if (!skipConfirm) {
      setSkipConfirm(true);
      setTimeout(() => setSkipConfirm(false), 4000);
      return;
    }
    setSkipConfirm(false);
    multiplayerSocket.skipToRound2(roomIdRef.current);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(tableState?.roomCode || roomIdRef.current);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyPlayerInvite = () => {
    const inviteUrl = `${window.location.origin}/?room=${tableState?.roomCode || roomIdRef.current}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const players = tableState?.players || [];
  const readyCount = players.filter((p) => p.isReady).length;
  const occupiedCount = players.length;

  // Tables bar IDs: ALWAYS show the default pair (table_01, table_02) plus
  // every server-reported table plus the currently active one — regardless of
  // what ?room= says in the URL. The URL only selects the ACTIVE table.
  const tableIds: string[] = (() => {
    // Always seed at least table_01, table_02, table_03 in the bar.
    // Additional tables come from server reports and the active roomId.
    const ids = new Set<string>(['table_01', 'table_02', 'table_03']);
    for (const t of tables) ids.add(t.room_id);
    ids.add(roomId); // brand-new table (e.g. "+ New Table") before server reports it
    return [...ids].sort();
  })();

  const currentFeedIndex = tableState?.currentFeedIndex ?? 0;
  const isVideoRound = tableState?.currentVideo?.type === 'video' || currentFeedIndex >= 5;
  const totalFeeds = tableState?.totalFeeds || 10;
  // Round 1 timer: ~30s per challenge (images and videos).
  const challengeDuration = 30;

  // Active Multiplier calculation based on elapsed time (30s rounds):
  // <=5s -> 5x, <=10s -> 4x, <=15s -> 3x, <=20s -> 2x, >20s -> 1x
  const elapsed = Math.max(0, challengeDuration - countdown);
  let liveMultiplier = 1;
  let nextThresholdSecs = 0;

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
                  ) : seatPlayer.chips <= 0 ? (
                    <span className="text-cyan-400 font-bold">Watching</span>
                  ) : (
                    <span className="text-slate-500">Choosing...</span>
                  )
                ) : tableState?.status === 'playing' ? (
                  seatPlayer.answerStatus === 'answered' ? (
                    <span className="text-emerald-400 font-bold">LOCKED ✓</span>
                  ) : seatPlayer.chips <= 0 ? (
                    <span className="text-cyan-400">WATCHING</span>
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
              <div className={`mt-1 py-0.5 px-1.5 rounded text-[10px] font-sans font-bold text-center ${
                seatPlayer.lastDelta > 0
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : seatPlayer.lastDelta < 0
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400'
              }`}>
                <span>{seatPlayer.lastDelta > 0 ? `+$${seatPlayer.lastDelta}` : seatPlayer.lastDelta < 0 ? `-$${Math.abs(seatPlayer.lastDelta)}` : '$0 (Watching)'}</span>
                {(seatPlayer.lastMultiplier ?? 0) > 1 && seatPlayer.lastDelta > 0 ? (
                  <span className="ml-1 text-amber-300">⚡{seatPlayer.lastMultiplier}x</span>
                ) : null}
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
    <div className="w-full h-full flex-1 min-h-0 overflow-y-auto bg-[#07090E] text-slate-100 font-sans selection:bg-amber-500 selection:text-black antialiased p-3 sm:p-4">
      <div className="max-w-[1440px] mx-auto">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SEPARATE HOST CONTROLLER AREA */}
        <div className="bg-[#10131B] border border-[#232B3E] rounded-2xl p-3 sm:p-4 mb-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
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

        {/* MULTI-TABLE SELECTOR (6 seats per table, overflow → table_02, table_03, ...) */}
        <div className="bg-[#0E121B] border border-[#1E2536] rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Tables:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {tableIds.map((tableId) => {
              const summary = tables.find((t) => t.room_id === tableId);
              // Use occupied_seats (total players) not active_seats — active_seats drops to 0
              // when players temporarily disconnect mid-game, making a full table look empty.
              const occ = summary
                ? summary.occupied_seats
                : (tableId === roomId ? occupiedCount : 0);
              const isFull = occ >= 6;
              const isActive = tableId === roomId;
              const statusLabel = summary ? `${summary.status}${summary.exists === false ? ' • new' : ''}` : 'Current table';
              return (
                <button
                  key={tableId}
                  onClick={() => switchTable(tableId)}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-tactile'
                      : isFull
                      ? 'bg-[#2A1418] border-rose-500/50 text-rose-300 hover:border-rose-400'
                      : 'bg-[#171D2A] border-[#2B354D] text-slate-300 hover:border-amber-400/60 hover:text-white'
                  }`}
                  title={`${statusLabel} • feed ${summary?.current_feed_index ?? 0} • click to manage`}
                >
                  {tableId.replace(/_/g, ' ').toUpperCase()} ({occ}/6)
                </button>
              );
            })}
            <button
              onClick={() => {
                const existingNums = tableIds.map((id) => {
                  const m = id.match(/(\d+)$/);
                  return m ? parseInt(m[1], 10) : 0;
                });
                const nextNum = existingNums.length > 0 ? Math.max(...existingNums, 1) + 1 : 2;
                switchTable(`table_${String(nextNum).padStart(2, '0')}`);
              }}
              className="px-2.5 py-1 rounded-lg border border-dashed border-[#2B354D] text-slate-400 hover:text-amber-400 hover:border-amber-400/60 font-mono text-[11px] font-bold transition-all cursor-pointer"
              title="Open a new empty table"
            >
              + New Table
            </button>
          </div>
          <span className="text-slate-500 text-[10px] ml-auto">
            6 seats per table • extra players auto-seat to the next table
          </span>
        </div>

        {/* HOST ACTION BAR */}
        <div className="bg-[#0E121B] border border-[#1E2536] rounded-xl px-4 py-2 mb-3 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
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

            {/* Skip this table's players straight to Round 2 */}
            <button
              onClick={handleSkipToRound2}
              disabled={occupiedCount === 0}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                skipConfirm
                  ? 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400 shadow-tactile'
                  : 'bg-[#14202E] hover:bg-[#1B2C3E] border-sky-500/50 text-sky-300 hover:text-sky-200'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={`Push all ${occupiedCount} player(s) in ${roomId} straight to Round 2`}
            >
              <Zap size={13} />
              <span>{skipConfirm ? `CONFIRM SKIP ${roomId.toUpperCase()} → ROUND 2?` : `SKIP ${roomId.toUpperCase()} → ROUND 2`}</span>
            </button>

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
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* 3D Table Area */}
          <div className="flex-1 w-full min-w-0">
            {/* 3D TABLE AS MAIN ENVIRONMENT WITH 6 PERIMETER SEATS (No Host Seat) */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#1E2535] bg-[#07090E] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between p-3 sm:p-5" style={{minHeight: '380px', maxHeight: 'calc(100vh - 230px)'}}>
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
                          liveMultiplier >= 4
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                            : liveMultiplier >= 2
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                            : 'bg-black/60 border-slate-700 text-slate-400'
                        }`}>
                          <Zap size={12} className={liveMultiplier >= 4 ? 'text-amber-400' : liveMultiplier >= 2 ? 'text-cyan-400' : 'text-slate-400'} />
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
      <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-4">
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
