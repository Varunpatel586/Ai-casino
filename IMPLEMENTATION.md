# 🛠️ Implementation Plan (`IMPLEMENTATION.md`)

This document outlines proposed architecture, feature plans, file modifications, and testing steps for upcoming changes to the AI Casino project.

> [!IMPORTANT]
> **Workflow Protocol:**
> 1. **Plan First:** Every new feature, bug fix, or architectural change is drafted and documented here first.
> 2. **Approval Gate:** Implementation **only begins after explicit user confirmation to proceed**.
> 3. **Execution & Log:** Once approved, tasks are executed, checklist items are checked off, and completed work is permanently logged in [`WALKTHROUGH.md`](WALKTHROUGH.md).

---

## 📋 Active Implementation Plan

### Plan 8: Puter Authentication & Contestant Free Credit Integration (Host Dashboard & Player Lobby)
- **Status:** ✅ **Completed & Fully Verified**
- **Date Completed:** 2026-10-01
- **Objective:**
  Integrate direct one-click Puter sign-up and authentication across both the Host Dashboard and the Contestant Lobby screen so that every player signs in to their own Puter account. This ensures their personal free credits are used for image generation (FLUX 1.1 Pro in Round 2) instead of consuming host / backend API quota.
- **Architectural & Design Changes:**
  1. **Player Start / Lobby Integration ([`src/components/UsernameScreen.tsx`](src/components/UsernameScreen.tsx)):**
     - Added a Puter Free Credit Auth card directly within the contestant moniker registration form.
     - When unauthenticated: Displays an interactive button: `⚡ Connect Puter (1-Click Free Sign-Up)` that triggers `window.puter.auth.signIn()`.
     - When authenticated: Displays a glowing emerald badge: `✅ Puter Connected as @{username} • Free Image Credits Active` with a disconnect / change account trigger.
     - Detects existing active Puter sessions on initial component mount via `window.puter.auth.isSignedIn()`.
  2. **Host Dashboard Integration ([`src/host/UnifiedHostView.tsx`](src/host/UnifiedHostView.tsx)):**
     - Added a dedicated **Puter & Players** tab (`puter`) alongside "Round 1 Table" and "Round 3 Turing".
     - Header quick-action pill showing current host Puter auth status.
     - Dedicated Puter management view providing:
       - Host station Puter status + sign-in / sign-out button.
       - Player station onboarding instructions to ensure zero host credit consumption.
       - Quick copyable links (`playerLobbyUrl` and `operatorSetupUrl`) with live clipboard copy feedback.
       - Interactive 6-player station readiness checklist.
  3. **Launcher Banner Synchronization ([`scripts/launchHost.js`](scripts/launchHost.js)):**
     - Included the dedicated Puter & Player Setup URL in the terminal launcher output (`npm run host`).
  4. **Documentation & Quality Assurance:**
     - Updated [`README.md`](README.md) and logged completion in [`WALKTHROUGH.md`](WALKTHROUGH.md).
     - Verified complete TypeScript compilation with `npm run typecheck` (0 errors).

- **Phased Execution Checklist Executed & Verified:**
  - [x] **Step 1: Integrate One-Click Puter Auth into Player Lobby ([`src/components/UsernameScreen.tsx`](src/components/UsernameScreen.tsx))**
    - Added state for Puter auth status and username.
    - Implemented `handlePuterSignIn` and `handlePuterSignOut`.
    - Rendered stylish cyberpunk Puter status / connect card.
  - [x] **Step 2: Add Puter Setup View & Status Pill to Host Dashboard ([`src/host/UnifiedHostView.tsx`](src/host/UnifiedHostView.tsx))**
    - Added 'puter' tab to navigation tabs.
    - Built operator Puter status and player onboarding card with copyable links.
    - Added interactive 6-station checklist.
  - [x] **Step 3: Quality & TypeScript Verification**
    - Validated with `npm run typecheck` (0 errors).
    - Verified UI rendering and sign-in behavior in browser.
    - Logged completion in `WALKTHROUGH.md`.

---

## 🗄️ Past Completed Plans

### Plan 7: Dedicated Host Command & Join Workflow (Remove Host Link from Player Dashboard & Lobby)
- **Status:** ✅ **Completed & Fully Verified**
- **Date Completed:** 2026-10-01
- **Summary:**
  Removed all host controller links from contestant-facing screens (Lobby/Username start screen and Round 1 table header), and established a dedicated CLI command (`npm run host`) and direct link (`http://localhost:5174/host`) with dynamic port detection for hosts to join and control the casino.
- **Checklist Executed & Verified:**
  - [x] Step 1: Sanitize Player Lobby Screen (`src/components/UsernameScreen.tsx`)
  - [x] Step 2: Sanitize Round 1 Player Table Header (`src/components/MultiplayerRound1.tsx`)
  - [x] Step 3: Create Host Launcher Script (`scripts/launchHost.js`) with dynamic port detection & Update `package.json`
  - [x] Step 4: Update Backend Startup Banner in `server.js` and Clarify `Round3.tsx`
  - [x] Step 5: Documentation & Verification (`npm run typecheck`, `npm run host`)

