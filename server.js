const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5174 });

let host = null;
const players = new Map(); // clientId -> { ws: WebSocket, username: string }

wss.on('connection', (ws) => {
  console.log('New connection established');
  
  // Send initial connection confirmation
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  ws.clientId = clientId;
  
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    timestamp: Date.now()
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received from', ws.clientId, ':', data);
      
      switch (data.type) {
        case 'register-host':
          // Only allow one host at a time
          if (host && host !== ws) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Another host is already registered',
              timestamp: Date.now()
            }));
            return;
          }
          
          // If this is a new host registration
          if (!host) {
            host = ws;
            ws.isHost = true;
            console.log(`Host registered: ${ws.clientId}`);
            
            // Notify all players that a host is available
            broadcastToPlayers({
              type: 'host-available',
              timestamp: Date.now()
            });
            
            // Send current player list to host
            if (players.size > 0) {
              host.send(JSON.stringify({
                type: 'player-list',
                players: Array.from(players.entries()).map(([id, player]) => ({
                  id,
                  username: player.username,
                  connected: true
                })),
                timestamp: Date.now()
              }));
            }
          }
          break;
          
        case 'player-join':
          if (ws.isHost) break; // Host can't be a player
          
          if (!players.has(ws.clientId)) {
            players.set(ws.clientId, {
              ws: ws,
              username: data.username || `Player ${ws.clientId.substring(0, 6)}`
            });
            console.log(`Player joined: ${ws.clientId} (${data.username || 'Unknown'})`);
            
            // Notify host about new player
            if (host && host.readyState === WebSocket.OPEN) {
              host.send(JSON.stringify({
                type: 'player-joined',
                clientId: ws.clientId,
                username: data.username || `Player ${ws.clientId.substring(0, 6)}`,
                timestamp: Date.now()
              }));
            }
            
            // Notify the player if host is available
            if (host) {
              ws.send(JSON.stringify({
                type: 'host-available',
                timestamp: Date.now()
              }));
            }
          }
          break;
          
        case 'private-message':
          // Handle private message from host to player
          if (ws.isHost && data.targetPlayerId) {
            const player = players.get(data.targetPlayerId);
            if (player && player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(JSON.stringify({
                type: 'chat',
                content: data.content,
                senderId: 'host',
                senderName: 'Host',
                isPrivate: true,
                timestamp: data.timestamp || Date.now()
              }));
            }
          }
          break;
          
        case 'player-private-message':
          // Handle private message from player to host
          if (host && host.readyState === WebSocket.OPEN) {
            const player = Array.from(players.values()).find(p => p.ws === ws);
            if (player) {
              host.send(JSON.stringify({
                type: 'chat',
                content: data.content,
                senderId: ws.clientId,
                senderName: data.senderName || player.username,
                isPrivate: true,
                timestamp: data.timestamp || Date.now(),
                targetPlayerId: 'host' // Indicates this is for host only
              }));
            }
          }
          break; // ADDED MISSING BREAK STATEMENT HERE
          
        case 'chat':
          // Forward chat messages to appropriate recipients
          if (ws.isHost) {
            // If message is from host, send to all players (broadcast)
            broadcastToPlayers({
              type: 'chat',
              content: data.content,
              senderId: 'host',
              senderName: 'Host',
              isPrivate: false,
              timestamp: Date.now()
            });
            
            // Also send to host so they see their own messages
            if (host && host.readyState === WebSocket.OPEN) {
              host.send(JSON.stringify({
                type: 'chat',
                content: data.content,
                senderId: 'host',
                senderName: 'Host',
                isPrivate: false,
                timestamp: Date.now()
              }));
            }
          } else {
            // Handle messages from players
            const player = Array.from(players.values()).find(p => p.ws === ws);
            if (player) {
              // Broadcast to all players including host
              broadcast({
                type: 'chat',
                content: data.content,
                senderId: ws.clientId,
                senderName: player.username,
                timestamp: Date.now(),
                isPrivate: false
              });
            }
          }
          break;
          
        default:
          console.log('Unhandled message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`Client disconnected: ${ws.clientId}`);
    
    if (ws === host) {
      console.log('Host disconnected');
      host = null;
      
      // Notify all players that host is no longer available
      broadcastToPlayers({
        type: 'host-disconnected',
        timestamp: Date.now()
      });
    } else if (players.has(ws.clientId)) {
      const player = players.get(ws.clientId);
      console.log(`Player disconnected: ${ws.clientId} (${player.username})`);
      players.delete(ws.clientId);
      
      // Notify host about player disconnection
      if (host && host.readyState === WebSocket.OPEN) {
        host.send(JSON.stringify({
          type: 'player-left',
          clientId: ws.clientId,
          username: player.username,
          timestamp: Date.now()
        }));
      }
    }
  }); // ADDED MISSING CLOSING BRACKET AND PARENTHESIS HERE
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function to broadcast messages to all players
function broadcastToPlayers(message) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(messageStr);
    }
  });
}

// Helper function to broadcast messages to all connected clients
function broadcast(message, excludeWs = null) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  // Send to host if exists and not excluded
  if (host && host.readyState === WebSocket.OPEN && (!excludeWs || host !== excludeWs)) {
    host.send(messageStr);
  }
  
  // Send to all players
  players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN && (!excludeWs || player.ws !== excludeWs)) {
      player.ws.send(messageStr);
    }
  });
}

console.log('WebSocket server running on ws://localhost:5174');