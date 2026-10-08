# 🛠️ Implementation Plan (`IMPLEMENTATION.md`)

This document outlines proposed architecture, feature plans, file modifications, and testing steps for upcoming changes to the AI Casino project.

> [!IMPORTANT]
> **Workflow Protocol:**
> 1. **Plan First:** Every new feature, bug fix, or architectural change is drafted and documented here first.
> 2. **Approval Gate:** Implementation **only begins after explicit user confirmation to proceed**.
> 3. **Execution & Log:** Once approved, tasks are executed, checklist items are checked off, and completed work is permanently logged in [`WALKTHROUGH.md`](WALKTHROUGH.md).

---

## 📋 Active Implementation Plan

### Plan 11: Human-Like Hinglish Persona & Realistic Typing Cadence for Round 3 AI Counterpart
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-10-08
- **Objective:**
  Prevent players from easily identifying the AI counterpart in Round 3 due to robotic giveaways (instant fast typing, excessive exclamation marks, formal grammar, and rigid title casing). Transition the AI to an authentic, casual human persona who speaks in conversational Hinglish (e.g., "hi kesa hai bhai", "kya chalra", "arre human hu lol"), types in casual lowercase, avoids exclamation marks, and simulates real human typing delays (3.5s – 5.5s).
- **Diagnosis & Feasibility:**
  - **Is this possible?** **Yes, 100% possible.** The AI conversational pipeline in [`src/services/gemini_chat.ts`](src/services/gemini_chat.ts) controls all LLM prompts, fallback dictionaries, and output post-processing.
  - The typing simulation and initial greeting in [`src/components/chat/ChatInterface.tsx`](src/components/chat/ChatInterface.tsx) currently use a fixed 1–3s delay and a formal English greeting (`"Hi there! I'm your chat partner. Let's have a conversation!"`), which can be swapped for human cadence and casual Hinglish greetings.
- **Detailed Solution Architecture:**
  1. **Prompt Engineering in [`src/services/gemini_chat.ts`](src/services/gemini_chat.ts):**
     - Update system prompts across all tiers (Puter, Pollinations, Gemini, Groq).
     - Instruct the AI: *"You are an Indian college student / casual gamer chatting on WhatsApp/Discord. Reply strictly in casual Hinglish (mix of Hindi and English words like 'bhai', 'yaar', 'kesa hai', 'kya scene', 'bol na', 'sahi hai'). Never use exclamation marks (!). Type in all lowercase. Keep replies super short (under 10 words). Never sound like an AI assistant."*
  2. **AI Output Sanitizer in `finalizeResponse` ([`src/services/gemini_chat.ts`](src/services/gemini_chat.ts)):**
     - Strips exclamation marks (`!`).
     - Normalizes text to casual lowercase.
     - Strips any AI-like quotation wrappers or assistant prefixes.
  3. **Authentic Hinglish Fallback Corpus (`generateFallbackResponse` in [`src/services/gemini_chat.ts`](src/services/gemini_chat.ts)):**
     - Replace all formal English fallback phrases with natural Hinglish replies:
       - Greetings: `"hi kesa hai bhai"`, `"yo bhai kya haal"`, `"haan bol na"`, `"hey kya chalra"`
       - Casual queries: `"badhiya tu bata"`, `"sab mast bhai tu kaisa hai"`, `"bas chalra yaar"`
       - Suspicions ("Are you AI/bot?"): `"arre human hu bhai kya bolra lol"`, `"mai bot thodi hu yaar"`, `"bhai real banda hu mai tu bot lagra mujhe"`
       - General: `"sahi hai bhai"`, `"hn wahi to"`, `"accha aisa kya"`, `"theek hai yaar"`
  4. **Human Typing Simulation & Greeting in [`src/components/chat/ChatInterface.tsx`](src/components/chat/ChatInterface.tsx):**
     - Change the initial greeting from `"Hi there! I'm your chat partner..."` to casual Hinglish: `"hi kesa hai bhai"`.
     - Upgrade typing delay from fixed 1–3s to realistic human typing cadence:
       - Reading buffer: ~1.5s – 2.0s
       - Typing duration based on response length: ~60ms per character + jitter
       - Total delay: ~3.5s – 5.5s, allowing the typing indicator (`"Subject transmitting..."`) to display naturally.
  5. **Scope Guard:**
     - Zero modifications to scoring, round limits, betting, host multiplayer, or any other game components.
- **Phased Execution Checklist:**
  - [x] **Phase 1: Update `gemini_chat.ts` Prompts & Post-processing**
    - Updated system prompts for Puter, Pollinations, Gemini, and Groq.
    - Implemented `finalizeResponse` post-sanitizer (lowercase, strip `!`, remove formal filler).
    - Rewrote `generateFallbackResponse` corpus in authentic Hinglish.
  - [x] **Phase 2: Update `ChatInterface.tsx` Greeting & Human Typing Cadence**
    - Set greeting to `"hi kesa hai bhai"`.
    - Implemented realistic human typing calculation (~3.5s - 5.5s).
  - [x] **Phase 3: Verification & Quality Assurance**
    - `npm run typecheck`: Passed with 0 errors.
    - `npm run build`: Succeeded in 6.31s with 0 errors.
    - Logged completion in `WALKTHROUGH.md`.

---