### Plan 6: Round 1 Dedicated Right-Side Live Leaderboard (Real-Time Player Rankings & Chip Balances)
- **Status:** ✅ **Completed & Fully Verified**
- **Date Completed:** 2026-09-30
- **Summary:**
  Added a dedicated, real-time Live Leaderboard on the right side of the screen during Round 1 for both Player and Host views:
  1. **Real-Time Player Rankings:** Sorts all seated players dynamically by their current chips in descending order (Rank #1 to #6).
  2. **Contestant Details:**
     - Rank badge (🥇 1st Gold, 🥈 2nd Silver, 🥉 3rd Bronze, #4-#6 Slate).
     - Seat identifier tag (`S1`..`S6`), username, `(YOU)` indicator for the current player, and `BOT` tag for automated players.
     - Live Chip Balance (`${player.chips}`) in bold amber/gold numbers with micro-animations.
     - Real-time round outcome delta badge (`+$60 ⚡3x` in glowing emerald or `-$10` in rose) whenever a challenge reveals.
     - In-round phase indicators: active wager (`Bet: $30`), answer status (`Locked ✓` vs `Thinking...`), and ready status in lobby.
  3. **Responsive Two-Column Layout:**
     - On desktop & wide screens (`lg:`/`xl:`): The 3D table takes ~75% width, while the right-side leaderboard docks neatly at ~25% width (~280-320px) without cramping table seats.
     - On mobile / smaller screens: A floating toggle pill (`🏆 Standings (6)`) that smoothly slides in the leaderboard drawer on demand.
  4. **Reusable Component Architecture:**
     - Created [`src/components/LiveLeaderboardSide.tsx`](src/components/LiveLeaderboardSide.tsx) accepting `players: PlayerSeat[]`, `currentFeedIndex: number`, `totalFeeds: number`, `status: string`, and `currentPlayerId?: string`.
     - Embedded in [`src/components/MultiplayerRound1.tsx`](src/components/MultiplayerRound1.tsx) and [`src/host/HostRound1Controller.tsx`](src/host/HostRound1Controller.tsx).

### Plan 5: Round 1 Overhaul — Per-Challenge Wager Flow, Speed Multipliers (3x/2x/1x), Instant Chip Settlements, and End-of-Round Winners Showcase
- **Status:** ✅ **Completed & Fully Verified**
- **Date Completed:** 2026-09-30
- **Summary:**
  Transformed Round 1 (AI vs Real) from a static single-bet round into an interactive, fast-paced casino loop across all 15 challenges (10 images + 5 videos):
  1. Per-Challenge Wager Phase (15s).
  2. Speed Multipliers (Images: $\le 10$s 3x, 10-20s 2x, >20s 1x; Videos: $\le 20$s 3x, 20-30s 2x, >30s 1x).
  3. Instant Chip Calculation & WebSocket Broadcast directly to seat pods with animated delta badges.
  4. Grand End-of-Round Winners Showcase (Podium 🥇🥈🥉, full leaderboard, celebratory timer).
  5. 10 Images → 5 Surveillance Videos transition banner.
- **Checklist Executed & Verified:**
  - [x] Step 1: Database & Backend Multiplier Logic (`server/db.js`, `server/multiplayerManager.js`)
  - [x] Step 2: Shared Types & Socket Service (`src/services/multiplayerSocket.ts`)
  - [x] Step 3: Player UI Integration (`src/components/MultiplayerRound1.tsx`)
  - [x] Step 4: Host View Integration (`src/host/HostRound1Controller.tsx`)
  - [x] Step 5: Frontend Routing & Next Round Progression (`src/App.tsx`)
  - [x] Step 6: Verification & Quality Assurance (`npm run typecheck` passed, `test_flow.js` passed)

---

## 🗄️ Past Completed Plans

### Plan 3: Update Documentation for New Game Architecture & Push to GitHub
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-09-29

---

## 🗄️ Past Completed Plans

### Plan 2: Clear Port Collision & Configure Flexible Port Selection
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-09-28
- **Summary:**
  Terminated orphaned node process holding port 5174 (PID 48888), adjusted `vite.config.ts` to disable `strictPort: true` and remove hardcoded HMR port bindings, and launched the Vite dev server directly in the background.
- **Checklist Executed:**
  - [x] **Step 1:** Identified process holding port 5174 (PID 48888) and killed it using PowerShell `Stop-Process`.
  - [x] **Step 2:** Updated [`vite.config.ts`](vite.config.ts) (`strictPort: false`, dynamic HMR) to prevent crashes if a port is temporarily occupied.
  - [x] **Step 3:** Launched Vite dev server directly in the terminal background (`npm run dev`).
  - [x] **Step 4:** Verified HTTP 200 OK responses from both frontend (`http://localhost:5174/`) and backend API (`http://localhost:8080/api/leaderboard`).
- **Files Modified:**
  - [`vite.config.ts`](vite.config.ts)

### Plan 1: Replace Resource-Heavy 3D WebGL Background with Static Image in Round 1
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-09-27
- **Summary:**
  Replaced the heavy Sketchfab WebGL 3D iframe in Round 1 with an ultra-high quality, responsive static blackjack table background image across both player and host interfaces.
- **Checklist Executed:**
  - [x] **Step 1:** Generated and copied high-fidelity casino blackjack table asset to `public/images/blackjack-table-bg.jpg`.
  - [x] **Step 2:** Replaced Sketchfab 3D WebGL iframe in [`src/components/MultiplayerRound1.tsx`](src/components/MultiplayerRound1.tsx) with responsive `<img>` and vignette shading.
  - [x] **Step 3:** Replaced Sketchfab 3D WebGL iframe in [`src/host/HostRound1Controller.tsx`](src/host/HostRound1Controller.tsx) with static image and overlays.
  - [x] **Step 4:** Validated production bundle build with `npm run build` (Passed cleanly, 0 errors, 7.07s).
- **Files Modified:**
  - `public/images/blackjack-table-bg.jpg`
  - [`src/components/MultiplayerRound1.tsx`](src/components/MultiplayerRound1.tsx)
  - [`src/host/HostRound1Controller.tsx`](src/host/HostRound1Controller.tsx)
- **Performance Impact:**
  - Eliminated GPU/WebGL render loop and iframe network overhead.
  - Instant background load time with zero frame drops or battery drain.
