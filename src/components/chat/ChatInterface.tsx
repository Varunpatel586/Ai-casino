import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldAlert, Clock } from 'lucide-react';
import { network_manager } from '../../services/network';
import { get_ai_response } from '../../services/gemini_chat';

// Import NetworkMessage type for proper typing
type NetworkMessage = {
  type: 'chat' | 'connect' | 'connected' | 'disconnect' | 'error' |
        'player-joined' | 'player-left' | 'player-list' |
        'host-registered' | 'host-available' | 'host-disconnected' |
        'register-host' | 'player-join' | 'private-message' | 'player-private-message';
  content?: string;
  message?: string;
  timestamp: number;
  senderId?: string;
  clientId?: string;
  isHost?: boolean;
  senderName?: string;
  recipientId?: string;
  isPrivate?: boolean;
  players?: string[];
  targetPlayerId?: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'human' | 'you' | 'system' | 'host';
  timestamp: Date;
};

interface ChatInterfaceProps {
  mode: 'ai' | 'human';
  onComplete: (guess: 'ai' | 'human') => void;
  timeLimit: number;
  onTimeUp: () => void;
  isConnected?: boolean;
  messageLimit?: number;
  messagesSent?: number;
  onSendMessage?: () => void;
  disableInput?: boolean;
}

