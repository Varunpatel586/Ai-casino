import db from './db.js';

export const roundVideos = [
  { id: 1, title: 'Person walking in park', isAI: false, videoSrc: '/Videos/REAL 1.mp4' },
  { id: 2, title: 'Dancing animation', isAI: true, videoSrc: '/Videos/AI 2.mp4' },
  { id: 3, title: 'Nature landscape', isAI: false, videoSrc: '/Videos/REAL 3.mp4' },
  { id: 4, title: 'Abstract motion', isAI: true, videoSrc: '/Videos/AI 4.mp4' },
  { id: 5, title: 'Street interview', isAI: false, videoSrc: '/Videos/REAL 5.mp4' },
];

export class MultiplayerManager {
  constructor(io) {
    this.io = io.of('/round1');
    this.roomTimers = new Map(); // roomId -> { timerInterval, secondsLeft }
    this.botIntervals = new Map(); // roomId -> Array of timeouts
    this.hostSockets = new Map(); // roomId -> socket.id

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

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`[Multiplayer] Socket connected: ${socket.id}`);

      // Host Events (Host has NO seat, NO chips, purely manages & views table)
      socket.on('host_join', (data) => this.handleHostJoin(socket, data));
      socket.on('host_start_game', (data) => this.handleHostStartGame(socket, data));

      // Player Events
      socket.on('join_table', (data) => this.handleJoinTable(socket, data));
      socket.on('toggle_ready', (data) => this.handleToggleReady(socket, data));
      socket.on('reconnect_table', (data) => this.handleReconnectTable(socket, data));
      socket.on('select_seat', (data) => this.handleSelectSeat(socket, data));
      socket.on('place_bet', (data) => this.handlePlaceBet(socket, data));
      socket.on('start_table', (data) => this.handleStartTable(socket, data));
      socket.on('quick_start', (data) => this.handleQuickStart(socket, data));
      socket.on('add_bots', (data) => this.handleAddBots(socket, data));
      socket.on('submit_answer', (data) => this.handleSubmitAnswer(socket, data));
      socket.on('reset_table', (data) => this.handleResetTable(socket, data));

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
    const currentVideo = roundVideos[room.current_feed_index] || roundVideos[0];
    const isHostActive = this.hostSockets.has(roomId);

