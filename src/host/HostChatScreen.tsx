import { useState, useRef, useEffect } from 'react';
import { network_manager } from '../services/network';

interface Message {
  id: string;
  text: string;
  sender: 'host' | 'player';
  timestamp: Date;
}

export default function HostChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Starting server...');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Initializing HostChatScreen...');
    
    const handleConnection = (connected: boolean, message: string) => {
      console.log(`Connection status changed: ${connected ? 'Connected' : 'Disconnected'}, Message: ${message}`);
      setConnected(connected);
      setConnectionStatus(connected ? 'Player connected!' : message || 'Waiting for player...');
      
      if (connected) {
        console.log('Successfully connected to chat server');
        // Add connection message
        const connectionMessage: Message = {
          id: Date.now().toString(),
          text: 'A player has joined the chat!',
          sender: 'player',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, connectionMessage]);
      } else if (message.includes('Disconnected')) {
        // Add disconnection message
        const disconnectMessage: Message = {
          id: Date.now().toString(),
          text: 'Player has left the chat.',
          sender: 'player',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, disconnectMessage]);
      }
    };
    
    const handleMessage = (msg: any) => {
      console.log('Received message:', msg);
      if (msg.type === 'chat') {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: msg.content,
          sender: 'player',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      } else if (msg.type === 'connect') {
        console.log('Player connected with ID:', msg.clientId);
      }
    };

    // Set up connection callback
    network_manager.connection_callback = handleConnection;
    
    // Set up message callback
    network_manager.message_callback = handleMessage;
    
    // Start the WebSocket server
    const initializeServer = async () => {
      try {
        setIsLoading(true);
        console.log('Starting WebSocket server on port 5174...');
        
        await network_manager.start_server(5174, (serverId: string) => {
          console.log('Host server started with ID:', serverId);
          setConnectionStatus('Server running - Waiting for player connection...');
          setIsLoading(false);
          
          // Add welcome message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: 'Chat server started. Waiting for players to connect...',
            sender: 'host',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, welcomeMessage]);
        });

      } catch (error) {
        console.error('Failed to start server:', error);
        setConnectionStatus('Failed to start server. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeServer();
    
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up HostChatScreen...');
      network_manager.disconnect();
      network_manager.connection_callback = null;
      network_manager.message_callback = null;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !connected) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'host',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    network_manager.send_chat_message(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyConnectionId = () => {
    navigator.clipboard.writeText(network_manager.get_local_id()).then(() => {
      // You could add a toast notification here
      console.log('Connection ID copied to clipboard');
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-purple-900/50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Host Chat Room</h1>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <p className="text-slate-300 text-sm">{connectionStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center text-blue-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                  Starting...
                </div>
              )}
              <div className="text-sm text-slate-400">
                ID: <span className="font-mono text-purple-400">{network_manager.get_local_id()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Info Banner */}
      {!connected && (
        <div className="bg-blue-900/20 border-b border-blue-500/30 p-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-400 text-sm">💡</span>
              <p className="text-blue-300 text-sm ml-2">
                Share your connection ID with players: <span className="font-mono bg-blue-900/30 px-2 py-1 rounded">{network_manager.get_local_id()}</span>
              </p>
            </div>
            <button
              onClick={copyConnectionId}
              className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900/30 hover:bg-blue-800/40 px-3 py-1 rounded transition-colors"
            >
              Copy ID
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-4xl mx-auto h-full bg-slate-800/30 backdrop-blur-md rounded-xl border border-purple-900/30 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start chatting when a player connects</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'host' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.sender === 'host' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                        : 'bg-slate-700/80 text-white rounded-bl-none'
                    } backdrop-blur-sm border border-white/10`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {msg.sender === 'host' ? 'You' : 'Player'}
                      </span>
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-slate-700/80 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              placeholder={connected ? "Type your message..." : "Wait for player to connect..."}
              disabled={!connected}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[100px] backdrop-blur-sm border border-white/10"
            >
              Send
            </button>
          </div>
          
          {/* Connection Help */}
          {!connected && !isLoading && (
            <div className="mt-3 text-center">
              <p className="text-slate-400 text-sm">
                Share your connection ID: <span className="font-mono text-purple-300 bg-slate-700/50 px-2 py-1 rounded">
                  {network_manager.get_local_id()}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}