export default function ChatInterface({ mode, onComplete, timeLimit, onTimeUp, messageLimit, messagesSent, onSendMessage, disableInput }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const aiGreetingSent = useRef(false);

  // Generate unique message ID
  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize chat based on mode
  useEffect(() => {
    // Reset greeting flag when mode changes
    aiGreetingSent.current = false;

    // Clean up previous mode setup
    network_manager.message_callback = null;
    network_manager.connection_callback = null;

    if (mode === 'ai') {
      // Start with an AI greeting (only once per mode switch)
      if (!aiGreetingSent.current) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: "Hi there! I'm your chat partner. Let's have a conversation!",
            sender: 'ai',
            timestamp: new Date()
          }]);
          aiGreetingSent.current = true;
        }, 1000);
      }
    } else {
      console.log('Setting up human chat mode');

      // Set up connection callback
      network_manager.connection_callback = ((connected: boolean, message: string) => {
        console.log(`Connection status: ${connected ? 'Connected' : 'Disconnected'} - ${message}`);

        if (connected) {
          console.log('Successfully connected to host');
          setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: 'Connected to chat partner! Say hello!',
            sender: 'human',
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: `Connection lost: ${message}`,
            sender: 'human',
            timestamp: new Date()
          }]);
        }
      });

      // Set up message callback
      network_manager.message_callback = (msg) => {
        console.log('Received message from host:', msg);

        // Handle different message formats
        let parsedMsg: NetworkMessage | {
          type: string;
          content: string;
          senderId: string;
          senderName: string;
          timestamp: number | Date;
        };

        if (typeof msg === 'string') {
          try {
            parsedMsg = JSON.parse(msg) as NetworkMessage;
          } catch (e) {
            // If it's plain text, treat it as a chat message
            parsedMsg = {
              type: 'chat',
              content: msg,
              senderId: 'host',
              senderName: 'Host',
              timestamp: new Date()
            };
          }
        } else {
          parsedMsg = msg;
        }

        if (parsedMsg.type === 'chat') {
          let displayText = '';

          if (typeof parsedMsg.content === 'string' && parsedMsg.content.trim().startsWith('{')) {
            try {
              const nestedMessage = JSON.parse(parsedMsg.content);
              displayText = nestedMessage.content || parsedMsg.content;
            } catch (e) {
              displayText = parsedMsg.content;
            }
          } else {
            displayText = typeof parsedMsg.content === 'string' ? parsedMsg.content : JSON.stringify(parsedMsg.content || msg);
          }

          setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: displayText,
            sender: parsedMsg.senderId === 'host' ? 'host' : 'human',
            timestamp: parsedMsg.timestamp ? new Date(parsedMsg.timestamp) : new Date()
          }]);
        }
      };

      // We are already connected via Round3.tsx, so no need to call connect_to_host again here!
    }

    // Clean up
    return () => {
      network_manager.message_callback = null;
      network_manager.connection_callback = null;
    };
  }, [mode]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (disableInput) return;
    if (typeof messageLimit === 'number' && typeof messagesSent === 'number' && messagesSent >= messageLimit) return;

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      text: input,
      sender: 'you',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (onSendMessage) onSendMessage();

    if (mode === 'ai') {
      // Get AI response
      setIsTyping(true);
      try {
        const aiResponse = await get_ai_response(input);

        // Simulate typing delay
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 1000 + Math.random() * 2000); // 1-3 second delay
      } catch (error) {
        console.error('Error getting AI response:', error);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: generateMessageId(),
          text: 'Sorry, I couldn\'t understand that. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        }]);
      }
    } else {
      // Send to human chat (privately to host)
      network_manager.send_private_message_to_host(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingMessages = typeof messageLimit === 'number' && typeof messagesSent === 'number'
    ? Math.max(0, messageLimit - messagesSent)
    : null;

  return (
    <div className="flex flex-col h-full bg-[#0E1118]">
      {/* Terminal Comms Header */}
      <div className="bg-[#12151E] px-4 py-3 border-b border-[#232938] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#181D2A] border border-amber-500/20 text-amber-400">
            <ShieldAlert size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#12151E] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                SUBJECT #402
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                LIVE COMMS
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Encrypted Blind Interrogation Channel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181D2A] border border-[#232938] px-3 py-1 rounded-lg">
            <Clock size={13} className="text-amber-400" />
            <span className={`text-xs font-mono font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Query quota status banner */}
      {remainingMessages !== null && (
        <div className="bg-[#151922] px-4 py-2 border-b border-[#232938] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Queries Remaining:</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: messageLimit || 3 }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < (messageLimit! - remainingMessages)
                    ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'bg-[#232938]'
                }`}
              />
            ))}
            <span className="text-amber-400 font-bold ml-1">{remainingMessages} of {messageLimit}</span>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((message) => {
          const isYou = message.sender === 'you';
          return (
            <div
              key={message.id}
              className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md ${
                  isYou
                    ? 'bg-[#181D2A] border border-amber-500/30 text-white rounded-tr-sm'
                    : 'bg-[#121622] border border-[#263045] text-slate-200 rounded-tl-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/5">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${isYou ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isYou ? 'Investigator (You)' : 'Target Response'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm font-sans leading-relaxed text-slate-200">
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-[#121622] border border-[#263045] rounded-xl w-fit">
            <span className="text-xs font-mono text-slate-400 mr-1">Subject transmitting</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3.5 sm:p-4 bg-[#12151E] border-t border-[#232938]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disableInput || (remainingMessages !== null && remainingMessages <= 0)
                ? "Interrogation limit reached. Submit your verdict above."
                : "Type interrogation query..."
            }
            className="flex-1 bg-[#181D2A] border border-[#283248] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 font-sans text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={timeLeft <= 0 || disableInput || (remainingMessages !== null && remainingMessages <= 0)}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || timeLeft <= 0 || disableInput || (remainingMessages !== null && remainingMessages <= 0)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-4 py-2.5 shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>

        {timeLeft <= 0 && (
          <div className="mt-4 p-3 bg-[#181D2A] border border-[#232938] rounded-xl text-center">
            <span className="text-xs font-mono uppercase text-slate-400 block mb-3">Time Expired — Declare Verdict</span>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => onComplete('ai')}
                className="px-6 py-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-display font-bold uppercase tracking-wide text-xs rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 cursor-pointer"
              >
                Artificial
              </button>
              <button
                onClick={() => onComplete('human')}
                className="px-6 py-2 bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-display font-bold uppercase tracking-wide text-xs rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 cursor-pointer"
              >
                Human
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
