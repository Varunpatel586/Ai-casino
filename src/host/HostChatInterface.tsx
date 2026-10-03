// src/host/HostChatInterface.tsx
import { useState, useEffect, useRef } from 'react';
import { network_manager } from '../services/network';
import { getWsUrl } from '../services/apiConfig';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'host' | 'player' | 'system';
  timestamp: Date;
  playerId?: string;
  playerName?: string;
  targetPlayerId?: string; // For private messages
}

interface Player {
  id: string;
  name: string;
  connected: boolean;
}

export default function HostChatInterface() {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('all'); // 'all' for broadcast
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up as host
    network_manager.connection_callback = (connected, message) => {
      // System message
      addSystemMessage(connected ? 'Connected to Turing Test server' : message);
    };

    function addSystemMessage(text: string) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        text,
        sender: 'system',
        timestamp: new Date(),
      } as ChatMessage]);
    }

    network_manager.message_callback = (msg: any) => {
      console.log('[HostChat] Received message:', msg.type, msg);

      if (msg.type === 'host-registered') {
        addSystemMessage('You are now the host! Players can connect to chat.');

      } else if (msg.type === 'player-joined') {
        // FIX BUG-004: was duplicated, now handled exactly once
        setPlayers(prev => {
          const existingPlayer = prev.find(p => p.id === msg.clientId);
          if (existingPlayer) return prev;
          return [...prev, {
            id: msg.clientId,
            name: msg.username,
            connected: true
          }];
        });
        addSystemMessage(`Player ${msg.username || msg.clientId} joined the chat`);

      } else if (msg.type === 'player-left') {
        // FIX BUG-004: was duplicated, now handled exactly once
        setPlayers(prev => prev.map(p =>
          p.id === msg.clientId ? { ...p, connected: false } : p
        ));
        addSystemMessage(`Player ${msg.username || msg.clientId} left the chat`);

      } else if (msg.type === 'player-list') {
        // FIX BUG-004: was duplicated, now handled exactly once
        console.log('[HostChat] Received player-list:', msg.players);
        setPlayers(msg.players.map((player: any) => ({
          id: player.id,
          name: player.username,
          connected: player.connected
        })));

      } else if (msg.type === 'chat') {
        const newMessage: ChatMessage = {
          id: Date.now().toString() + Math.random(),
          text: msg.content,
          sender: msg.senderId === 'host' ? 'host' : 'player',
          timestamp: new Date(msg.timestamp),
          playerId: msg.senderId,
          playerName: msg.senderName,
          targetPlayerId: msg.isPrivate ? (msg.senderId === 'host' ? msg.targetPlayerId : 'host') : undefined
        };
        setMessages(prev => [...prev, newMessage]);

      } else if (msg.type === 'connected') {
        console.log('[HostChat] Server connection confirmed, clientId:', msg.clientId);
        addSystemMessage('Connected to AI Casino server.');

      } else if (msg.type === 'host-available') {
        console.log('[HostChat] Host-available event received');

      } else {
        console.log('[HostChat] Unhandled message type:', msg.type);
      }
    };

    // Connect as host
    const hostAddress = getWsUrl();
    network_manager.connect_as_host(hostAddress);

    return () => {
      network_manager.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const hostMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      text: input,
      sender: 'host',
      timestamp: new Date(),
      targetPlayerId: selectedPlayerId === 'all' ? undefined : selectedPlayerId
    };

    setMessages(prev => [...prev, hostMessage]);
    
    if (selectedPlayerId === 'all') {
      // FIX BUG-005: send_chat_message already wraps in NetworkMessage internally.
      // Pass raw string content ONLY, not a JSON.stringify'd object.
      console.log('[HostChat] Broadcasting to all players:', input);
      network_manager.send_chat_message(input);
    } else {
      // Send private message to specific player
      console.log('[HostChat] Sending private message to', selectedPlayerId, ':', input);
      network_manager.send_private_message_to_player(selectedPlayerId, input);
    }
    
    setInput('');
  };

  const getMessageDisplayInfo = (msg: ChatMessage) => {
    if (msg.sender === 'system') {
      return {
        displayName: 'System',
        badge: '',
        bgColor: 'bg-gray-800 border border-gray-600'
      };
    } else if (msg.sender === 'host') {
      const targetPlayer = msg.targetPlayerId 
        ? players.find(p => p.id === msg.targetPlayerId)
        : null;
      
      return {
        displayName: 'You',
        badge: targetPlayer ? `→ ${targetPlayer.name}` : '(To All)',
        bgColor: targetPlayer ? 'bg-purple-600' : 'bg-blue-600'
      };
    } else {
      const player = players.find(p => p.id === msg.playerId);
      return {
        displayName: player?.name || `Player ${msg.playerId?.substring(0, 6)}`,
        badge: msg.targetPlayerId ? '(Private)' : '',
        bgColor: msg.targetPlayerId ? 'bg-green-600' : 'bg-gray-700'
      };
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectedPlayers = players.filter(p => p.connected);

  return (
    <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg text-white flex flex-col p-3 sm:p-4">
      <div className="max-w-4xl w-full mx-auto flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Console Header */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 p-3 sm:p-4 bg-[#12151E] border border-[#232938] rounded-xl mb-2 sm:mb-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg">⌨️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-wider">
                  Operator Comms Console
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold">
                  HOST READY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-slate-400">
                Round 3 Blind Interrogation Channel
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Active Contestants
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
              {connectedPlayers.length} Connected
            </span>
          </div>
        </div>

        {/* Connected Players Roster Bar */}
        <div className="flex-shrink-0 mb-2 sm:mb-3 px-3 py-2 bg-[#12151E] border border-[#232938] rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Registered Player Terminals
            </span>
          </div>
          {connectedPlayers.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 italic py-0.5">
              No players currently connected. Waiting for players to enter Round 3...
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connectedPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    selectedPlayerId === player.id
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-[#181D2A] border-[#283248] hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">{player.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({player.id.substring(0, 6)})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 min-h-0 bg-[#0E1118] border border-[#232938] rounded-xl p-3 sm:p-4 overflow-y-auto mb-2 sm:mb-3 shadow-inner space-y-3">
          {messages.map((msg) => {
            const { displayName, badge } = getMessageDisplayInfo(msg);

            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-1.5">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#181D2A] border border-[#232938] text-slate-400 text-[11px] font-mono">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isHost = msg.sender === 'host';

            return (
              <div key={msg.id} className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-md p-3 rounded-xl shadow-md border ${
                    isHost
                      ? 'bg-[#181D2A] border-amber-500/30 text-white rounded-tr-sm'
                      : 'bg-[#12151E] border-[#283248] text-slate-200 rounded-tl-sm cursor-pointer hover:border-blue-400/50 transition-colors'
                  }`}
                  onClick={() => {
                    if (msg.sender === 'player' && msg.playerId) {
                      setSelectedPlayerId(msg.playerId);
                    }
                  }}
                  title={msg.sender === 'player' ? 'Click to reply privately' : ''}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${isHost ? 'text-amber-400' : 'text-blue-400'}`}>
                        {displayName}
                      </span>
                      {badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-slate-300">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed break-words">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input & Channel Target */}
        <div className="flex-shrink-0 p-3 sm:p-3.5 bg-[#12151E] border border-[#232938] rounded-xl shadow-xl">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="bg-[#181D2A] border border-[#283248] text-amber-400 font-mono text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="all">BROADCAST (All Contestants)</option>
              {connectedPlayers.map(player => (
                <option key={player.id} value={player.id}>
                  PRIVATE → {player.name || player.id}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={
                selectedPlayerId === 'all'
                  ? "Broadcast message to all connected players..."
                  : `Private reply to ${players.find(p => p.id === selectedPlayerId)?.name || selectedPlayerId}...`
              }
              className="flex-1 bg-[#181D2A] border border-[#283248] rounded-lg px-3.5 py-2 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />

            <button
              onClick={sendMessage}
              className="py-2 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all cursor-pointer flex-shrink-0"
            >
              Transmit
            </button>
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 mt-2 flex items-center justify-between">
            <span>
              Target: <strong className="text-amber-400">{selectedPlayerId === 'all' ? 'All Connected Contestants' : players.find(p => p.id === selectedPlayerId)?.name || selectedPlayerId}</strong>
            </span>
            <span className="text-slate-500">Press Enter to transmit</span>
          </div>
        </div>
      </div>
    </div>
  );
}