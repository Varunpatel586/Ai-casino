import express from 'express';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;
const HOST = '0.0.0.0';

// Store connected clients
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  const clientId = Math.random().toString(36).substring(2, 15);
  console.log(`Client connected: ${clientId}`);
  
  // Store the new client
  clients.set(clientId, ws);
  
  // Send client their ID
  ws.send(JSON.stringify({
    type: 'id-assigned',
    clientId
  }));

  // Handle messages from client
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Broadcast to all other clients
      clients.forEach((client, id) => {
        if (id !== clientId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            ...data,
            senderId: clientId
          }));
        }
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });
});

// Get local IP address
function getLocalIpAddress(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e., 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIpAddress();
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Host server running at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://${localIp}:${PORT}\n`);
  console.log('Waiting for players to connect...');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down host server...');
  wss.close(() => {
    server.close(() => {
      console.log('Host server stopped');
      process.exit(0);
    });
  });
});
