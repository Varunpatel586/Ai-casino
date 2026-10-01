#!/usr/bin/env node

/**
 * AI Casino - Dedicated Host Command Launcher
 *
 * Starts the Vite dev server AND the Express/WS backend concurrently,
 * then opens the host controller in the default browser.
 *
 * Usage:
 *   npm run host
 *   npm run host -- --room=table_01
 *   npm run host -- --port=5174
 */

import { spawn } from 'child_process';
import { exec } from 'child_process';
import http from 'http';
import process from 'process';

console.log('[Host Launcher] Starting AI Casino Host Command Center...\n');

// Parse optional CLI arguments
const args = process.argv.slice(2);
let room = '';
let explicitPort = null;

for (const arg of args) {
  if (arg.startsWith('--room=')) {
    room = arg.split('=')[1];
  } else if (arg.startsWith('--port=')) {
    explicitPort = arg.split('=')[1];
  }
}

// Track child processes for cleanup
const children = [];

// Graceful shutdown on Ctrl+C or SIGTERM
function shutdown() {
  console.log('\n[Host Launcher] Shutting down all servers...');
  children.forEach(child => {
    try { child.kill('SIGTERM'); } catch (_) {}
  });
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Function to check if an HTTP port is responding
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, { timeout: 400 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// Poll until a port is alive
function waitForPort(port, label, maxWaitMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (await checkPort(port)) {
        console.log(`[Host Launcher] ${label} is ready on port ${port}`);
        return resolve();
      }
      if (Date.now() - start > maxWaitMs) {
        return reject(new Error(`[Host Launcher] Timeout waiting for ${label} on port ${port}`));
      }
      setTimeout(poll, 500);
    };
    poll();
  });
}

// Cross-platform browser opener
function openBrowser(url) {
  const platform = process.platform;
  let command = '';
  if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  exec(command, (error) => {
    if (error) {
      console.log(`\n[Host Launcher] Could not open browser. Please navigate to:\n   ${url}\n`);
    } else {
      console.log(`[Host Launcher] Opened ${url} in your browser.`);
    }
  });
}

// Spawn a child process with piped stdout/stderr
function spawnProcess(cmd, args, label) {
  console.log(`[Host Launcher] Starting ${label}: ${cmd} ${args.join(' ')}`);
  const child = spawn(cmd, args, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => console.log(`  [${label}] ${line}`));
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => console.error(`  [${label}:ERR] ${line}`));
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[Host Launcher] ${label} exited with code ${code}`);
    }
  });

  children.push(child);
  return child;
}

async function main() {
  // 1. Check if Vite is already running
  const viteAlready = await checkPort(5174) || await checkPort(5173);
  
  let vitePort = explicitPort || 5174;

  if (!viteAlready) {
    console.log('[Host Launcher] Vite not detected. Starting vite dev server...');
    spawnProcess('npx', ['vite', '--host', '--port', '5174'], 'Vite');
    try {
      await waitForPort(5174, 'Vite Frontend');
      vitePort = 5174;
    } catch (e) {
      console.warn('[Host Launcher] Vite did not start on 5174, trying 5173...');
      await waitForPort(5173, 'Vite Frontend').catch(() => {
        console.error('[Host Launcher] Vite failed to start. Run `npm run dev` manually.');
      });
      vitePort = 5173;
    }
  } else {
    vitePort = (await checkPort(5174)) ? 5174 : 5173;
    console.log(`[Host Launcher] Vite already running on port ${vitePort}`);
  }

  // 2. Check if the backend server is running
  const serverAlready = await checkPort(8080);
  if (!serverAlready) {
    console.log('[Host Launcher] Backend not detected. Starting server on port 8080...');
    spawnProcess('node', ['server.js'], 'Backend');
    try {
      await waitForPort(8080, 'Express/WS Backend');
    } catch (e) {
      console.warn('[Host Launcher] Backend did not start within 30s. Continuing anyway...');
    }
  } else {
    console.log('[Host Launcher] Backend already running on port 8080');
  }

  // 3. Build and display URLs
  const baseUrl = `http://localhost:${vitePort}`;
  const hostQuery = room ? `?room=${encodeURIComponent(room)}` : '';
  const hostUrl     = `${baseUrl}/host${hostQuery}`;
  const round1Url   = `${baseUrl}/host/round1${hostQuery}`;
  const round3Url   = `${baseUrl}/host/chat`;
  const puterUrl    = `${baseUrl}/host?tab=puter`;
  const prodUrl     = 'https://ai-casino-chi.vercel.app/host';
  const backendUrl  = `http://localhost:8080`;

  console.log('\n' + '='.repeat(72));
  console.log('  AI CASINO - PIT BOSS & TOURNAMENT HOST COMMAND CENTER');
  console.log('='.repeat(72));
  console.log('\n  FRONTEND (Vite):');
  console.log(`    Player Client:   \x1b[36m${baseUrl}/\x1b[0m`);
  console.log(`    Host Controller: \x1b[33m\x1b[1m${hostUrl}\x1b[0m`);
  console.log('\n  BACKEND (Express/WS):');
  console.log(`    API + WebSocket: \x1b[32m${backendUrl}\x1b[0m`);
  console.log('\n  HOST CONTROLLER SECTIONS:');
  console.log(`    Round 1 (Multiplayer): \x1b[32m${round1Url}\x1b[0m`);
  console.log(`    Round 3 (Turing Chat): \x1b[35m${round3Url}\x1b[0m`);
  console.log(`    Puter & Player Setup:  \x1b[33m${puterUrl}\x1b[0m`);
  console.log(`    Production (Vercel):   \x1b[34m${prodUrl}\x1b[0m`);
  console.log('\n' + '='.repeat(72));
  console.log('  Press Ctrl+C to shut down all servers.');
  console.log('='.repeat(72) + '\n');

  openBrowser(hostUrl);
}

main().catch((err) => {
  console.error('[Host Launcher] Fatal error:', err);
  process.exit(1);
});
