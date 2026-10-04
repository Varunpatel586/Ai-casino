# AI Casino - Local Development Setup Guide

## Prerequisites

- Node.js >= 18
- npm

## Quick Start (3 terminal approach)

### Terminal 1 — Frontend (Vite)
```powershell
cd "C:\path\to\ai-casino"
npm run dev
# Starts on http://localhost:5174
```

### Terminal 2 — Backend (Express + WebSocket + Socket.IO)
```powershell
cd "C:\path\to\ai-casino"
npm run server
# Starts on http://localhost:8080
# WebSocket: ws://localhost:8080
# Socket.IO: http://localhost:8080/round1
```

### Terminal 3 — Host Command Center (opens browser)
```powershell
cd "C:\path\to\ai-casino"
npm run host
# Detects running servers and opens http://localhost:5174/host
```

## OR: Single Command (npm run host handles everything)

After the fix to `scripts/launchHost.js`, running just:
```powershell
npm run host
```
Will automatically:
1. Start Vite dev server (if not running)
2. Start the backend server (if not running)
3. Open the host controller in the browser
4. Keep all processes alive until Ctrl+C

## Ports

| Service | Port | Protocol |
|---------|------|----------|
| Vite Frontend | 5174 | HTTP |
| Express REST API | 8080 | HTTP |
| Raw WebSocket (Round 3 Chat) | 8080 | WS |
| Socket.IO (Round 1 Multiplayer) | 8080 | Socket.IO |

## URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5174/ | Player / Contestant client |
| http://localhost:5174/host | Host command center (all tabs) |
| http://localhost:5174/host/round1 | Round 1 multiplayer controller |
| http://localhost:5174/host/chat | Round 3 Turing test chat |
| http://localhost:8080/api/leaderboard | REST leaderboard API |
| http://localhost:8080/api/player/:username | Player API |

## Environment Variables

Copy `.env.example` to `.env` (or edit existing `.env`):

```env
# ---- SERVER SIDE (not exposed to browser) ----
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...

# HuggingFace keys for image generation proxy
VITE_HF_API_KEY_1=hf_...
VITE_HF_API_KEY_2=hf_...
VITE_HF_API_KEY_3=hf_...

# ---- CLIENT SIDE (prefixed with VITE_) ----
VITE_GEMINI_API_KEY=...
VITE_GROQ_API_KEY_1=gsk_...
VITE_GROQ_API_KEY_2=gsk_...
VITE_GROQ_API_KEY_3=gsk_...

# Production backend (used only when NOT on localhost)
VITE_BACKEND_URL=https://ai-casino.onrender.com
VITE_WS_URL=wss://ai-casino.onrender.com
```

**SECURITY:** `.env` must be in `.gitignore`. Do NOT commit API keys.

## How Host + Player Connect (via Server)

### Round 1 (Multiplayer Betting Game)
- Both host and players connect via **Socket.IO** to `http://localhost:8080/round1`
- Host emits `host_join` -> server registers them in `hostSockets` Map
- Players emit `join_table` -> server assigns seats, broadcasts `table_state` to everyone
- All game events (`place_bet`, `submit_answer`, `feed_revealed`) flow through the server

### Round 3 (Turing Test Chat)
- Both host and players connect via **raw WebSocket** to `ws://localhost:8080`
- Host sends `register-host` message -> server marks them as `ws.isHost = true`
- Players send `player-join` -> server adds them to the `players` Map
- Host can broadcast to all players or send `private-message` to a specific `targetPlayerId`
- Players send `player-private-message` -> server forwards to the host only

### Connection is via SERVER, NOT via Wi-Fi direct
All messages route through `localhost:8080`. Clients only need network access to the
server machine. The server acts as the relay/broker between host and players.

## Debugging Tips

All connections log to the **server console** (Terminal 2):
```
[Server] Starting AI Casino backend...
[WS] New connection from ::1
[WS] Assigned clientId: client-1727780000000-ab12
[WS] Message type='register-host' from clientId=client-1727780000000-ab12 isHost=false
[WS] Host registered: clientId=client-1727780000000-ab12 | Players currently connected: 0
[WS] Player joined: clientId=client-1727780000001-cd34 username='Alice'
[WS] Notified host of player-left: client-1727780000001-cd34
```

All client-side events log to the **browser console**:
```
[HostApp] Initializing host connection. localId: host-1727780000000
[HostApp] Connection status changed: connected=true message='Connected to server'
[HostApp] Registering as host with name: Alice
[HostApp] Received message: player-joined { clientId: '...', username: 'Bob' }

[HostRound1] Connecting as host to room: table_01 hostId: host-...
[HostRound1] Socket connected, joining as host...
[HostRound1] table_state received: status= waiting feed= 0 players= 0

[Network] WebSocket connected successfully to: ws://localhost:8080
[Network] isHost: false | username: Bob
[Network] Sending player-join as: Bob
```
