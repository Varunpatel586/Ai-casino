import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'casino_multiplayer.db');

const db = new DatabaseSync(dbPath);
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
} catch (_) {}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    room_id TEXT PRIMARY KEY,
    room_code TEXT,
    host_id TEXT,
    status TEXT NOT NULL,
    current_feed_index INTEGER DEFAULT 0,
    feed_start_time INTEGER,
    round_timer INTEGER DEFAULT 60,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS players (
    player_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    username TEXT NOT NULL,
    socket_id TEXT,
    chips INTEGER NOT NULL,
    bet_amount INTEGER DEFAULT 0,
    bet_status TEXT DEFAULT 'not_bet',
    answer_status TEXT DEFAULT 'not_answered',
    is_ready INTEGER DEFAULT 0,
    connected INTEGER DEFAULT 1,
    last_seen INTEGER,
    PRIMARY KEY (room_id, player_id),
    UNIQUE (room_id, seat_number)
  );

  CREATE TABLE IF NOT EXISTS answers (
    room_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    feed_index INTEGER NOT NULL,
    answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    submitted_at INTEGER,
    PRIMARY KEY (room_id, player_id, feed_index)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    room_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    bet_amount INTEGER NOT NULL,
    net_earnings INTEGER NOT NULL,
    final_chips INTEGER NOT NULL,
    settled_at INTEGER,
    PRIMARY KEY (room_id, player_id)
  );
