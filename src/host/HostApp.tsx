// src/host/HostApp.tsx
import { useState, useEffect, useRef } from 'react';
import { network_manager } from '../services/network';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'host' | 'player';
  timestamp: Date;
  playerId?: string;
}

export default function HostApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting to server...');
  const [isLoading, setIsLoading] = useState(true);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleConnection = (connected: boolean, message: string) => {
      console.log('Host connection status:', connected, message);
      setIsConnected(connected);
      setConnectionStatus(connected ? 'Connected to server!' : message || 'Connecting...');
      
      if (connected) {
        // Register as host once connected
        console.log('Sending register-host message');
        const registerMsg = {
          type: 'register-host',
          clientId: network_manager.get_local_id(),
          timestamp: Date.now()
        };
        
        // Send the registration message directly through the WebSocket
        const ws = (network_manager as any).ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(registerMsg));
          console.log('Register-host message sent');
        } else {
          console.error('WebSocket not ready for sending register-host message');
        }
      }
    };

    const handleMessage = (msg: any) => {
      console.log('Host received message:', msg);
      
      switch (msg.type) {
        case 'host-registered':
          setConnectionStatus('✅ Host registered - Waiting for players...');
          setIsLoading(false);
          addMessage('System', 'You are now the host! Players can connect to chat.', 'system');
          break;
          
        case 'player-joined':
          setConnectedPlayers(prev => [...prev, msg.clientId]);
          addMessage('System', `🎮 Player ${msg.clientId} joined the chat`, 'system');
          break;
          
        case 'player-left':
          setConnectedPlayers(prev => prev.filter(id => id !== msg.clientId));
          addMessage('System', `🚪 Player ${msg.clientId} left the chat`, 'system');
          break;
          
        case 'chat':
          if (msg.senderId !== 'host') { // Only show player messages
            const newMessage: ChatMessage = {
              id: Date.now().toString(),
              text: msg.content,
              sender: 'player',
              timestamp: new Date(msg.timestamp),
              playerId: msg.senderId
            };
            setMessages(prev => [...prev, newMessage]);
          }
          break;
          
        case 'connected':
          addMessage('System', msg.message, 'system');
          break;
          
        case 'error':
          addMessage('System', `❌ ${msg.message}`, 'system');
          break;
      }
    };

    // Initialize host connection
    const initializeHost = async () => {
      try {
        setIsLoading(true);
        
        // Set up network callbacks
        network_manager.connection_callback = handleConnection;
        network_manager.message_callback = handleMessage;

        // Connect to WebSocket server (not start a server)
        console.log('Connecting to WebSocket server as host...');
        await network_manager.connect_to_host('ws://localhost:8080');
        
      } catch (error) {
        console.error('Failed to connect as host:', error);
        setConnectionStatus('❌ Failed to connect to server. Make sure the WebSocket server is running.');
        setIsLoading(false);
        
        addMessage('System', 'Error: Could not connect to WebSocket server. Run "npm run host" first.', 'system');
      }
    };

    initializeHost();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up host...');
      network_manager.disconnect();
      network_manager.connection_callback = null;
      network_manager.message_callback = null;
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender: string, text: string, type: 'host' | 'player' | 'system') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      sender: type as 'host' | 'player',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;
    
    // Create host message
    const hostMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'host',
      timestamp: new Date()
    };
    
    // Add to local messages
    setMessages(prev => [...prev, hostMessage]);
    
    // Send via network
    network_manager.send_chat_message(input);
    
    // Clear input
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show temporary notification
      const originalStatus = connectionStatus;
      setConnectionStatus('✅ Copied to clipboard!');
      setTimeout(() => setConnectionStatus(originalStatus), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">🎮 Turing Test Host</h1>
          <p className="text-purple-300">Chat with players in real-time</p>
        </div>
        
        {/* Connection Status */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-6 border border-purple-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-lg font-semibold">
                {isConnected ? 'Connected to Server' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Players: {connectedPlayers.length}
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-slate-300">{connectionStatus}</p>
            {isLoading && (
              <div className="flex items-center justify-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                <span className="text-sm text-purple-300">Connecting...</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-900/50">
              <h2 className="text-xl font-bold mb-4">Chat Room</h2>
              
              {/* Messages */}
              <div className="bg-slate-900/50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💬</div>
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Chat will appear here when players connect</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`mb-3 flex ${msg.sender === 'host' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.sender === 'host' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                            : msg.sender === 'player'
                            ? 'bg-slate-700 text-white rounded-bl-none'
                            : 'bg-slate-600 text-slate-200 rounded'
                        } backdrop-blur-sm border border-white/10`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {msg.sender === 'host' ? 'You' : msg.sender === 'player' ? `Player ${msg.playerId?.substring(0, 6)}` : 'System'}
                          </span>
                          <span className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white break-words">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message as host..." : "Connect to server to chat..."}
                  className="flex-1 bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!isConnected}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!input.trim() || !isConnected}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Connection Info */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-900/50">
              <h2 className="text-xl font-bold mb-4">Server Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Server Status
                  </label>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                        {isConnected ? '🟢 Online' : '🔴 Offline'}
                      </span>
                      <a 
                        href="http://localhost:8080/status" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Check Status
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Connected Players
                  </label>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    {connectedPlayers.length === 0 ? (
                      <p className="text-slate-400 text-sm">No players connected</p>
                    ) : (
                      <div className="space-y-1">
                        {connectedPlayers.map(playerId => (
                          <div key={playerId} className="flex items-center justify-between text-sm">
                            <span className="text-green-400">🟢 {playerId.substring(0, 8)}...</span>
                            <span className="text-slate-400">Online</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-900/50">
              <h2 className="text-xl font-bold mb-4">How to Use</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  <p>Keep the WebSocket server running with <code className="bg-slate-700 px-1 rounded">npm run host</code></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  <p>Players automatically connect when Round 3 selects "human" mode</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">3.</span>
                  <p>Chat naturally with players - they're trying to guess if you're human or AI</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">4.</span>
                  <p>Be convincing! The game depends on your performance as host</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-900/50">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.open('http://localhost:8080', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  📊 Open Server Dashboard
                </button>
                <button
                  onClick={() => copyToClipboard('ws://localhost:8080')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  📋 Copy Server URL
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  🔄 Reconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}