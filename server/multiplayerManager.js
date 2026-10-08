import db, { MAX_TABLE_SEATS } from './db.js';

// Maximum players per Round 1 table — 6 seats; overflow auto-creates table_02, table_03, ...
export const MAX_PLAYERS_PER_TABLE = MAX_TABLE_SEATS || 6;

// Phase timers (seconds). Round 1: ~30s per challenge (images and videos).
// Wager window stays short (15s) so lobbies move fast; feed display is 30s.
export const WAGER_DURATION = 15;
export const FEED_DURATION = 30;
export const IMAGE_FEED_DURATION = 30;
export const VIDEO_FEED_DURATION = 30;

// Master Pool of 10 Visual Challenges (Exact labels & classification logic preserved)
export const allRound1Images = [
  { id: 1, title: 'Visual Challenge 1', type: 'image', isAI: false, mediaSrc: '/images/round1/img1.jpg', videoSrc: '/images/round1/img1.jpg' },
  { id: 2, title: 'Visual Challenge 2', type: 'image', isAI: true, mediaSrc: '/images/round1/img2.jpg', videoSrc: '/images/round1/img2.jpg' },
  { id: 3, title: 'Visual Challenge 3', type: 'image', isAI: false, mediaSrc: '/images/round1/img3.jpg', videoSrc: '/images/round1/img3.jpg' },
  { id: 4, title: 'Visual Challenge 4', type: 'image', isAI: false, mediaSrc: '/images/round1/img4.jpg', videoSrc: '/images/round1/img4.jpg' },
  { id: 5, title: 'Visual Challenge 5', type: 'image', isAI: true, mediaSrc: '/images/round1/img5.jpg', videoSrc: '/images/round1/img5.jpg' },
  { id: 6, title: 'Visual Challenge 6', type: 'image', isAI: true, mediaSrc: '/images/round1/img6.jpg', videoSrc: '/images/round1/img6.jpg' },
  { id: 7, title: 'Visual Challenge 7', type: 'image', isAI: false, mediaSrc: '/images/round1/img7.jpg', videoSrc: '/images/round1/img7.jpg' },
  { id: 8, title: 'Visual Challenge 8', type: 'image', isAI: true, mediaSrc: '/images/round1/img8.jpg', videoSrc: '/images/round1/img8.jpg' },
  { id: 9, title: 'Visual Challenge 9', type: 'image', isAI: false, mediaSrc: '/images/round1/img9.jpg', videoSrc: '/images/round1/img9.jpg' },
  { id: 10, title: 'Visual Challenge 10', type: 'image', isAI: true, mediaSrc: '/images/round1/img10.jpg', videoSrc: '/images/round1/img10.jpg' },
];

// Master Pool of 5 Video Surveillance Challenges
export const allRound1Videos = [
  { id: 11, title: 'Video Surveillance 1', type: 'video', isAI: false, mediaSrc: '/Videos/round1/vid1.mp4', videoSrc: '/Videos/round1/vid1.mp4' },
  { id: 12, title: 'Video Surveillance 2', type: 'video', isAI: true, mediaSrc: '/Videos/round1/vid2.mp4', videoSrc: '/Videos/round1/vid2.mp4' },
  { id: 13, title: 'Video Surveillance 3', type: 'video', isAI: false, mediaSrc: '/Videos/round1/vid3.mp4', videoSrc: '/Videos/round1/vid3.mp4' },
  { id: 14, title: 'Video Surveillance 4', type: 'video', isAI: false, mediaSrc: '/Videos/round1/vid4.mp4', videoSrc: '/Videos/round1/vid4.mp4' },
  { id: 15, title: 'Video Surveillance 5', type: 'video', isAI: true, mediaSrc: '/Videos/round1/vid5.mp4', videoSrc: '/Videos/round1/vid5.mp4' },
];

/**
 * Generates a fresh round of 10 challenges:
 * - Exactly 5 distinct images chosen at random from the 10-image master pool, in randomized order
 * - Followed by the 5 surveillance videos
 * All image labels (isAI: true vs isAI: false) and media paths remain strictly preserved.
 */
export function generateRoomChallenges() {
  const pool = [...allRound1Images];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selectedImages = pool.slice(0, 5);
  return [...selectedImages, ...allRound1Videos];
}

// Fallback constant for backwards compatibility
export const roundVideos = generateRoomChallenges();

