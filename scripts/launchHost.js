#!/usr/bin/env node

/**
 * 👑 AI Casino - Dedicated Host Command Launcher
 * 
 * Auto-detects the active Vite frontend port (5174, 5173, etc.)
 * Displays host credentials and launches the Pit Boss Controller in browser.
 * 
 * Usage:
 *   npm run host
 *   npm run host -- --room=table_01
 *   npm run host -- --port=5174
 */

import { exec } from 'child_process';
import http from 'http';
import process from 'process';

// Parse optional CLI arguments (e.g., --room=high_roller, --port=5174)
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

// Function to check if an HTTP port is responding
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, { timeout: 350 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Automatically detect active Vite frontend port
async function detectVitePort() {
  if (explicitPort) return explicitPort;
  if (process.env.VITE_PORT) return process.env.VITE_PORT;

  // Candidate ports commonly used by Vite
  const candidates = [5174, 5173, 5175, 5176, 3000, 4173];
  for (const p of candidates) {
    const active = await checkPort(p);
    if (active) return p;
  }

  return '5174'; // fallback to standard dev port
}

async function main() {
  const port = await detectVitePort();
  const baseUrl = `http://localhost:${port}`;
  const hostQuery = room ? `?room=${encodeURIComponent(room)}` : '';
  const hostUrl = `${baseUrl}/host${hostQuery}`;
  const round1Url = `${baseUrl}/host/round1${hostQuery}`;
  const round3Url = `${baseUrl}/host/chat`;
  const puterSetupUrl = `${baseUrl}/host?tab=puter`;
  const prodUrl = 'https://ai-casino-chi.vercel.app/host';

  console.log('\n' + '='.repeat(72));
  console.log('👑  AI CASINO — PIT BOSS & TOURNAMENT HOST COMMAND CENTER');
  console.log('='.repeat(72));
  console.log('\n🔗  PRIMARY HOST CONTROLLER URL:');
  console.log(`    👉 \x1b[33m\x1b[1m${hostUrl}\x1b[0m`);
  console.log('\n🎮  CONTESTANT / PLAYER CLIENT URL:');
  console.log(`    👉 \x1b[36m${baseUrl}/\x1b[0m`);
  console.log('\n📋  SPECIALIZED HOST CONTROL SECTIONS:');
  console.log(`    • 🎲 Round 1 Video Showdown Controller: \x1b[32m${round1Url}\x1b[0m`);
  console.log(`    • 💬 Round 3 Turing Operator Console:   \x1b[35m${round3Url}\x1b[0m`);
  console.log(`    • ⚡ Puter & Player Setup Station:      \x1b[33m${puterSetupUrl}\x1b[0m`);
  console.log(`    • 🌐 Live Cloud Host Production:        \x1b[34m${prodUrl}\x1b[0m`);
  console.log('\n' + '='.repeat(72));
  console.log(`🚀  Launching Host Controller on port ${port} in your default browser...`);
  console.log('='.repeat(72) + '\n');

  openBrowser(hostUrl);
}

// Cross-platform browser launcher
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
      console.log(`💡 Could not open browser automatically. Please copy & paste:\n   ${url}\n`);
    } else {
      console.log(`✅ Opened ${url} in your browser.`);
    }
  });
}

main();
