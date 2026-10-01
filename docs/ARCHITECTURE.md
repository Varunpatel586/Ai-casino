# AI Casino - Project Architecture & Connection Model

## System Overview

```
+-------------------+         +-------------------+
|   VITE DEV SERVER |         |  EXPRESS + WS/IO  |
|   localhost:5174  |         |  localhost:8080   |
+-------------------+         +-------------------+
        |                              |
   Serves React SPA            REST API  /api/*
        |                              |
   Player Browser             Socket.IO /round1 (Multiplayer)
   Host Browser               Raw WS    /       (Chat/Round3)
```

## Connection Architecture (Fixed)

### Round 1 - Multiplayer Game (Socket.IO)
- Server namespace: `/round1` (multiplayerManager.js)
- Player client: `multiplayerSocket.ts` -> `io(serverUrl + '/round1')`
- Host client: `multiplayerSocket.joinAsHost(roomId, hostId)`
- Events: `join_table`, `host_join`, `place_bet`, `submit_answer`, `table_state`

### Round 3 - Turing Test Chat (Raw WebSocket)
- Server: raw WebSocket server on `ws://localhost:8080`
- Player client: `network_manager.connect_to_host(wsUrl)`
- Host client: `network_manager.connect_as_host(wsUrl)`
- Events: `player-join`, `register-host`, `chat`, `private-message`

## Key Files

| File | Role |
|------|------|
| `server.js` | Main server - Express + Socket.IO + raw WS |
| `server/multiplayerManager.js` | Round 1 game logic via Socket.IO |
| `server/db.js` | SQLite database via node:sqlite |
| `src/services/multiplayerSocket.ts` | Round 1 Socket.IO client |
| `src/services/network.ts` | Raw WebSocket client (Round 3 / Chat) |
| `src/services/apiConfig.ts` | URL resolver (local vs prod) |
| `src/host/HostRound1Controller.tsx` | Host UI for Round 1 |
| `src/host/HostChatInterface.tsx` | Host UI for Round 3 chat |
| `src/host/HostApp.tsx` | Host inbox / player claim UI |
| `src/host/UnifiedHostView.tsx` | Host tab navigator |
| `scripts/launchHost.js` | CLI launcher (opens browser) |

## npm Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite frontend on port 5174 |
| `npm run server` | Start Express/WS/Socket.IO backend on port 8080 |
| `npm run host` | Print host URLs and open browser (requires dev+server running) |

## Data Flow - Round 1

```
Player Browser                    Server (8080)                   Host Browser
     |                                  |                               |
     |--- join_table(roomId, userId) -->|                               |
     |                                  |--- table_state(state) ------->|
     |<-- seat_assigned(seatNum) -------|                               |
     |                                  |                               |
     | [Wager Phase]                    |                               |
     |<-- wager_phase_started ---------|                               |
     |--- place_bet(amount) ---------->|                               |
     |<-- table_state (all bets shown)-|--- table_state -------------->|
     |                                  |                               |
     | [Answer Phase]                   |                               |
     |<-- feed_started(video) ---------|--- feed_started ------------->|
     |--- submit_answer(feedIdx, ans)->|                               |
     |<-- feed_revealed(isAI, results)-|--- feed_revealed ------------>|
     |                                  |                               |
     | [Settlement]                     |                               |
     |<-- round_settled(standings) ----|--- round_settled ------------>|
```

## Data Flow - Round 3 Chat

```
Player Browser                    Server (8080)                   Host Browser
     |                                  |                               |
     |--- player-join(username) ------->|                               |
     |                                  |--- player-joined(id,name) --->|
     |                                  |<-- register-host -------------|
     |<-- host-available ---------------|                               |
     |                                  |                               |
     |--- player-private-message(msg)->|                               |
     |                                  |--- chat(content,sender) ----->|
     |                                  |<-- private-message(target) ---|
     |<-- chat(content) ---------------|                               |
```

## Environment Variables

```
# Backend (server.js only - not exposed to browser)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
VITE_HF_API_KEY_1=...
VITE_HF_API_KEY_2=...
VITE_HF_API_KEY_3=...

# Frontend (Vite exposes VITE_ prefix vars)
VITE_GEMINI_API_KEY=...
VITE_GROQ_API_KEY_1=...
VITE_GROQ_API_KEY_2=...
VITE_GROQ_API_KEY_3=...
VITE_BACKEND_URL=https://ai-casino.onrender.com  (production)
VITE_WS_URL=wss://ai-casino.onrender.com         (production)

# Local dev: apiConfig.ts auto-detects localhost and uses localhost:8080
```