### Plan 10: Round 3 Partner Reply Delivery Synchronization Before Verdict Guess Modal
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-10-08
- **Objective:**
  In Round 3 ("The Turing Table"), ensure that all 3 replies from the counterpart (AI or Human host) are fully received, rendered, and readable in the chat before the "Identify Your Counterpart" verdict modal appears. Also ensure counterpart assignment probability is an exact 50/50 split between AI and Human.
- **Root Cause Analysis:**
  In [`src/components/Round3.tsx`](src/components/Round3.tsx) lines 433–440:
  `onSendMessage` triggered immediately when the user pressed Send on their 3rd query. A blind 2000ms timer expired before `get_ai_response()` completed its API roundtrip and simulated typing delay, causing the verdict modal to pop up prematurely and obscure the chat feed.
- **Architectural & Design Fix:**
  1. **Added `onReadyForVerdict?: () => void` prop to [`src/components/chat/ChatInterface.tsx`](src/components/chat/ChatInterface.tsx):**
     - Tracked the number of partner replies received (`repliesCountRef`) per interrogation subround.
     - In **AI mode**: when `get_ai_response()` finishes, the response is appended to messages, and typing completes:
       - Checks if `repliesCount >= messageLimit` (3 replies).
       - If so, waits 2.5 seconds so the player can comfortably read the counterpart's final reply, then triggers `onReadyForVerdict()`.
     - In **Human mode**: when host message is received in `network_manager.message_callback`:
       - Appends host reply to messages.
       - If `repliesCount >= messageLimit` (3 replies), waits 2.5 seconds to read, then triggers `onReadyForVerdict()`.
     - Input and send button are disabled while `isTyping` is true, preventing overlapping queries before each reply arrives.
  2. **Updated [`src/components/Round3.tsx`](src/components/Round3.tsx):**
     - Removed the premature timer from `onSendMessage`. `onSendMessage` now strictly updates `messagesSent`.
     - Added keying `key={'subround-' + currentRound + '-' + actualMode}` to ensure clean mount and state reset each subround.
     - Wired `onReadyForVerdict={() => setShowGuess(true)}` to `ChatInterface`.
     - Changed counterpart selection probability in `selectRandomMode`: `Math.random() < 0.5 ? 'ai' : 'human'` (50/50 split).
     - Kept all scoring, subround limits, bets, payouts, and other game elements completely untouched.
- **Phased Execution Checklist:**
  - [x] **Phase 1: Update `ChatInterface.tsx`**
    - Added `onReadyForVerdict?: () => void` to `ChatInterfaceProps`.
    - Maintained counterpart reply count (`repliesCountRef`) and timer cleanup.
    - Disabled input while waiting for partner response (`isTyping`).
    - Triggered `onReadyForVerdict()` after the 3rd reply is rendered + 2.5s reading delay.
  - [x] **Phase 2: Update `Round3.tsx`**
    - Removed premature 2s timeout in `onSendMessage`.
    - Passed `onReadyForVerdict={() => setShowGuess(true)}`.
    - Set 50/50 probability split in `selectRandomMode`: `Math.random() < 0.5 ? 'ai' : 'human'`.
  - [x] **Phase 3: Verification & Quality Assurance**
    - `npm run typecheck`: Passed with 0 errors.
    - `npm run build`: Succeeded in 6.32s with 0 errors.
    - Documented in `WALKTHROUGH.md`.

---

### Plan 9: Round 2 Image Similarity Scoring — Perceptual Multiplier Payouts
- **Status:** ✅ **Completed & Verified**
- **Date Completed:** 2026-10-04
- **Objective:**
  The Round 2 Reverse Prompt Engineering Duel generated an AI canvas from the contestant's prompt but never used it — scoring was a crude keyword match against the target image. Replace that with a real perceptual comparison of the ORIGINAL artwork vs the AI-GENERATED canvas, yielding a similarity percentage and a casino multiplier (100% => 5x, 90% => 4x, ... lower similarity => lower payout).
- **Architectural & Design Changes:**
  1. **New comparison service ([`src/services/imageSimilarity.ts`](src/services/imageSimilarity.ts)):** Client-side, dependency-free engine blending an average/difference perceptual hash (structure) with a normalized 3D RGB colour histogram (palette). Exposes `compareImages(originalUrl, generatedUrl)` and `similarityToMultiplier(score)`. Never throws — returns a neutral 1x fallback on any failure.
  2. **Multiplier tiers:** >=95% => 5x, 85-94% => 4x, 75-84% => 3x, 65-74% => 2x, 50-64% => 1x, <50% => 0x (wager lost). Net per artwork = `bet * (multiplier - 1)`.
  3. **Round 2 integration ([`src/components/Round1.tsx`](src/components/Round1.tsx)):** After generation, the canvas is appraised; the `comparison` phase now shows Similarity %, Multiplier and Payout, and the `results` phase shows a per-artwork breakdown plus the total payout.
  4. **Settlement ([`src/App.tsx`](src/App.tsx)):** `handleRound2Complete` now applies the summed net earnings from the appraisals.
- **Checklist Executed & Verified:**
  - [x] Step 1: `imageSimilarity.ts` service (hash + histogram blend + tier mapping)
  - [x] Step 2: Round 2 appraisal flow + UI (comparison + results phases)
  - [x] Step 3: `App.tsx` settlement update
  - [x] Step 4: Removed dead `Round2.tsx` component and unused `round2Videos`
- **Verification:** `npm run typecheck` (0 errors) and `npm run build` (success).


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
