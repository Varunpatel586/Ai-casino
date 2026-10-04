# AI Casino - Comprehensive Bug Report

> Generated: 2026-10-01 | Scope: Full codebase audit

---

## CRITICAL BUGS

### BUG-001 - `npm run host` exits immediately (no Vite server running)

**File:** `scripts/launchHost.js`
**Severity:** Critical

The `launchHost.js` script ONLY opens the browser. It does NOT start the Vite dev server.
When you run `npm run host`, Node prints the banner, opens the browser, then EXITS immediately.

Fix: `launchHost.js` must spawn `vite --host` as a child process and keep alive.

---

### BUG-002 - `server.js` uses `WebSocket.OPEN` without importing `WebSocket`

**File:** `server.js`, Lines 328, 346, 360, 387, 430, 449, 463
**Severity:** Critical - ReferenceError at runtime

```js
// CRASHES: WebSocket is not imported, only WebSocketServer is
if (host && host.readyState === WebSocket.OPEN) { // ReferenceError
```

Fix: `import { WebSocketServer, WebSocket } from 'ws';`

---

### BUG-003 - Two Parallel WebSocket Systems (Architecture)

**Severity:** Critical - host and players never truly communicate

- Round 1: Socket.IO via `multiplayerSocket.ts` -> `/round1` namespace
- Round 3/Chat: raw WebSocket via `network.ts` -> `ws://host:8080`
- HostApp.tsx + HostChatInterface.tsx: raw WS (network_manager)
- HostRound1Controller.tsx: Socket.IO (multiplayerSocket)

These are two completely separate connection pools. Players in Round 1 are invisible to
the host chat system and vice versa. Fix: unified server-side routing via Socket.IO namespaces.

---

### BUG-004 - `HostChatInterface.tsx` Duplicates Message Handlers

**File:** `src/host/HostChatInterface.tsx`, Lines 49-104
**Severity:** High

`player-joined`, `player-left`, and `player-list` are each handled TWICE in the same
message callback, causing double state updates.

---

### BUG-005 - `HostChatInterface` sends double-encoded JSON

**File:** `src/host/HostChatInterface.tsx`, Line 141
**Severity:** High

```tsx
// send_chat_message already JSON.stringifies internally -> double encoding
network_manager.send_chat_message(JSON.stringify(messageData));
```

Player receives the message content as a JSON string literal instead of readable text.

---

### BUG-006 - `WebSocketHost.js` uses `WebSocket.OPEN` without import

**File:** `src/host/WebSocketHost.js`, Line 91
**Severity:** High - same issue as BUG-002

---

### BUG-007 - `WebSocketHost.js` player-list message missing `type` field

**File:** `src/host/WebSocketHost.js`, Lines 186-189
**Severity:** High

```js
this.sendToClient(this.hostClient, {
  players,  // Missing type: 'player-list' -> silently dropped by client
  timestamp: Date.now()
});
```

---

## MEDIUM BUGS

### BUG-008 - `network.ts` sends empty username if set_username not called first

**File:** `src/services/network.ts`
**Severity:** Medium

`this.username` is used in `onopen` handler but declared after the method. If player connects
before calling `set_username()`, an empty string is sent in the player-join message.

---

### BUG-009 - Production backend URL in `.env` risks hitting Render server locally

**File:** `.env` line 10
**Severity:** Medium

`VITE_BACKEND_URL=https://ai-casino.onrender.com` - if `isLocalEnvironment()` ever returns
false (non-standard hostname), the app hits production instead of local `localhost:8080`.

---

### BUG-010 - `HostApp.tsx` re-registers as host on every WebSocket reconnect

**File:** `src/host/HostApp.tsx`, Lines 41-55
**Severity:** Medium

`register-host` fires on every reconnect, overriding any existing host session.

---

## MINOR / CODE QUALITY

### BUG-011 - `HostRound1Controller.tsx` missing `socket.off()` cleanup

**File:** `src/host/HostRound1Controller.tsx`, Lines 118-121

Socket.IO listeners are never removed on unmount -> listener accumulation on tab switch.

---

### BUG-012 - `onKeyPress` is deprecated (React 17+)

**Files:** `src/host/HostApp.tsx:345`, `src/host/HostChatInterface.tsx:325`

Use `onKeyDown` instead.

---

### BUG-013 - Settlement table JOIN fails if player row deleted

**File:** `server/db.js`

`getRoomSettlements` JOINs settlements with players. If player is removed, settlement
record disappears.

---

### BUG-014 - `.env` contains real API keys (Security)

Groq, Gemini, HuggingFace, and Supabase keys are committed. Add `.env` to `.gitignore`
and rotate keys immediately.

---

## Summary

| ID | File | Severity |
|----|------|----------|
| BUG-001 | `scripts/launchHost.js` | Critical |
| BUG-002 | `server.js` | Critical |
| BUG-003 | Architecture | Critical |
| BUG-004 | `HostChatInterface.tsx` | High |
| BUG-005 | `HostChatInterface.tsx` | High |
| BUG-006 | `WebSocketHost.js` | High |
| BUG-007 | `WebSocketHost.js` | High |
| BUG-008 | `network.ts` | Medium |
| BUG-009 | `.env` | Medium |
| BUG-010 | `HostApp.tsx` | Medium |
| BUG-011 | `HostRound1Controller.tsx` | Low |
| BUG-012 | Multiple components | Low |
| BUG-013 | `server/db.js` | Low |
| BUG-014 | `.env` | Security |