`);

// Safe column migrations for existing databases
try {
  db.exec('ALTER TABLE rooms ADD COLUMN room_code TEXT');
} catch (_) {}
try {
  db.exec('ALTER TABLE rooms ADD COLUMN host_id TEXT');
} catch (_) {}
try {
  db.exec('ALTER TABLE players ADD COLUMN is_ready INTEGER DEFAULT 0');
} catch (_) {}
try {
  db.exec('ALTER TABLE answers ADD COLUMN time_taken REAL DEFAULT 0');
} catch (_) {}
try {
  db.exec('ALTER TABLE answers ADD COLUMN multiplier INTEGER DEFAULT 1');
} catch (_) {}
try {
  db.exec('ALTER TABLE answers ADD COLUMN net_delta INTEGER DEFAULT 0');
} catch (_) {}

export function getOrCreateRoom(roomId = 'table_01', roomCode = null) {
  const selectStmt = db.prepare('SELECT * FROM rooms WHERE room_id = ?');
  let room = selectStmt.get(roomId);
  const now = Date.now();

  if (!room) {
    const insertStmt = db.prepare(`
      INSERT INTO rooms (room_id, room_code, status, current_feed_index, feed_start_time, round_timer, created_at, updated_at)
      VALUES (?, ?, 'waiting', 0, NULL, 60, ?, ?)
    `);
    insertStmt.run(roomId, roomCode || roomId, now, now);
    room = selectStmt.get(roomId);
  }
  return room;
}

export function setRoomHost(roomId, hostId) {
  db.prepare(`
    UPDATE rooms 
    SET host_id = ?, updated_at = ?
    WHERE room_id = ?
  `).run(hostId, Date.now(), roomId);
}

export function setPlayerReady(roomId, playerId, isReady) {
  db.prepare(`
    UPDATE players 
    SET is_ready = ?, last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `).run(isReady ? 1 : 0, Date.now(), roomId, playerId);
  return getPlayer(roomId, playerId);
}

export function updateRoomStatus(roomId, status, currentFeedIndex = 0, roundTimer = 45, feedStartTime = null) {
  const stmt = db.prepare(`
    UPDATE rooms 
    SET status = ?, current_feed_index = ?, round_timer = ?, feed_start_time = ?, updated_at = ?
    WHERE room_id = ?
  `);
  stmt.run(status, currentFeedIndex, roundTimer, feedStartTime, Date.now(), roomId);
}

export function getPlayersInRoom(roomId) {
  const stmt = db.prepare(`
    SELECT * FROM players 
    WHERE room_id = ? 
    ORDER BY seat_number ASC
  `);
  return stmt.all(roomId);
}

export function getPlayer(roomId, playerId) {
  const stmt = db.prepare('SELECT * FROM players WHERE room_id = ? AND player_id = ?');
  return stmt.get(roomId, playerId);
}

export function getPlayerBySocket(socketId) {
  const stmt = db.prepare('SELECT * FROM players WHERE socket_id = ?');
  return stmt.get(socketId);
}

export function getPlayerByUsername(roomId, username) {
  const stmt = db.prepare('SELECT * FROM players WHERE room_id = ? AND username = ?');
  return stmt.get(roomId, username);
}

export function findAvailableSeat(roomId) {
  const existing = getPlayersInRoom(roomId);
  const occupiedSeats = new Set(existing.map(p => p.seat_number));
  for (let seat = 1; seat <= 6; seat++) {
    if (!occupiedSeats.has(seat)) {
      return seat;
    }
  }
  // If all 6 seats are taken, find the oldest disconnected player or bot to reclaim seat
  const disconnectable = existing.find(p => p.connected === 0 || p.player_id.startsWith('bot-'));
  if (disconnectable) {
    db.prepare('DELETE FROM players WHERE room_id = ? AND player_id = ?').run(roomId, disconnectable.player_id);
    return disconnectable.seat_number;
  }
  return null; // Room is full with 6 active humans
}

export function movePlayerToSeat(roomId, playerId, newSeat) {
  const existingAtSeat = db.prepare('SELECT * FROM players WHERE room_id = ? AND seat_number = ?').get(roomId, newSeat);
  if (existingAtSeat && existingAtSeat.player_id !== playerId) {
    if (existingAtSeat.connected === 0 || existingAtSeat.player_id.startsWith('bot-')) {
      db.prepare('DELETE FROM players WHERE room_id = ? AND player_id = ?').run(roomId, existingAtSeat.player_id);
    } else {
      return false; // Active player already there
    }
  }
  db.prepare('UPDATE players SET seat_number = ?, last_seen = ? WHERE room_id = ? AND player_id = ?').run(newSeat, Date.now(), roomId, playerId);
  return true;
}

export function upsertPlayer(roomId, playerId, seatNumber, username, socketId, chips) {
  const existing = getPlayer(roomId, playerId);
  const now = Date.now();

  if (existing) {
    if (seatNumber && seatNumber !== existing.seat_number) {
      db.prepare('DELETE FROM players WHERE room_id = ? AND seat_number = ? AND player_id != ?').run(roomId, seatNumber, playerId);
    }
    const updateStmt = db.prepare(`
      UPDATE players
      SET socket_id = ?, connected = 1, last_seen = ?, chips = COALESCE(?, chips), seat_number = COALESCE(?, seat_number), username = ?
      WHERE room_id = ? AND player_id = ?
    `);
    updateStmt.run(socketId, now, chips, seatNumber, username, roomId, playerId);
    return getPlayer(roomId, playerId);
  }

  // Remove any conflicting player holding this seat, or with this username or player_id
  db.prepare(`
    DELETE FROM players 
    WHERE room_id = ? AND (seat_number = ? OR player_id = ? OR username = ?)
  `).run(roomId, seatNumber, playerId, username);

  const insertStmt = db.prepare(`
    INSERT INTO players (player_id, room_id, seat_number, username, socket_id, chips, bet_amount, bet_status, answer_status, connected, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'not_bet', 'not_answered', 1, ?)
  `);
  insertStmt.run(playerId, roomId, seatNumber, username, socketId, chips, now);
  return getPlayer(roomId, playerId);
}

export function updatePlayerConnection(roomId, playerId, connected, socketId = null) {
  const stmt = db.prepare(`
    UPDATE players 
    SET connected = ?, socket_id = COALESCE(?, socket_id), last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `);
  stmt.run(connected ? 1 : 0, socketId, Date.now(), roomId, playerId);
}

export function updatePlayerBet(roomId, playerId, betAmount) {
  const stmt = db.prepare(`
    UPDATE players
    SET bet_amount = ?, bet_status = 'placed', last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `);
  stmt.run(betAmount, Date.now(), roomId, playerId);
  return getPlayer(roomId, playerId);
}

export function lockAllBets(roomId) {
  const stmt = db.prepare(`
    UPDATE players
    SET bet_status = 'locked'
    WHERE room_id = ? AND bet_status = 'placed'
  `);
  stmt.run(roomId);
}

export function updatePlayerChips(roomId, playerId, chips) {
  const stmt = db.prepare(`
    UPDATE players
    SET chips = ?, last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `);
  stmt.run(chips, Date.now(), roomId, playerId);
  return getPlayer(roomId, playerId);
}

export function resetPlayerBets(roomId) {
  const stmt = db.prepare(`
    UPDATE players
    SET bet_amount = 0, bet_status = 'not_bet', answer_status = 'not_answered'
    WHERE room_id = ?
  `);
  stmt.run(roomId);
}

export function resetPlayerAnswerStatuses(roomId) {
  const stmt = db.prepare(`
    UPDATE players
    SET answer_status = 'not_answered'
    WHERE room_id = ?
  `);
  stmt.run(roomId);
}

export function recordAnswer(roomId, playerId, feedIndex, answer, isCorrect, timeTaken = 0, multiplier = 1, netDelta = 0) {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO answers (room_id, player_id, feed_index, answer, is_correct, time_taken, multiplier, net_delta, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(roomId, playerId, feedIndex, answer, isCorrect ? 1 : 0, timeTaken, multiplier, netDelta, Date.now());

  const updatePlayerStmt = db.prepare(`
    UPDATE players
    SET answer_status = 'answered', last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `);
  updatePlayerStmt.run(Date.now(), roomId, playerId);
}

export function getAnswersForFeed(roomId, feedIndex) {
  const stmt = db.prepare(`
    SELECT a.*, p.username, p.seat_number 
    FROM answers a
    JOIN players p ON a.player_id = p.player_id AND a.room_id = p.room_id
    WHERE a.room_id = ? AND a.feed_index = ?
  `);
  return stmt.all(roomId, feedIndex);
}

export function getPlayerAnswers(roomId, playerId) {
  const stmt = db.prepare(`
    SELECT * FROM answers 
    WHERE room_id = ? AND player_id = ?
    ORDER BY feed_index ASC
  `);
  return stmt.all(roomId, playerId);
}

export function recordSettlement(roomId, playerId, score, betAmount, netEarnings, finalChips) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settlements (room_id, player_id, score, bet_amount, net_earnings, final_chips, settled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(roomId, playerId, score, betAmount, netEarnings, finalChips, Date.now());

  // Also update player's chip balance in players table
  const updatePlayerStmt = db.prepare(`
    UPDATE players
    SET chips = ?, last_seen = ?
    WHERE room_id = ? AND player_id = ?
  `);
  updatePlayerStmt.run(finalChips, Date.now(), roomId, playerId);
}

export function getRoomSettlements(roomId) {
  const stmt = db.prepare(`
    SELECT s.*, p.username, p.seat_number
    FROM settlements s
    JOIN players p ON s.player_id = p.player_id AND s.room_id = p.room_id
    WHERE s.room_id = ?
    ORDER BY s.final_chips DESC
  `);
  return stmt.all(roomId);
}

export function resetRoomSession(roomId) {
  db.prepare(`DELETE FROM settlements WHERE room_id = ?`).run(roomId);
  db.prepare(`DELETE FROM answers WHERE room_id = ?`).run(roomId);
  db.prepare(`DELETE FROM players WHERE room_id = ?`).run(roomId);
  db.prepare(`
    UPDATE rooms 
    SET status = 'waiting', current_feed_index = 0, round_timer = 60, feed_start_time = NULL, updated_at = ?
    WHERE room_id = ?
  `).run(Date.now(), roomId);
}

export default {
  getOrCreateRoom,
  setRoomHost,
  setPlayerReady,
  updateRoomStatus,
  getPlayersInRoom,
  getPlayer,
  getPlayerBySocket,
  getPlayerByUsername,
  findAvailableSeat,
  movePlayerToSeat,
  upsertPlayer,
  updatePlayerConnection,
  updatePlayerBet,
  updatePlayerChips,
  resetPlayerBets,
  lockAllBets,
  resetPlayerAnswerStatuses,
  recordAnswer,
  getAnswersForFeed,
  getPlayerAnswers,
  recordSettlement,
  getRoomSettlements,
  resetRoomSession,
};