export class MultiplayerManager {
  constructor(io) {
    this.io = io.of('/round1');
    this.roomTimers = new Map(); // roomId -> { timerInterval, secondsLeft }
    this.botIntervals = new Map(); // roomId -> Array of timeouts
    this.hostSockets = new Map(); // roomId -> socket.id
    this.playerLastDeltas = new Map(); // `${roomId}:${playerId}` -> { delta, multiplier, isCorrect }
    this.roomChallenges = new Map(); // roomId -> Array of 10 challenges (5 randomized images + 5 videos)
    this.roomFeedStartTimes = new Map(); // roomId -> timestamp (ms) of feed start

    // Initialize challenges for table_01
    this.generateNewRoundChallenges('table_01');

    // Auto-recovery: If room was left in playing/betting/settled state from previous run, reset to waiting
    try {
      const room = db.getOrCreateRoom('table_01');
      if (room.status !== 'waiting') {
        console.log('[Multiplayer] Auto-resetting stale active/settled room on startup to waiting');
        db.resetRoomSession('table_01');
      }
    } catch (e) {
      console.warn('[Multiplayer] Error checking room status on boot:', e.message);
    }

    this.setupSocketEvents();
  }

  getRoomChallenges(roomId = 'table_01') {
    if (!this.roomChallenges.has(roomId)) {
      this.generateNewRoundChallenges(roomId);
    }
    return this.roomChallenges.get(roomId);
  }

  generateNewRoundChallenges(roomId = 'table_01') {
    const challenges = generateRoomChallenges();
    this.roomChallenges.set(roomId, challenges);
    console.log(
      `[Multiplayer] Fresh challenge deck generated for ${roomId} (5 randomized images + 5 videos):\n` +
      challenges.map((c, i) => `  ${i + 1}. ${c.title} (${c.type}, isAI=${c.isAI}, src=${c.mediaSrc})`).join('\n')
    );
    return challenges;
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`[Multiplayer] Socket connected: ${socket.id}`);

      // Host Events (Host has NO seat, NO chips, purely manages & views table)
      socket.on('host_join', (data) => this.handleHostJoin(socket, data));
      socket.on('host_start_game', (data) => this.handleHostStartGame(socket, data));

      // Player Events
      socket.on('join_table', (data) => this.handleJoinTable(socket, data));
      socket.on('join_table_auto', (data) => this.handleJoinTableAuto(socket, data));
      socket.on('get_tables', () => this.handleGetTables(socket));
      socket.on('toggle_ready', (data) => this.handleToggleReady(socket, data));
      socket.on('reconnect_table', (data) => this.handleReconnectTable(socket, data));
      socket.on('select_seat', (data) => this.handleSelectSeat(socket, data));
      socket.on('place_bet', (data) => this.handlePlaceBet(socket, data));
      socket.on('start_table', (data) => this.handleStartTable(socket, data));
      socket.on('quick_start', (data) => this.handleQuickStart(socket, data));
      socket.on('add_bots', (data) => this.handleAddBots(socket, data));
      socket.on('submit_answer', (data) => this.handleSubmitAnswer(socket, data));
      socket.on('reset_table', (data) => this.handleResetTable(socket, data));
      socket.on('skip_to_round2', (data) => this.handleSkipToRound2(socket, data));
      socket.on('host_get_tables', () => this.handleGetTables(socket));

