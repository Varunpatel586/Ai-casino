// src/host/WebSocketHost.js
import { WebSocketServer } from 'ws';
import express from 'express';

class WebSocketHost {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.app = express();
    this.clients = new Map();
    this.clientUsernames = new Map(); // clientId -> username
    this.hostClient = null;
    
    console.log('🎮 Turing Test Host Server');
    this.setupExpress();
  }

  setupExpress() {
    this.app.get('/', (req, res) => {
      res.json({
        status: 'running',
        service: 'Turing Test WebSocket Server',
        connectedClients: this.clients.size,
        port: this.port
      });
    });

    this.app.get('/status', (req, res) => {
      res.json({
        connectedPlayers: this.clients.size - (this.hostClient ? 1 : 0),
        isHostConnected: !!this.hostClient,
        totalConnections: this.clients.size
      });
    });
  }

  start() {
    const server = this.app.listen(this.port, () => {
      console.log(`✅ HTTP server running on http://localhost:${this.port}`);
    });

    this.wss = new WebSocketServer({ server });
    
    this.wss.on('listening', () => {
      console.log(`✅ WebSocket server running on port ${this.port}`);
      console.log(`🔗 Players connect via: ws://localhost:${this.port}`);
      console.log('Waiting for connections...\n');
    });

    this.wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId();
      const clientIp = request.socket.remoteAddress;
      
      console.log(`🔗 New connection: ${clientId} from ${clientIp}`);
      
      this.clients.set(clientId, ws);
      
      this.sendToClient(ws, {
        type: 'connected',
        clientId: clientId,
        message: 'Connected to Turing Test server',
        timestamp: Date.now()
      });

      ws.on('message', (data) => {
        try {
          // Handle both string and Buffer data
          const dataStr = data.toString();
          const message = JSON.parse(dataStr);
          this.handleMessage(clientId, message, ws);
        } catch (error) {
          console.error('❌ Error parsing message from', clientId, ':', error);
          console.error('Raw message data:', data.toString());
          // Try to handle as plain text or extract info
          this.handleMalformedMessage(clientId, data.toString(), ws);
        }
      });

      ws.on('close', () => {
        console.log(`❌ Connection closed: ${clientId}`);
        this.clients.delete(clientId);
        
        if (this.hostClient === ws) {
          console.log('🏠 Host disconnected');
          this.hostClient = null;
          this.broadcastToPlayers({
            type: 'host-disconnected',
            message: 'Host has left the chat'
          });
        } else {
          if (this.hostClient && this.hostClient.readyState === WebSocket.OPEN) {
            this.sendToClient(this.hostClient, {
              type: 'player-left',
              clientId: clientId,
              username: this.clientUsernames.get(clientId) || 'Player',
              message: 'Player left the chat',
              timestamp: Date.now()
            });
          }
        }
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error);
      });
    });

    this.wss.on('error', (error) => {
      console.error('❌ Server error:', error);
    });
  }

  handleMessage(clientId, message, ws) {
    console.log(`📨 [${message.type}] from ${clientId}`);
    
    switch (message.type) {
      case 'register-host':
        if (!this.hostClient) {
          this.hostClient = ws;
          console.log(`🏠 Host registered: ${clientId}`);
          this.sendToClient(ws, {
            type: 'host-registered',
            message: 'You are now the host',
            timestamp: Date.now()
          });
          
          this.broadcastToPlayers({
            type: 'host-available',
            message: 'Host is now available for chat',
            timestamp: Date.now()
          });
        } else {
          this.sendToClient(ws, {
            type: 'error',
            message: 'Host already registered',
          });
        }
        break;

      case 'chat':
        console.log('💬 Chat message from', clientId, ':', message.content);
        if (this.hostClient === ws) {
          // Host broadcasting to all players - include content
          this.broadcastToPlayers({
            type: 'chat',
            content: message.content,
            senderId: 'host',
            senderName: 'Host',
            timestamp: Date.now()
          });
        } else {
          if (this.hostClient && this.hostClient.readyState === 1) {
            this.sendToClient(this.hostClient, {
              type: 'chat',
              content: message.content,
              senderId: clientId,
              senderName: this.clientUsernames.get(clientId) || 'Player',
              timestamp: Date.now()
            });
          }
        }
        break;

      case 'player-join':
        // Player registration with username
        if (message.username) {
          this.clientUsernames.set(clientId, message.username);
          console.log(`👤 Player registered: ${clientId} as "${message.username}"`);
        }
        if (this.hostClient && this.hostClient.readyState === 1) {
          this.sendToClient(this.hostClient, {
            type: 'player-joined',
            clientId: clientId,
            username: message.username || 'Player',
            timestamp: Date.now()
          });
          
          // Send updated player list to host
          const players = Array.from(this.clients.entries())
            .filter(([id, ws]) => ws !== this.hostClient && ws.readyState === 1)
            .map(([id, ws]) => ({
              id,
              username: this.clientUsernames.get(id) || 'Player',
              connected: true
            }));
          this.sendToClient(this.hostClient, {
            players,
            timestamp: Date.now()
          });
        }
        break;

      default:
        console.log('❓ Unknown message type:', message.type);
    }
  }

  sendToClient(client, message) {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(message));
    }
  }

  broadcastToPlayers(message) {
    this.clients.forEach((client, clientId) => {
      if (client !== this.hostClient && client.readyState === 1) {
        this.sendToClient(client, message);
      }
    });
  }

  generateClientId() {
    return 'client-' + Math.random().toString(36).substr(2, 9);
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('🛑 WebSocket server stopped');
    }
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 8080;
  const host = new WebSocketHost(port);
  host.start();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    host.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    host.stop();
    process.exit(0);
  });
}

export default WebSocketHost;