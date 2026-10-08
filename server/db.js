import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'casino_multiplayer.db');

// Maximum players allowed per Round 1 table.
// Keep 6 seats per table; overflow players auto-assign to table_02, table_03, ...
export const MAX_TABLE_SEATS = 6;

// Prefix used for auto-created overflow tables (table_01 is the default table).
export const OVERFLOW_TABLE_PREFIX = 'table_';

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

export function updateRoomStatus(roomId, status, currentFeedIndex = 0, roundTimer = 45, feedStartTime = undefined) {
  if (feedStartTime !== undefined) {
    const stmt = db.prepare(`
      UPDATE rooms 
      SET status = ?, current_feed_index = ?, round_timer = ?, feed_start_time = ?, updated_at = ?
      WHERE room_id = ?
    `);
    stmt.run(status, currentFeedIndex, roundTimer, feedStartTime, Date.now(), roomId);
  } else {
    const stmt = db.prepare(`
      UPDATE rooms 
      SET status = ?, current_feed_index = ?, round_timer = ?, updated_at = ?
      WHERE room_id = ?
    `);
    stmt.run(status, currentFeedIndex, roundTimer, Date.now(), roomId);
  }
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

export function countActiveSeats(roomId) {
  const existing = getPlayersInRoom(roomId);
  // Count connected humans + bots occupying seats; disconnected humans are reclaimable.
  return existing.filter((p) => p.connected === 1 || String(p.player_id || '').startsWith('bot-')).length;
}

export function isRoomFull(roomId, maxSeats = MAX_TABLE_SEATS) {
  const existing = getPlayersInRoom(roomId);
  if (existing.length < maxSeats) return false;
  // Table is full if every seat is taken by a connected human or a bot.
  // Bots count as permanent seat occupants — they do NOT free up seats for incoming players.
  // Only truly disconnected human seats (connected === 0) are reclaimable.
  const reclaimable = existing.filter(
    (p) => p.connected === 0 && !String(p.player_id || '').startsWith('bot-')
  );
  return reclaimable.length === 0;
}

function parseTableNumber(roomId) {
  const match = String(roomId || '').match(/(\d+)\s*$/);
  if (!match) return null;
  const num = Number.parseInt(match[1], 10);
  return Number.isFinite(num) ? num : null;
}

function formatTableId(prefix, num) {
  return `${prefix}${String(num).padStart(2, '0')}`;
}

/**
 * Find the first table with a free (or reclaimable) seat, starting at requestedRoomId.
 * Overflow tables are auto-created as table_02, table_03, ... so table 1 stays capped at 6.
 * Returns { roomId, created } — created is true when we moved past the requested table.
 */
export function findTableWithSpace(requestedRoomId = 'table_01', maxSeats = MAX_TABLE_SEATS, maxTables = 50) {
  const requested = String(requestedRoomId || 'table_01').toLowerCase().replace(/\s+/g, '-');
  if (!isRoomFull(requested, maxSeats)) {
    getOrCreateRoom(requested);
    return { roomId: requested, created: false, overflow: false };
  }

  const baseNum = parseTableNumber(requested);
  // If the requested id isn't numeric (custom room code), fall back to table_02, table_03, ...
  const prefix = baseNum === null ? OVERFLOW_TABLE_PREFIX : requested.replace(/\d+\s*$/, '');
  const startNum = baseNum === null ? 2 : baseNum + 1;

  for (let n = startNum; n < startNum + maxTables; n++) {
    const candidate = formatTableId(prefix, n);
    if (!isRoomFull(candidate, maxSeats)) {
      getOrCreateRoom(candidate);
      return { roomId: candidate, created: true, overflow: true };
    }
  }

  // All overflow tables full — return requested so caller emits TABLE_FULL.
  return { roomId: requested, created: false, overflow: false };
}

export function listRoomsWithCounts(minTables = 3) {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY room_id ASC').all();
  const byId = new Map(rooms.map((r) => [r.room_id, r]));

  // Always include table_01..table_0N so the host sees every table even
  // before any player/host has touched it (no DB row exists yet).
  // Also include any custom (non table_NN) rooms that do exist.
  const tableIds = new Set(rooms.map((r) => r.room_id));
  let highest = 0;
  for (const id of tableIds) {
    const m = String(id).match(/^table_0*(\d+)$/i);
    if (m) highest = Math.max(highest, Number.parseInt(m[1], 10));
  }
  const total = Math.max(minTables, highest);
  for (let n = 1; n <= total; n++) {
    tableIds.add(`table_${String(n).padStart(2, '0')}`);
  }

  return [...tableIds]
    .sort()
    .map((roomId) => {
      const room = byId.get(roomId);
      const players = getPlayersInRoom(roomId);
      const activeSeats = players.filter((p) => p.connected === 1 || String(p.player_id || '').startsWith('bot-')).length;
      return {
        room_id: roomId,
        room_code: room ? room.room_code : roomId,
        status: room ? room.status : 'waiting',
        current_feed_index: room ? room.current_feed_index : 0,
        total_seats: MAX_TABLE_SEATS,
        occupied_seats: players.length,
        active_seats: activeSeats,
        has_space: !isRoomFull(roomId),
        updated_at: room ? room.updated_at : null,
        exists: Boolean(room),
      };
    });
}
export function getPlayerByUsername(roomId, username) {
  const stmt = db.prepare('SELECT * FROM players WHERE room_id = ? AND username = ?');
  return stmt.get(roomId, username);
}

export function findAvailableSeat(roomId) {
  const existing = getPlayersInRoom(roomId);
  const occupiedSeats = new Set(existing.map(p => p.seat_number));
  for (let seat = 1; seat <= MAX_TABLE_SEATS; seat++) {
    if (!occupiedSeats.has(seat)) {
      return seat;
    }
  }
  // If all seats are taken, only reclaim seats from disconnected humans (NOT bots).
  // Bots are permanent occupants; the overflow system redirects new players to the next table.
  const disconnectedHuman = existing.find(p => p.connected === 0 && !p.player_id.startsWith('bot-'));
  if (disconnectedHuman) {
    db.prepare('DELETE FROM players WHERE room_id = ? AND player_id = ?').run(roomId, disconnectedHuman.player_id);
    return disconnectedHuman.seat_number;
  }
  return null; // Room is full
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
  MAX_TABLE_SEATS,
  OVERFLOW_TABLE_PREFIX,
  getOrCreateRoom,
  setRoomHost,
  setPlayerReady,
  updateRoomStatus,
  getPlayersInRoom,
  getPlayer,
  getPlayerBySocket,
  getPlayerByUsername,
  countActiveSeats,
  isRoomFull,
  findTableWithSpace,
  listRoomsWithCounts,
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
