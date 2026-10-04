# AI Casino — Database Layout

> SQLite (`casino_multiplayer.db`, via `server/db.js`) is the **authoritative live store**
> for Round 1 tables. Supabase (`players` + `round1_tables` mirror) is the **global /
> cross-instance store** for profiles, leaderboard, and the host Tables bar.

## 1. Authority map

| Data | Authoritative store | Mirror / fallback |
|------|--------------------|-------------------|
| Round 1 rooms (table_01, table_02, …) | SQLite `rooms` | Supabase `round1_tables` (5s sync) |
| Seats / chips / bets / ready | SQLite `players` | — (6 seats/table) |
| Per-feed answers | SQLite `answers` | — |
| Final standings | SQLite `settlements` | — |
| Global profile + leaderboard | Supabase `players` | in-memory mock when no keys |
| Host tables overview | SQLite + `GET /api/round1/tables` | Supabase `round1_tables` |

## 2. SQLite schema (`server/db.js`)

File: `casino_multiplayer.db` (WAL mode). Constants: `MAX_TABLE_SEATS = 6`,
overflow prefix `table_` so full tables spill to `table_02`, `table_03`, …

### `rooms` — one row per table

```sql
CREATE TABLE rooms (
  room_id TEXT PRIMARY KEY,      -- 'table_01', 'table_02', ...
  room_code TEXT,
  host_id TEXT,
  status TEXT NOT NULL,          -- waiting | betting | playing | revealing | settled
  current_feed_index INTEGER DEFAULT 0,
  feed_start_time INTEGER,       -- epoch ms, used for speed multiplier
  round_timer INTEGER DEFAULT 60,
  created_at INTEGER,
  updated_at INTEGER
);
```

Helpers: getOrCreateRoom, setRoomHost, updateRoomStatus, resetRoomSession,
isRoomFull, findTableWithSpace (auto-overflow), listRoomsWithCounts.

### players — one row per seat

```sql
CREATE TABLE players (
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
```

Helpers: findAvailableSeat, upsertPlayer, movePlayerToSeat, setPlayerReady,
updatePlayerBet / updatePlayerChips / updatePlayerConnection, getPlayersInRoom.

### answers — one row per player per feed

```sql
CREATE TABLE answers (
  room_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  feed_index INTEGER NOT NULL,
  answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  time_taken REAL DEFAULT 0,
  multiplier INTEGER DEFAULT 1,
  net_delta INTEGER DEFAULT 0,
  submitted_at INTEGER,
  PRIMARY KEY (room_id, player_id, feed_index)
);
```

### settlements — one row per player when a table settles

```sql
CREATE TABLE settlements (
  room_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  bet_amount INTEGER NOT NULL,
  net_earnings INTEGER NOT NULL,
  final_chips INTEGER NOT NULL,
  settled_at INTEGER,
  PRIMARY KEY (room_id, player_id)
);
```

Note: getRoomSettlements JOINs settlements to players, so deleting a player
row hides its settlement (known BUG-013).

Relation summary: rooms 1-to-many players, answers, settlements.

## 3. Supabase schema

### players — global profiles and leaderboard (already used)

Used by GET /api/player/:username, POST /api/player/:username/state and
GET /api/leaderboard. Shape: username, chips, current_round, round1_score,
round2_score, round3_score, bonus_earnings, last_active.

This table has no room or seat columns, so it cannot store live tables.

### round1_tables — live tables mirror (NEW, run once)

Paste this in the Supabase SQL editor (idempotent):

```sql
create table if not exists public.round1_tables (
  room_id text primary key,
  room_code text,
  status text not null default 'waiting',
  current_feed_index integer not null default 0,
  occupied_seats integer not null default 0,
  active_seats integer not null default 0,
  total_seats integer not null default 6,
  has_space boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.round1_tables enable row level security;

drop policy if exists "public read round1_tables" on public.round1_tables;
create policy "public read round1_tables"
  on public.round1_tables for select using (true);

drop policy if exists "service write round1_tables" on public.round1_tables;
create policy "service write round1_tables"
  on public.round1_tables for all
  using (true) with check (true);
```

Server sync (server.js): syncRound1TablesToSupabase upserts
listRoomsWithCounts every 5 seconds. If the table is missing, sync is
skipped with a one-time console warning. GET /api/round1/tables returns
SQLite merged with the Supabase mirror so the host Tables bar survives
restarts.

## 4. Round 1 multi-table flow

1. Player joins table_01. findTableWithSpace keeps 6 seats per table and
   overflow auto-seats to table_02, table_03, and so on.
2. Host opens /host/round1?room=table_01. host_join creates the room row and
   the server returns tables_list (table_01..table_0N plus custom rooms).
3. The host Tables bar polls host_get_tables every 4s and fetches
   GET /api/round1/tables as a fallback, unioning both lists.
4. Clicking a table calls switchTable, which re-joins host_join and updates
   the ?room= URL param.
5. SKIP TABLE_X to ROUND 2 emits skip_to_round2 for that room only. Only
   that table's players finalize chips and advance.

## 5. Timers (Round 1)

Wager window 15s (WAGER_DURATION). Image feed 30s (IMAGE_FEED_DURATION).
Video feed 30s (VIDEO_FEED_DURATION). Multiplier tiers: 5s or less 5x,
10s or less 4x, 15s or less 3x, 20s or less 2x, otherwise 1x.

