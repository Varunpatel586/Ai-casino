# 🎰 AI Casino - Project Walkthrough & Development Log

This document serves as the continuous project walkthrough and activity log. It is updated after each prompt to track all requests, technical decisions, architectural updates, file modifications, and current status.

---

## 📌 Project Overview
- **Project Name:** AI Casino: The Ultimate Turing Test
- **Core Stack:** React 18, TypeScript, Vite, Tailwind CSS, Node.js, Express, Socket.io, SQLite (`casino_multiplayer.db`), Google Gemini API, Puter.js / Pollinations.
- **Repository Path:** `c:\Users\PRANAV ADVA\OneDrive\Desktop\Ai-casino`

---

## 📜 Activity Log & Prompts

### Entry 1: Walkthrough Tracking Initialization
- **Date & Time:** 2026-09-27 23:12 IST
- **User Prompt:**
  > *"here after all the prompts i put make a walkthrough file and constantly update it"*
- **Objective:**
  - Establish a comprehensive, continuously updated walkthrough document (`WALKTHROUGH.md`).
  - Standardize log format across all subsequent prompts and development tasks.
- **Actions Taken:**
  - Inspected repository structure, dependencies, configuration files, and project documentation (`README.md`, `.planning/PROJECT.md`).
  - Created [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md) at the project root with structured sections:
    - Overview & Tech Stack
    - Detailed Chronological Prompt Log
    - File Change Tracker
    - Next Steps & System Readiness
- **Files Modified / Created:**
  - Created: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete & Ready for ongoing updates.

---

### Entry 2: Implementation Planning Protocol & Approval Gate
- **Date & Time:** 2026-09-27 23:16 IST
- **User Prompt:**
  > *"and also create an implementation md file and start implementing once i confirm to proceed for new changes"*
- **Objective:**
  - Establish a formalized implementation planning process.
  - Require explicit user confirmation before any code changes are implemented for new features.
- **Actions Taken:**
  - Created [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md) at the project root with structured sections for active plans, execution checklists, file targets, and approval gates.
  - Configured workspace agent rule [`.agents/rules/walkthrough.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.agents/rules/walkthrough.md) to permanently enforce:
    1. Always drafting new changes in `IMPLEMENTATION.md` first.
    2. Pausing and requesting user confirmation to proceed before modifying code.
    3. Logging all activities in `WALKTHROUGH.md`.
- **Files Modified / Created:**
  - Created: [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md)
  - Updated: [`.agents/rules/walkthrough.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.agents/rules/walkthrough.md)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete & Protocol active.

---

### Entry 3: Round 1 3D Background Replacement Planning
- **Date & Time:** 2026-09-27 23:26 IST
- **User Prompt:**
  > *"Right now the 3d model used in the background of round 1 needs to be static so instead of render the entire 3d model just take an image and use it as the background to minimize the computation"*
- **Objective:**
  - Formulate an implementation plan to replace the high-overhead Sketchfab WebGL 3D iframe in Round 1 with an optimized static image.
  - Comply with approval protocol: document plan in `IMPLEMENTATION.md` and await confirmation before modifying any code.
- **Actions Taken:**
  - Analyzed the codebase and identified both locations embedding the Sketchfab 3D model:
    - [`src/components/MultiplayerRound1.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/components/MultiplayerRound1.tsx) (Player interface)
    - [`src/host/HostRound1Controller.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/host/HostRound1Controller.tsx) (Host interface)
  - Authored a comprehensive plan in [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md) specifying:
    - Problem analysis & performance bottleneck diagnosis.
    - Proposed architecture with static high-resolution casino table image asset and responsive CSS overlays.
    - 5-step task checklist and verification plan.