      socket.on('disconnect', () => {
        console.log(`[Multiplayer] Socket disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  getRoomState(roomId) {
    const room = db.getOrCreateRoom(roomId);
    const players = db.getPlayersInRoom(roomId);
    const settlements = room.status === 'settled' ? db.getRoomSettlements(roomId) : [];
    const challenges = this.getRoomChallenges(roomId);
    const currentVideo = challenges[room.current_feed_index] || challenges[0];
    const isHostActive = this.hostSockets.has(roomId);

    return {
      roomId,
      roomCode: room.room_code || roomId,
      hostConnected: isHostActive,
      status: room.status,
      currentFeedIndex: room.current_feed_index,
      totalFeeds: challenges.length,
      roundTimer: room.round_timer,
      feedStartTime: room.feed_start_time,
      currentVideo: {
        id: currentVideo.id,
        title: currentVideo.title,
        type: currentVideo.type || (currentVideo.videoSrc?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
        mediaSrc: currentVideo.mediaSrc || currentVideo.videoSrc,
        videoSrc: currentVideo.videoSrc || currentVideo.mediaSrc,
      },
      players: players.map((p) => {
        const lastDelta = this.playerLastDeltas.get(`${roomId}:${p.player_id}`);
        return {
          playerId: p.player_id,
          seatNumber: p.seat_number,
          username: p.username,
          chips: p.chips,
          isReady: Boolean(p.is_ready),
          betAmount: p.bet_amount,
          betStatus: p.bet_status,
          answerStatus: p.answer_status,
          connected: Boolean(p.connected),
          lastDelta: lastDelta ? lastDelta.delta : undefined,
          lastMultiplier: lastDelta ? lastDelta.multiplier : undefined,
          lastIsCorrect: lastDelta ? lastDelta.isCorrect : undefined,
        };
      }),
      settlements: settlements.map((s) => ({
        playerId: s.player_id,
        username: s.username,
        seatNumber: s.seat_number,
        score: s.score,
        betAmount: s.bet_amount,
        netEarnings: s.net_earnings,
        finalChips: s.final_chips,
      })),
    };
  }

  broadcastTableState(roomId) {
    const state = this.getRoomState(roomId);
    this.io.to(roomId).emit('table_state', state);
  }

  handleHostJoin(socket, { roomId = 'table_01', hostId = `host-${Date.now()}` }) {
    roomId = String(roomId || 'table_01').toLowerCase().replace(/\s+/g, '-');

    // Leave previous room(s) so the host socket is only in ONE table room at a time.
    // Clean up any stale hostSockets entries pointing to this socket.
    if (socket.roomId && socket.roomId !== roomId) {
      socket.leave(socket.roomId);
      console.log(`[Multiplayer] Host left old room ${socket.roomId}, joining ${roomId}`);
    }
    // Remove any hostSockets entries for this socket from other rooms
    for (const [existingRoomId, socketId] of this.hostSockets.entries()) {
      if (socketId === socket.id && existingRoomId !== roomId) {
        this.hostSockets.delete(existingRoomId);
      }
    }

    const room = db.getOrCreateRoom(roomId);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.isHost = true;
    socket.hostId = hostId;

    this.hostSockets.set(roomId, socket.id);
    db.setRoomHost(roomId, hostId);

    console.log(`[Multiplayer] Host ${hostId} registered for room ${roomId}`);
    socket.emit('host_registered', { roomId, hostId });
    this.broadcastTableState(roomId);
    // Push the full tables overview so the host Tables bar shows ALL tables.
    try {
      socket.emit('tables_list', { tables: db.listRoomsWithCounts(), maxSeats: MAX_PLAYERS_PER_TABLE });
    } catch (_) {}
  }

  handleToggleReady(socket, { roomId = 'table_01', playerId, isReady }) {
    if (!playerId) return;
    db.setPlayerReady(roomId, playerId, Boolean(isReady));
    console.log(`[Multiplayer] Player ${playerId} set ready: ${isReady}`);
    this.broadcastTableState(roomId);
  }

  handleHostStartGame(socket, { roomId = 'table_01' }) {
    console.log(`[Multiplayer] Host started game for room ${roomId}`);
    this.handleStartTable(socket, { roomId });
  }

  handleJoinTable(socket, { roomId = 'table_01', playerId, username, currentChips = 50 }) {
    if (!playerId || !username) {
      socket.emit('error_message', { message: 'Player ID and Username are required' });
      return;
    }

    const requestedRoom = String(roomId || 'table_01').toLowerCase().replace(/\s+/g, '-');

    // Auto-overflow: keep max 6 seats per table. If the requested table is full,
    // seat the player at table_02, table_03, ... and tell the client where it landed.
    const requestedExisting = db.getPlayer(requestedRoom, playerId) || db.getPlayerByUsername(requestedRoom, username);
    let targetRoom = requestedRoom;
    let wasRedirected = false;
    if (!requestedExisting) {
      const placement = db.findTableWithSpace(requestedRoom, MAX_PLAYERS_PER_TABLE);
      targetRoom = placement.roomId;
      wasRedirected = placement.roomId !== requestedRoom;
      if (wasRedirected) {
        console.log(`[Multiplayer] Table ${requestedRoom} full — auto-assigned ${username} to ${targetRoom}`);
      }
    }
    roomId = targetRoom;

    let room = db.getOrCreateRoom(roomId);
    // If room was settled from past round and has no active players, auto-reset session
    if (room.status === 'settled') {
      const activePlayers = db.getPlayersInRoom(roomId).filter((p) => p.connected === 1);
      if (activePlayers.length === 0) {
        console.log(`[Multiplayer] Room ${roomId} was settled with no active players. Auto-resetting for new round.`);
        db.resetRoomSession(roomId);
        room = db.getOrCreateRoom(roomId);
      }
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerId = playerId;

    // Check if player is already seated in this room by ID or by username
    let existingPlayer = db.getPlayer(roomId, playerId) || db.getPlayerByUsername(roomId, username);
    let seatNumber;

    if (existingPlayer) {
      seatNumber = existingPlayer.seat_number;
      db.upsertPlayer(roomId, playerId, seatNumber, username, socket.id, currentChips);
    } else {
      seatNumber = db.findAvailableSeat(roomId);
      if (!seatNumber) {
        socket.emit('error_message', { message: 'TABLE_FULL: This 6-player table is already full.' });
        return;
      }
      db.upsertPlayer(roomId, playerId, seatNumber, username, socket.id, currentChips);
    }

    console.log(`[Multiplayer] ${username} seated at Seat ${seatNumber} in ${roomId}`);
    socket.emit('seat_assigned', { seatNumber, playerId, roomId, requestedRoom, redirected: wasRedirected });
    if (wasRedirected) {
      socket.emit('table_redirected', { fromRoomId: requestedRoom, roomId, seatNumber, playerId });
    }
    this.broadcastTableState(roomId);
    // Also refresh the requested table view (counts) for any host watching it.
    if (wasRedirected) this.broadcastTableState(requestedRoom);
    // Push updated tables list to ALL connected sockets (hosts need to see new overflow tables immediately).
    this.broadcastTablesListToAll();
  }

  // Explicit auto-join entry: client asks for "any table with space" starting at roomId.
  handleJoinTableAuto(socket, data = {}) {
    return this.handleJoinTable(socket, data);
  }

  // Host overview: list all tables with seat counts so host can pick table_01/02/...
  handleGetTables(socket) {
    try {
      const tables = db.listRoomsWithCounts();
      socket.emit('tables_list', { tables, maxSeats: MAX_PLAYERS_PER_TABLE });
    } catch (e) {
      console.warn('[Multiplayer] get_tables failed:', e.message);
      socket.emit('tables_list', { tables: [], maxSeats: MAX_PLAYERS_PER_TABLE });
    }
  }

  // Broadcast updated tables list to ALL sockets in the namespace (e.g. after overflow creates a new table).
  broadcastTablesListToAll() {
    try {
      const tables = db.listRoomsWithCounts();
      this.io.emit('tables_list', { tables, maxSeats: MAX_PLAYERS_PER_TABLE });
      console.log(`[Multiplayer] Broadcasted tables_list to all sockets (${tables.length} tables)`);
    } catch (e) {
      console.warn('[Multiplayer] broadcastTablesListToAll failed:', e.message);
    }
  }

  // Host action: push every player in a table straight to Round 2 (image-duel stage).
  handleSkipToRound2(socket, { roomId = 'table_01' } = {}) {
    roomId = String(roomId || 'table_01').toLowerCase().replace(/\s+/g, '-');
    console.log(`[Multiplayer] Host skipped table ${roomId} to Round 2`);
    this.clearRoomTimer(roomId);
    this.io.to(roomId).emit('skip_to_round2', { roomId, timestamp: Date.now() });
    this.broadcastTableState(roomId);
  }

  handleSelectSeat(socket, { roomId = 'table_01', playerId, desiredSeat }) {
    const seat = Number(desiredSeat);
    if (seat < 1 || seat > MAX_PLAYERS_PER_TABLE) return;

    const room = db.getOrCreateRoom(roomId);
    if (room.status !== 'waiting') {
      socket.emit('error_message', { message: 'Seats are locked once betting starts.' });
      return;
    }

    const success = db.movePlayerToSeat(roomId, playerId, seat);
    if (success) {
      console.log(`[Multiplayer] Player ${playerId} moved to Seat ${seat}`);
      socket.emit('seat_assigned', { seatNumber: seat, playerId });
      this.broadcastTableState(roomId);
    } else {
      socket.emit('error_message', { message: `Seat ${seat} is already occupied.` });
    }
  }

  handleQuickStart(socket, { roomId = 'table_01' }) {
    this.handleAddBots(socket, { roomId });
    setTimeout(() => {
      this.handleStartTable(socket, { roomId });
    }, 350);
  }

  handleReconnectTable(socket, { roomId = 'table_01', playerId }) {
    const normalizedRoom = String(roomId || 'table_01').toLowerCase().replace(/\s+/g, '-');
    // Player may have been auto-moved to an overflow table — search siblings too.
    const candidateRooms = [normalizedRoom];
    const match = normalizedRoom.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const baseNum = Number.parseInt(match[2], 10);
      for (let n = 1; n <= 50; n++) {
        if (n === baseNum) continue;
        candidateRooms.push(`${prefix}${String(n).padStart(match[2].length, '0')}`);
      }
    }
    let existingPlayer = null;
    let foundRoom = normalizedRoom;
    for (const candidate of candidateRooms) {
      const found = db.getPlayer(candidate, playerId);
      if (found) {
        existingPlayer = found;
        foundRoom = candidate;
        break;
      }
    }
    roomId = foundRoom;
    if (!existingPlayer) {
      socket.emit('reconnect_failed', { message: 'Session expired or not found' });
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerId = playerId;
    db.updatePlayerConnection(roomId, playerId, 1, socket.id);

    console.log(`[Multiplayer] Player ${existingPlayer.username} reconnected to Seat ${existingPlayer.seat_number} in ${roomId}`);
    socket.emit('seat_assigned', { seatNumber: existingPlayer.seat_number, playerId, roomId });
    this.broadcastTableState(roomId);
  }

  handleDisconnect(socket) {
    if (socket.isHost && socket.roomId) {
      if (this.hostSockets.get(socket.roomId) === socket.id) {
        this.hostSockets.delete(socket.roomId);
        console.log(`[Multiplayer] Host disconnected from room ${socket.roomId}`);
        this.broadcastTableState(socket.roomId);
      }
    } else if (socket.roomId && socket.playerId) {
      db.updatePlayerConnection(socket.roomId, socket.playerId, 0);
      this.broadcastTableState(socket.roomId);
    }
  }

  handleStartTable(socket, { roomId = 'table_01' }) {
    const room = db.getOrCreateRoom(roomId);
    if (room.status !== 'waiting') return;

    const players = db.getPlayersInRoom(roomId);
    if (players.length === 0) {
      socket.emit('error_message', { message: 'At least 1 player is required to start.' });
      return;
    }

    // Generate a fresh random selection of 5 images out of 10, followed by the 5 videos
    this.generateNewRoundChallenges(roomId);

    // Clear any previous delta records for this room
    players.forEach((p) => this.playerLastDeltas.delete(`${roomId}:${p.player_id}`));

    // Start with Wager Phase for Challenge 0 (First Image)
    this.startWagerPhase(roomId, 0);
  }

  handleAddBots(socket, { roomId = 'table_01' }) {
    const botNames = ['Agent Smith', 'Oracle', 'Cypher', 'Trinity', 'Morpheus', 'Neo'];
    const players = db.getPlayersInRoom(roomId);
    const occupiedSeats = new Set(players.map((p) => p.seat_number));

    for (let seat = 1; seat <= MAX_PLAYERS_PER_TABLE; seat++) {
      if (!occupiedSeats.has(seat)) {
        const botName = botNames[seat - 1] || `AI Bot ${seat}`;
        const botId = `bot-${roomId}-${seat}`;
        db.upsertPlayer(roomId, botId, seat, botName, null, 100);
        db.setPlayerReady(roomId, botId, 1);
      }
    }

    this.broadcastTableState(roomId);
  }

  // --- PER-CHALLENGE WAGER PHASE (15s Window) ---
  startWagerPhase(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    const challenges = this.getRoomChallenges(roomId);
    if (feedIndex >= challenges.length) {
      this.settleRound(roomId);
      return;
    }

    // Reset player bets and clear previous deltas for this specific challenge
    db.resetPlayerBets(roomId);
    const playersInRoom = db.getPlayersInRoom(roomId);
    playersInRoom.forEach((p) => {
      this.playerLastDeltas.delete(`${roomId}:${p.player_id}`);
      // If player has 0 chips, they are unable to wager and auto-locked in spectator mode with $0 bet
      if (p.chips <= 0) {
        db.updatePlayerBet(roomId, p.player_id, 0);
      }
    });
    db.updateRoomStatus(roomId, 'betting', feedIndex, 15);
    this.broadcastTableState(roomId);

    const currentItem = challenges[feedIndex];
    this.io.to(roomId).emit('wager_phase_started', {
      roomId,
      feedIndex,
      totalFeeds: challenges.length,
      duration: WAGER_DURATION,
      video: {
        id: currentItem.id,
        title: currentItem.title,
        type: currentItem.type,
      },
    });

    let secondsLeft = WAGER_DURATION;
    const timerInterval = setInterval(() => {
      secondsLeft -= 1;
      db.updateRoomStatus(roomId, 'betting', feedIndex, Math.max(0, secondsLeft));
      this.io.to(roomId).emit('timer_tick', { roomId, phase: 'betting', feedIndex, secondsLeft });

      // Automatically place default bets for bots
      const players = db.getPlayersInRoom(roomId);
      players.forEach((p) => {
        if (p.player_id.startsWith('bot-') && p.bet_status === 'not_bet') {
          const choices = [10, 30];
          const defaultBet = Math.min(p.chips > 0 ? p.chips : 10, choices[Math.floor(Math.random() * choices.length)] || 10);
          db.updatePlayerBet(roomId, p.player_id, defaultBet);
        }
      });

      if (secondsLeft <= 0) {
        this.clearRoomTimer(roomId);
        // Default any remaining unbet players to min(chips, 10), or 0 if out of chips
        db.getPlayersInRoom(roomId).forEach((p) => {
          if (p.bet_status === 'not_bet') {
            const minBet = p.chips > 0 ? Math.min(p.chips, 10) : 0;
            db.updatePlayerBet(roomId, p.player_id, minBet);
          }
        });
        this.lockBetsAndStartFeeds(roomId, feedIndex);
      }
    }, 1000);

    this.roomTimers.set(roomId, { timerInterval });
  }

  handlePlaceBet(socket, { roomId = 'table_01', playerId, betAmount }) {
    const room = db.getOrCreateRoom(roomId);
    if (room.status !== 'betting') {
      socket.emit('error_message', { message: 'Betting is currently closed.' });
      return;
    }

    const player = db.getPlayer(roomId, playerId);
    if (!player) {
      socket.emit('error_message', { message: 'Player not seated at this table.' });
      return;
    }

    if (player.chips <= 0) {
      socket.emit('error_message', { message: 'Bankroll depleted ($0). Spectating feed in watch mode.' });
      return;
    }

    const numericBet = betAmount === 'ALL_IN' ? player.chips : Number(betAmount);
    if (numericBet <= 0 || numericBet > player.chips) {
      socket.emit('error_message', { message: 'Insufficient chips or invalid bet.' });
      return;
    }

    db.updatePlayerBet(roomId, playerId, numericBet);
    this.broadcastTableState(roomId);

    // If all seated players have placed their bets, lock bets early
    const currentPlayers = db.getPlayersInRoom(roomId);
    const allBet = currentPlayers.every((p) => p.bet_status === 'placed');
    if (allBet && currentPlayers.length > 0) {
      this.lockBetsAndStartFeeds(roomId, room.current_feed_index);
    }
  }

  lockBetsAndStartFeeds(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    db.lockAllBets(roomId);
    this.io.to(roomId).emit('all_bets_locked', { feedIndex, message: 'All bets locked!' });

    setTimeout(() => {
      this.startFeed(roomId, feedIndex);
    }, 1200);
  }

  // --- CHALLENGE DISPLAY PHASE (30s Images / 30s Videos) ---
  startFeed(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    const challenges = this.getRoomChallenges(roomId);
    if (feedIndex >= challenges.length) {
      this.settleRound(roomId);
      return;
    }

    const currentVideo = challenges[feedIndex];
    const duration = currentVideo?.type === 'video' ? VIDEO_FEED_DURATION : IMAGE_FEED_DURATION;
    const feedStartTime = Date.now();
    if (this.roomFeedStartTimes) {
      this.roomFeedStartTimes.set(roomId, feedStartTime);
    }

    db.resetPlayerAnswerStatuses(roomId);
    const playersInFeed = db.getPlayersInRoom(roomId);
    playersInFeed.forEach((p) => this.playerLastDeltas.delete(`${roomId}:${p.player_id}`));
    db.updateRoomStatus(roomId, 'playing', feedIndex, duration, feedStartTime);
    this.broadcastTableState(roomId);

    this.io.to(roomId).emit('feed_started', {
      roomId,
      feedIndex,
      totalFeeds: challenges.length,
      duration,
      feedStartTime,
      video: {
        id: currentVideo.id,
        title: currentVideo.title,
        type: currentVideo.type || (currentVideo.videoSrc?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
        mediaSrc: currentVideo.mediaSrc || currentVideo.videoSrc,
        videoSrc: currentVideo.videoSrc || currentVideo.mediaSrc,
      },
    });

    // Schedule bots to answer realistically with appropriate speed multiplier
    const players = db.getPlayersInRoom(roomId);
    const maxBotDelay = Math.max(7000, (duration * 1000) - 4000);
    players.forEach((p) => {
      if (p.player_id.startsWith('bot-')) {
        const delay = 3000 + Math.random() * (maxBotDelay - 3000);
        const botTimeout = setTimeout(() => {
          const roomNow = db.getOrCreateRoom(roomId);
          if (roomNow.status === 'playing' && roomNow.current_feed_index === feedIndex) {
            const timeTaken = Number((delay / 1000).toFixed(1));
            
            // Calculate bot speed multiplier (30s rounds):
            // <=5s: 5x, <=10s: 4x, <=15s: 3x, <=20s: 2x, >20s: 1x
            let multiplier = 1;
            if (timeTaken <= 5) multiplier = 5;
            else if (timeTaken <= 10) multiplier = 4;
            else if (timeTaken <= 15) multiplier = 3;
            else if (timeTaken <= 20) multiplier = 2;
            else multiplier = 1;

            // 65% chance bot guesses correctly
            const isCorrect = Math.random() < 0.65;
            const answer = isCorrect ? (currentVideo.isAI ? 'ai' : 'real') : (currentVideo.isAI ? 'real' : 'ai');
            const bet = p.bet_amount || 10;
            const netDelta = isCorrect ? (bet * multiplier) : (-bet);

            db.recordAnswer(roomId, p.player_id, feedIndex, answer, isCorrect, timeTaken, multiplier, netDelta);
            this.io.to(roomId).emit('player_answered_status', {
              playerId: p.player_id,
              seatNumber: p.seat_number,
              answerStatus: 'answered',
              timeTaken,
              multiplier,
            });
            this.checkAllPlayersAnswered(roomId, feedIndex);
          }
        }, delay);

        if (!this.botIntervals.has(roomId)) this.botIntervals.set(roomId, []);
        this.botIntervals.get(roomId).push(botTimeout);
      }
    });

    let secondsLeft = duration;
    const timerInterval = setInterval(() => {
      secondsLeft -= 1;
      db.updateRoomStatus(roomId, 'playing', feedIndex, Math.max(0, secondsLeft));
      this.io.to(roomId).emit('timer_tick', { roomId, phase: 'playing', feedIndex, secondsLeft });

      if (secondsLeft <= 0) {
        this.clearRoomTimer(roomId);
        this.revealFeedResults(roomId, feedIndex);
      }
    }, 1000);

    this.roomTimers.set(roomId, { timerInterval });
  }

  handleSubmitAnswer(socket, { roomId = 'table_01', playerId, feedIndex, answer, clientTimeTaken }) {
    const room = db.getOrCreateRoom(roomId);
    if (room.status !== 'playing' || room.current_feed_index !== feedIndex) {
      return;
    }

    const challenges = this.getRoomChallenges(roomId);
    const currentVideo = challenges[feedIndex];
    if (!currentVideo) return;

    const player = db.getPlayer(roomId, playerId);
    if (!player) return;

    // Calculate time taken accurately from in-memory feed start time or DB feed_start_time
    const memStartTime = this.roomFeedStartTimes ? this.roomFeedStartTimes.get(roomId) : null;
    const feedStartTime = memStartTime || room.feed_start_time;

    let timeTaken;
    if (feedStartTime) {
      timeTaken = Math.max(0.1, Number(((Date.now() - feedStartTime) / 1000).toFixed(1)));
    } else if (typeof clientTimeTaken === 'number' && clientTimeTaken > 0) {
      timeTaken = Number(clientTimeTaken.toFixed(1));
    } else {
      timeTaken = 25.0; // fallback if feed timer missing, never default to 0.1s
    }

    // If clientTimeTaken is supplied, use the maximum of server and client to prevent network delay granting an unearned 5x speed multiplier
    if (typeof clientTimeTaken === 'number' && clientTimeTaken > 0) {
      timeTaken = Math.max(timeTaken, Number(clientTimeTaken.toFixed(1)));
    }

    // Calculate Speed Multiplier (30s rounds):
    // <=5s: 5x, <=10s: 4x, <=15s: 3x, <=20s: 2x, >20s: 1x
    let multiplier = 1;
    if (timeTaken <= 5) multiplier = 5;
    else if (timeTaken <= 10) multiplier = 4;
    else if (timeTaken <= 15) multiplier = 3;
    else if (timeTaken <= 20) multiplier = 2;
    else multiplier = 1;

    const isCorrect = (answer === 'ai' && currentVideo.isAI) || (answer === 'real' && !currentVideo.isAI);
    const rawBet = player.bet_amount && player.bet_amount > 0 ? player.bet_amount : (player.chips > 0 ? 10 : 0);
    const bet = Math.max(0, Math.min(player.chips > 0 ? player.chips : 0, rawBet));
    const netDelta = isCorrect ? (bet * multiplier) : (-bet);

    db.recordAnswer(roomId, playerId, feedIndex, answer, isCorrect, timeTaken, multiplier, netDelta);

    this.io.to(roomId).emit('player_answered_status', {
      playerId,
      seatNumber: player.seat_number,
      answerStatus: 'answered',
      timeTaken,
      multiplier,
    });

    this.checkAllPlayersAnswered(roomId, feedIndex);
  }

  checkAllPlayersAnswered(roomId, feedIndex) {
    const players = db.getPlayersInRoom(roomId);
    const answers = db.getAnswersForFeed(roomId, feedIndex);

    // If every seated player has answered, proceed immediately to reveal
    if (answers.length >= players.length && players.length > 0) {
      this.clearRoomTimer(roomId);
      this.revealFeedResults(roomId, feedIndex);
    }
  }

  // --- REVEAL & INSTANT CHIP SETTLEMENT PHASE ---
  revealFeedResults(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    db.updateRoomStatus(roomId, 'revealing', feedIndex, 0);

    const challenges = this.getRoomChallenges(roomId);
    const currentVideo = challenges[feedIndex];
    const players = db.getPlayersInRoom(roomId);
    const answers = db.getAnswersForFeed(roomId, feedIndex);
    const answerMap = new Map(answers.map((a) => [a.player_id, a]));

    const playerResults = [];

    // Process instant chip calculation for all players in room
    players.forEach((p) => {
      const a = answerMap.get(p.player_id);
      let isCorrect = false;
      let timeTaken = null;
      let multiplier = 0;
      let netDelta = 0;
      let chosenAnswer = 'none';

      const rawBet = p.bet_amount && p.bet_amount > 0 ? p.bet_amount : (p.chips > 0 ? 10 : 0);
      const bet = Math.max(0, Math.min(p.chips > 0 ? p.chips : 0, rawBet));

      if (a) {
        isCorrect = Boolean(a.is_correct);
        timeTaken = a.time_taken;
        multiplier = a.multiplier || 1;
        netDelta = a.net_delta;
        chosenAnswer = a.answer;
      } else {
        // Did not answer in time: loss of bet (or $0 if in watching spectator mode)
        isCorrect = false;
        multiplier = 0;
        netDelta = -bet;
        chosenAnswer = p.chips <= 0 ? 'watching' : 'timeout';
      }

      // Update player's chip balance immediately
      const newChips = Math.max(0, p.chips + netDelta);
      db.updatePlayerChips(roomId, p.player_id, newChips);

      // Record in memory for immediate state badge display
      this.playerLastDeltas.set(`${roomId}:${p.player_id}`, {
        delta: netDelta,
        multiplier: isCorrect ? multiplier : 0,
        isCorrect,
      });

      playerResults.push({
        playerId: p.player_id,
        seatNumber: p.seat_number,
        username: p.username,
        answer: chosenAnswer,
        isCorrect,
        timeTaken,
        multiplier: isCorrect ? multiplier : 0,
        betAmount: bet,
        netDelta,
        newChips,
      });
    });

    this.io.to(roomId).emit('feed_revealed', {
      roomId,
      feedIndex,
      totalFeeds: challenges.length,
      isAI: currentVideo.isAI,
      classification: currentVideo.isAI ? 'AI' : 'REAL',
      playerResults,
    });

    // Broadcast updated table state so all player seats show updated bankroll immediately
    this.broadcastTableState(roomId);

    // After 4.5 seconds of reveal display, move to next challenge's wager phase or settle
    setTimeout(() => {
      const nextIndex = feedIndex + 1;
      if (nextIndex < challenges.length) {
        this.startWagerPhase(roomId, nextIndex);
      } else {
        this.settleRound(roomId);
      }
    }, 4500);
  }

  // --- FINAL ROUND SETTLEMENT (AFTER ALL CHALLENGES) ---
  settleRound(roomId) {
    this.clearRoomTimer(roomId);
    const challenges = this.getRoomChallenges(roomId);
    db.updateRoomStatus(roomId, 'settled', challenges.length - 1, 0);

    const players = db.getPlayersInRoom(roomId);

    players.forEach((player) => {
      const answers = db.getPlayerAnswers(roomId, player.player_id);
      const score = answers.filter((a) => a.is_correct === 1).length;
      const totalDelta = answers.reduce((acc, a) => acc + (a.net_delta || 0), 0);
      const finalChips = player.chips;

      db.recordSettlement(roomId, player.player_id, score, player.bet_amount || 10, totalDelta, finalChips);
    });

    const settlements = db.getRoomSettlements(roomId);
    console.log(`[Multiplayer] Round 1 Settled for ${roomId}:`, settlements);

    this.io.to(roomId).emit('round_settled', {
      roomId,
      settlements: settlements.map((s) => ({
        playerId: s.player_id,
        username: s.username,
        seatNumber: s.seat_number,
        score: s.score,
        betAmount: s.bet_amount,
        netEarnings: s.net_earnings,
        finalChips: s.final_chips,
      })),
    });

    this.broadcastTableState(roomId);
  }

  handleResetTable(socket, { roomId = 'table_01' }) {
    this.clearRoomTimer(roomId);
    const players = db.getPlayersInRoom(roomId);
    players.forEach((p) => this.playerLastDeltas.delete(`${roomId}:${p.player_id}`));
    this.generateNewRoundChallenges(roomId);
    db.resetRoomSession(roomId);
    this.broadcastTableState(roomId);
  }

  clearRoomTimer(roomId) {
    if (this.roomTimers.has(roomId)) {
      clearInterval(this.roomTimers.get(roomId).timerInterval);
      this.roomTimers.delete(roomId);
    }
    if (this.botIntervals.has(roomId)) {
      this.botIntervals.get(roomId).forEach((timeout) => clearTimeout(timeout));
      this.botIntervals.delete(roomId);
    }
  }
}

export default MultiplayerManager;