    return {
      roomId,
      roomCode: room.room_code || roomId,
      hostConnected: isHostActive,
      status: room.status,
      currentFeedIndex: room.current_feed_index,
      totalFeeds: roundVideos.length,
      roundTimer: room.round_timer,
      currentVideo: {
        id: currentVideo.id,
        title: currentVideo.title,
        videoSrc: currentVideo.videoSrc,
      },
      players: players.map((p) => ({
        playerId: p.player_id,
        seatNumber: p.seat_number,
        username: p.username,
        chips: p.chips,
        isReady: Boolean(p.is_ready),
        betAmount: p.bet_amount,
        betStatus: p.bet_status,
        answerStatus: p.answer_status,
        connected: Boolean(p.connected),
      })),
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

    let room = db.getOrCreateRoom(roomId);
    // If the room was already settled from a past finished round and has no active players, auto-reset session
    if (room.status === 'settled') {
      const activePlayers = db.getPlayersInRoom(roomId).filter(p => p.connected === 1);
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
    socket.emit('seat_assigned', { seatNumber, playerId });
    this.broadcastTableState(roomId);
  }

  handleSelectSeat(socket, { roomId = 'table_01', playerId, desiredSeat }) {
    const seat = Number(desiredSeat);
    if (seat < 1 || seat > 6) return;

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
    const existingPlayer = db.getPlayer(roomId, playerId);
    if (!existingPlayer) {
      socket.emit('reconnect_failed', { message: 'Session expired or not found' });
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerId = playerId;
    db.updatePlayerConnection(roomId, playerId, 1, socket.id);

    console.log(`[Multiplayer] Player ${existingPlayer.username} reconnected to Seat ${existingPlayer.seat_number}`);
    socket.emit('seat_assigned', { seatNumber: existingPlayer.seat_number, playerId });
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

    // Transition to betting phase with 20-second countdown
    db.updateRoomStatus(roomId, 'betting', 0, 20);
    this.broadcastTableState(roomId);
    this.startBettingTimer(roomId);
  }

  handleAddBots(socket, { roomId = 'table_01' }) {
    const botNames = ['Agent Smith', 'Oracle', 'Cypher', 'Trinity', 'Morpheus', 'Neo'];
    const players = db.getPlayersInRoom(roomId);
    const occupiedSeats = new Set(players.map((p) => p.seat_number));

    for (let seat = 1; seat <= 6; seat++) {
      if (!occupiedSeats.has(seat)) {
        const botName = botNames[seat - 1] || `AI Bot ${seat}`;
        const botId = `bot-${roomId}-${seat}`;
        db.upsertPlayer(roomId, botId, seat, botName, null, 50);
        db.setPlayerReady(roomId, botId, 1);
      }
    }

    this.broadcastTableState(roomId);
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
      this.lockBetsAndStartFeeds(roomId);
    }
  }

  startBettingTimer(roomId) {
    this.clearRoomTimer(roomId);
    let secondsLeft = 20;

    const timerInterval = setInterval(() => {
      secondsLeft -= 1;
      db.updateRoomStatus(roomId, 'betting', 0, Math.max(0, secondsLeft));
      this.io.to(roomId).emit('timer_tick', { phase: 'betting', secondsLeft });

      // Automatically place default bet for bots if any
      const players = db.getPlayersInRoom(roomId);
      players.forEach((p) => {
        if (p.player_id.startsWith('bot-') && p.bet_status === 'not_bet') {
          const defaultBet = Math.min(p.chips, [10, 30][Math.floor(Math.random() * 2)]);
          db.updatePlayerBet(roomId, p.player_id, defaultBet);
        }
      });

      if (secondsLeft <= 0) {
        this.clearRoomTimer(roomId);
        // Default any remaining unplaced human bets to minBet ($10 or all chips)
        db.getPlayersInRoom(roomId).forEach((p) => {
          if (p.bet_status === 'not_bet') {
            const minBet = Math.min(p.chips, 10);
            db.updatePlayerBet(roomId, p.player_id, minBet);
          }
        });
        this.lockBetsAndStartFeeds(roomId);
      }
    }, 1000);

    this.roomTimers.set(roomId, { timerInterval });
  }

  lockBetsAndStartFeeds(roomId) {
    this.clearRoomTimer(roomId);
    db.lockAllBets(roomId);
    this.io.to(roomId).emit('all_bets_locked', { message: 'All bets locked!' });

    setTimeout(() => {
      this.startFeed(roomId, 0);
    }, 1500);
  }

  startFeed(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    if (feedIndex >= roundVideos.length) {
      this.settleRound(roomId);
      return;
    }

    db.resetPlayerAnswerStatuses(roomId);
    db.updateRoomStatus(roomId, 'playing', feedIndex, 45, Date.now());
    this.broadcastTableState(roomId);

    const currentVideo = roundVideos[feedIndex];
    this.io.to(roomId).emit('feed_started', {
      feedIndex,
      totalFeeds: roundVideos.length,
      video: {
        id: currentVideo.id,
        title: currentVideo.title,
        videoSrc: currentVideo.videoSrc,
      },
      duration: 45,
    });

    // Schedule bots to answer realistically between 4 and 18 seconds
    const players = db.getPlayersInRoom(roomId);
    players.forEach((p) => {
      if (p.player_id.startsWith('bot-')) {
        const delay = 4000 + Math.random() * 12000;
        const botTimeout = setTimeout(() => {
          const roomNow = db.getOrCreateRoom(roomId);
          if (roomNow.status === 'playing' && roomNow.current_feed_index === feedIndex) {
            // 65% chance bot guesses correctly
            const isCorrect = Math.random() < 0.65;
            const answer = isCorrect ? (currentVideo.isAI ? 'ai' : 'real') : (currentVideo.isAI ? 'real' : 'ai');
            db.recordAnswer(roomId, p.player_id, feedIndex, answer, isCorrect);
            this.io.to(roomId).emit('player_answered_status', {
              playerId: p.player_id,
              seatNumber: p.seat_number,
              answerStatus: 'answered',
            });
            this.checkAllPlayersAnswered(roomId, feedIndex);
          }
        }, delay);

        if (!this.botIntervals.has(roomId)) this.botIntervals.set(roomId, []);
        this.botIntervals.get(roomId).push(botTimeout);
      }
    });

    let secondsLeft = 45;
    const timerInterval = setInterval(() => {
      secondsLeft -= 1;
      db.updateRoomStatus(roomId, 'playing', feedIndex, Math.max(0, secondsLeft));
      this.io.to(roomId).emit('timer_tick', { phase: 'playing', feedIndex, secondsLeft });

      if (secondsLeft <= 0) {
        this.clearRoomTimer(roomId);
        this.revealFeedResults(roomId, feedIndex);
      }
    }, 1000);

    this.roomTimers.set(roomId, { timerInterval });
  }

  handleSubmitAnswer(socket, { roomId = 'table_01', playerId, feedIndex, answer }) {
    const room = db.getOrCreateRoom(roomId);
    if (room.status !== 'playing' || room.current_feed_index !== feedIndex) {
      return;
    }

    const currentVideo = roundVideos[feedIndex];
    if (!currentVideo) return;

    const isCorrect = (answer === 'ai' && currentVideo.isAI) || (answer === 'real' && !currentVideo.isAI);
    db.recordAnswer(roomId, playerId, feedIndex, answer, isCorrect);

    const player = db.getPlayer(roomId, playerId);
    this.io.to(roomId).emit('player_answered_status', {
      playerId,
      seatNumber: player ? player.seat_number : null,
      answerStatus: 'answered',
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

  revealFeedResults(roomId, feedIndex) {
    this.clearRoomTimer(roomId);
    db.updateRoomStatus(roomId, 'revealing', feedIndex, 0);

    const currentVideo = roundVideos[feedIndex];
    const answers = db.getAnswersForFeed(roomId, feedIndex);

    this.io.to(roomId).emit('feed_revealed', {
      feedIndex,
      isAI: currentVideo.isAI,
      classification: currentVideo.isAI ? 'AI GENERATED' : 'AUTHENTIC REAL LIFE',
      playerResults: answers.map((a) => ({
        playerId: a.player_id,
        seatNumber: a.seat_number,
        username: a.username,
        answer: a.answer,
        isCorrect: Boolean(a.is_correct),
      })),
    });

    this.broadcastTableState(roomId);

    // After 3.5 seconds of feedback, advance to next feed or settle
    setTimeout(() => {
      const nextIndex = feedIndex + 1;
      if (nextIndex < roundVideos.length) {
        this.startFeed(roomId, nextIndex);
      } else {
        this.settleRound(roomId);
      }
    }, 3500);
  }

  settleRound(roomId) {
    this.clearRoomTimer(roomId);
    db.updateRoomStatus(roomId, 'settled', roundVideos.length - 1, 0);

    const players = db.getPlayersInRoom(roomId);

    players.forEach((player) => {
      const answers = db.getPlayerAnswers(roomId, player.player_id);
      const score = answers.filter((a) => a.is_correct === 1).length;
      const wrongCount = 5 - score;
      const bet = player.bet_amount || 10;
      const netEarnings = score * bet - wrongCount * bet;
      const finalChips = Math.max(0, player.chips + netEarnings);

      db.recordSettlement(roomId, player.player_id, score, bet, netEarnings, finalChips);
    });

    const settlements = db.getRoomSettlements(roomId);
    console.log(`[Multiplayer] Round 1 Settled for ${roomId}:`, settlements);

    this.io.to(roomId).emit('round_settled', {
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