- **Files Modified / Created:**
  - Updated: [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete (Plan drafted & approved).

---

### Entry 4: Round 1 3D Model Replacement Execution
- **Date & Time:** 2026-09-27 23:44 IST
- **User Prompt:**
  > *"yes you can proceed"*
- **Objective:**
  - Execute approved plan from `IMPLEMENTATION.md`: Replace heavy Sketchfab WebGL 3D iframe with an optimized, photorealistic static table background image.
- **Actions Taken:**
  - **Asset Creation:** Generated a high-definition luxury casino blackjack table image with dark neon ambiance, rich felt texture, and mahogany border, saving it to [`public/images/blackjack-table-bg.jpg`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/public/images/blackjack-table-bg.jpg).
  - **Player View Update:** Modified [`src/components/MultiplayerRound1.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/components/MultiplayerRound1.tsx) to replace the interactive Sketchfab iframe with a responsive, non-interactive `<img>` element styled with `object-cover`, subtle darkening, and dark radial vignette shadows.
  - **Host View Update:** Modified [`src/host/HostRound1Controller.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/host/HostRound1Controller.tsx) with the same high-performance static image structure.
  - **Verification:** Ran `npm run build` to confirm production bundle passes cleanly with zero errors or warnings (built in 7.07s).
  - **Documentation:** Updated [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md) (marked all steps completed) and logged execution in [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md).
- **Files Modified / Created:**
  - Created: [`public/images/blackjack-table-bg.jpg`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/public/images/blackjack-table-bg.jpg)
  - Updated: [`src/components/MultiplayerRound1.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/components/MultiplayerRound1.tsx)
  - Updated: [`src/host/HostRound1Controller.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/host/HostRound1Controller.tsx)
  - Updated: [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** ✅ Completed, Verified, and Production Ready.

### Entry 5: Backend Terminal Execution Guidance
- **Date & Time:** 2026-09-28 15:22 IST
- **User Prompt:**
  > *"give me commands to run the the backends on the terminal"*
- **Objective:**
  - Provide terminal commands and architectural explanation for running the project's backend servers.
- **Actions Taken:**
  - Inspected `package.json`, `server.js`, and `src/host/startHost.js`.
  - Documented primary backend commands:
    - `npm run server` (Unified backend: Express HTTP API, AI Proxies, Round 1 Socket.IO multiplayer, and Round 3 WebSocket Turing Test server on port 8080).
    - `npm run host` (Standalone Round 3 Turing Test host server on port 8080).
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 6: Full Game Execution Commands Guidance
- **Date & Time:** 2026-09-28 20:35 IST
- **User Prompt:**
  > *"give me commands to run the game"*
- **Objective:**
  - Provide clear, end-to-end instructions and terminal commands to run both the frontend and backend of the AI Casino game locally.
- **Actions Taken:**
  - Inspected [`package.json`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/package.json), [`vite.config.ts`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/vite.config.ts), [`server.js`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/server.js), and [`src/App.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/App.tsx).
  - Outlined the dual-terminal workflow:
    1. Backend: `npm run server` (port 8080 for Express API, SQLite, Round 1 Socket.io Blackjack, and Round 3 Turing test WebSockets).
    2. Frontend: `npm run dev` (Vite dev server at `http://localhost:5174`).
  - Documented key URLs for players (`/`, `/play`) and hosts (`/host`, `/operator-setup`).
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 7: Clear Port 5174 Conflict & Live Dev Server Execution
- **Date & Time:** 2026-09-28 21:05 IST
- **User Prompt:**
  > *"fix the error and directly run the code in terminal by yourself and clear the extra localhost terminal of port 5174 that is already in use. and host this again on a free port without mistakes."*
- **Objective:**
  - Terminate orphaned process locking port 5174.
  - Eliminate strict port locking in `vite.config.ts` so Vite seamlessly falls back to free ports without collision errors.
  - Launch Vite dev server directly in the terminal and verify both frontend and backend functionality.
- **Actions Taken:**
  - Diagnosed TCP connection table: Identified PID 48888 locking port 5174.
  - Terminated PID 48888 with `Stop-Process -Force`.
  - Modified [`vite.config.ts`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/vite.config.ts): Changed `strictPort: false` and removed hardcoded HMR client port restrictions.
  - Launched `npm run dev` as a background daemon process.
  - Tested endpoints:
    - Frontend (`http://localhost:5174/`): HTTP 200 OK, full HTML & compiled module scripts served.
    - Backend (`http://localhost:8080/api/leaderboard`): HTTP 200 OK, active database responses.
- **Files Modified / Created:**
  - Updated: [`vite.config.ts`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/vite.config.ts)
  - Updated: [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** ✅ Completed, Verified, and Live.

---

### Entry 8: EADDRINUSE Port 8080 Diagnosis & Server Lifecycle Commands
- **Date & Time:** 2026-09-28 21:52 IST
- **User Prompt:**
  > *"now give all commands to run this"*
- **Objective:**
  - Clarify the cause of `EADDRINUSE :::8080` (the backend was already active on PID 47552).
  - Provide complete PowerShell and npm command references for checking, stopping, and running the game servers.
- **Actions Taken:**
  - Verified network listeners via `Get-NetTCPConnection`:
    - Port 8080 active on PID 47552 (`server.js`).
    - Port 5174 active on PID 33528 (`vite`).
  - Confirmed both services are responding with HTTP 200 OK.
  - Formulated full command reference for starting, killing, and verifying the game servers.
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 9: Terminate Stale Port 8080 Process & Fresh Backend Launch
- **Date & Time:** 2026-09-28 22:28 IST
- **User Prompt:**
  > *"Please completely terminate any processes currently occupying port 8080 and kill any stale background server sessions. Once cleared, start up the backend server cleanly in a fresh terminal instance."*
- **Objective:**
  - Terminate any process occupying port 8080.
  - Verify port 8080 is free.
  - Relaunch the backend server (`npm run server`) in a fresh background terminal instance.
- **Actions Taken:**
  - Identified PID 47552 bound to port 8080; terminated with `Stop-Process -Force`.
  - Confirmed port 8080 is free (no TCP listeners).
  - Started fresh backend instance (`npm run server`) as PID 15932.
  - Verified startup log: `Server running on port 8080 (HTTP + WebSockets)`.
  - Verified API response via `curl.exe http://localhost:8080/api/leaderboard` (HTTP 200, valid JSON).
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 10: Reset Backend Server & Clean Fresh Launch
- **Date & Time:** 2026-09-28 22:36 IST
- **User Prompt:**
  > *"remove this server again generating error and load this in a fresh new server"*
- **Objective:**
  - Terminate the background server task holding port 8080.
  - Launch a completely fresh, isolated backend server instance.
  - Verify zero port collisions and confirmed HTTP 200 health responses.
- **Actions Taken:**
  - Cancelled background daemon task `task-148`.
  - Verified port 8080 was fully released.
  - Launched fresh backend server (`task-181`, PID 49736).
  - Validated clean startup log: `Server running on port 8080 (HTTP + WebSockets)`.
  - Confirmed HTTP 200 API response (`/api/leaderboard`).
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 11: Release Port 8080 for Direct User Terminal Execution
- **Date & Time:** 2026-09-28 22:49 IST
- **User Action:**
  - Ran `Stop-Process -Id 49736 -Force` to release port 8080.
- **Objective:**
  - Confirm background server termination and verify port 8080 is available for the user to run directly in their IDE terminal.
- **Actions Taken:**
  - Confirmed PID 49736 exited successfully.
  - Verified with `Get-NetTCPConnection` that port 8080 is 100% free with zero active listeners.
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 12: Terminal Error Diagnostics & Solution Guide
- **Date & Time:** 2026-09-29 22:43 IST
- **User Prompt:**
  > *"why is the following error occuring in the terminal provide some solutions for the following ereroer"*
- **Objective:**
  - Detail root causes and actionable solutions for all messages/errors emitted in the terminal:
    1. `Error: listen EADDRINUSE: address already in use :::8080` (Port conflict when another server process is already running).
    2. `⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is not set in .env!` (Fallback warning, non-fatal; local SQLite is active).
    3. `[Multiplayer] Auto-resetting stale active/settled room on startup` (Self-healing database recovery routine).
  - Verify current status of running processes (Port 8080 active on PID 21496; Port 5174 awaiting `npm run dev`).
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 13: Supabase .env Configuration Clarification
- **Date & Time:** 2026-09-29 22:46 IST
- **User Prompt:**
  > *"SUPABASE_URL or SUPABASE_ANON_KEY is not set in .env! Database features will not work. do i have to add an .env file to this"*
- **Objective:**
  - Clarify whether a `.env` file containing Supabase credentials is mandatory to run the game.
- **Actions Taken:**
  - Analyzed [`server.js`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/server.js) and [`server/db.js`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/server/db.js).
  - Confirmed that Supabase is purely optional for remote cloud database hosting.
  - Documented that the local SQLite database (`casino_multiplayer.db`) and in-memory mock player storage handle all game features (multiplayer blackjack, betting, chips, scoring, WebSocket communication) with zero configuration.
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 14: Environment File Configuration for Deployment
- **Date & Time:** 2026-09-29 23:03 IST
- **User Prompt:**
  > *"we need to deploy this project online to vercel so here is the .env file please add this file without any changes or errors..."*
- **Objective:**
  - Create the [`.env`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.env) configuration file with exact user-supplied API keys and endpoints for online deployment.
- **Actions Taken:**
  - Verified [`.gitignore`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.gitignore) securely ignores `.env` from git commits.
  - Created [`.env`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.env) containing all specified Groq, Gemini, Supabase, HuggingFace, and Render backend/websocket endpoints without alterations.
  - Executed `npm run build` to confirm production bundling succeeds with the new configuration (passed cleanly in 5.50s).
- **Files Modified / Created:**
  - Created: [`.env`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.env)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 15: Analysis & Solutions for Concurrent npm run server Collision
- **Date & Time:** 2026-09-29 23:10 IST
- **User Prompt:**
  > *"now check why this error is occuring in terminal for npm run server provide some solutions to resolve this error"*
- **Objective:**
  - Identify the exact root cause of `EADDRINUSE: address already in use :::8080`.
  - Provide immediate commands to swap from the old server instance to the new `.env`-enabled server instance.
  - Provide architectural solutions to prevent port collisions in future sessions.
- **Actions Taken:**
  - Inspected TCP listeners and process tree: Identified PID 21496 (`node server.js`) running continuously since 22:39 (30+ minutes).
  - Confirmed the user's second command connected to Supabase successfully before hitting the collision with the older instance.
  - Documented stop command (`Stop-Process -Id 21496 -Force`) and automated port management options.
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 16: PID Transition Diagnosis & Live Supabase Verification
- **Date & Time:** 2026-09-29 23:20 IST
- **User Prompt:**
  > *"check why can he not find the process why cannot we stop the old server"*
- **Objective:**
  - Diagnose why `Stop-Process -Id 21496` failed with "Cannot find process" and why `EADDRINUSE` still occurred on subsequent runs.
- **Actions Taken:**
  - Executed `netstat -ano | findstr :8080` and inspected Win32_Process objects:
    - PID 21496 had already terminated.
    - A new server instance (PID 49636) was successfully launched at 23:16:02 with `.env` active.
    - Subsequent `npm run server` calls attempted to bind port 8080 concurrently with the active PID 49636.
  - Verified live endpoint `http://localhost:8080/api/leaderboard`:
    - Returned live Supabase cloud leaderboard (`gametest2`, `Jinay`, `pranav`, etc.).
  - Formulated clean process termination patterns (`npx kill-port 8080`) and verified that the backend is already fully operational.
- **Files Modified / Created:**
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** Complete.

---

### Entry 17: Comprehensive README Overhaul for New Game Architecture & GitHub Push
- **Date & Time:** 2026-09-29 23:32 IST
- **User Prompt:**
  > *"push these new changes in my github repo and also include a readme file according to new game"*
- **Objective:**
  - Rewrite [`README.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/README.md) to comprehensively document the complete game system:
    - 6-Player Real-Time Multiplayer Video Showdown (Round 1) with synchronized challenge feeds, chip betting ($10, $25, $50, ALL IN), seat pods (`S1` to `S6`), and host controls.
    - Side-Action Intermission Casino Tables across Stage I, II, and III (Neural Wheel, Cyber Blackjack, Quantum Dice, Data Pattern Dash, Cyber Minefield, and Vault Decryption).
    - Reverse Prompt Engineering Duel (Round 2) with 6-tier AI image generation fallback waterfall.
    - The Turing Test (Round 3) with 70/30 AI-to-Human split featuring Gemini 1.5 Flash, Groq Llama 3 backup, and live WebSocket human host console.
    - Dual Database Architecture (Cloud Supabase persistence with local SQLite auto-healing failover).
    - Unified Host Command Center (`/host`) covering table operations and Turing test operator queue.
    - Full setup, environment configuration, and Vercel/Render deployment workflows.
  - Verify that sensitive files (`.env`, `*.db`, `*.db-shm`, `*.db-wal`) remain strictly ignored by `.gitignore`.
  - Stage, commit, and push all repository changes to GitHub (`origin/main`).
- **Files Modified / Created:**
  - Updated: [`README.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/README.md)
  - Updated: [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md)
  - Updated: [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md)
- **Status:** ✅ Complete & Ready for Push.

---

## 📂 Key File Map
| File | Role |
| :--- | :--- |
| [`WALKTHROUGH.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/WALKTHROUGH.md) | Living walkthrough and change log |
| [`IMPLEMENTATION.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/IMPLEMENTATION.md) | Implementation plans & pre-execution approval gate |
| [`.agents/rules/walkthrough.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.agents/rules/walkthrough.md) | Enforced agent workflow rules |
| [`.env`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/.env) | Environment variables for APIs, Supabase, and Render backend |
| [`README.md`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/README.md) | Project architecture and deployment guide |
| [`server.js`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/server.js) | Full backend server (Express + Socket.io + WebSocket + AI Proxies) |
| [`src/host/startHost.js`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/host/startHost.js) | Standalone Turing Test Round 3 WebSocket host |
| [`src/App.tsx`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/App.tsx) | Frontend client routing and screen states |
| [`src/`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/src/) | Frontend client source code |
| [`package.json`](file:///c:/Users/PRANAV%20ADVA/OneDrive/Desktop/Ai-casino/package.json) | Dependencies and run scripts |

---

## 🚀 Next Steps
- Verify push to GitHub `origin/main`.
- Frontend dev server: `npm run dev`.
- Backend server: currently active on port 8080 (PID 49636).




