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


  // Generate unique message ID
  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize chat based on mode
  useEffect(() => {
    // Clean up previous mode setup
    network_manager.message_callback = null;
    network_manager.connection_callback = null;

    const GREETING = "Hi there! I'm your chat partner. Let's have a conversation!";
    let greetingTimer: ReturnType<typeof setTimeout>;

    if (mode === 'ai') {
      // Send greeting exactly once on mount / mode switch
      greetingTimer = setTimeout(() => {
        setMessages([{
          id: generateMessageId(),
          text: GREETING,
          sender: 'ai',
          timestamp: new Date()
        }]);
      }, 1000);
    } else {
      console.log('Setting up human chat mode');

      // Connection is already established by Round3.tsx before this component mounts,
      // so connection_callback will never fire here. Send the greeting immediately.
      greetingTimer = setTimeout(() => {
        setMessages([{
          id: generateMessageId(),
          text: GREETING,
          sender: 'host',
          timestamp: new Date()
        }]);
      }, 1000);

      // Set up connection callback only for disconnect handling
      network_manager.connection_callback = ((connected: boolean, message: string) => {
        console.log(`Connection status: ${connected ? 'Connected' : 'Disconnected'} - ${message}`);
        if (!connected) {
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
      clearTimeout(greetingTimer);
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
    <div className="flex flex-col h-full bg-[#0B0E17]/95 relative">
      {/* Terminal Comms Header */}
      <div className="bg-surface-lowest/95 px-4 py-3 border-b border-amber-500/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <ShieldAlert size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface-lowest animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2CE] to-[#F4D068]">
                SUBJECT #402
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                LIVE COMMS
              </span>
            </div>
            <p className="text-[11px] font-mono text-amber-200/50">Encrypted Blind Interrogation Channel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-lowest border border-amber-500/30 px-3 py-1 rounded-lg shadow-inner">
            <Clock size={13} className="text-amber-400" />
            <span className={`text-xs font-mono font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Query quota status banner */}
      {remainingMessages !== null && (
        <div className="bg-surface-lowest/80 px-4 py-2 border-b border-amber-500/15 flex items-center justify-between text-xs font-mono">
          <span className="text-amber-200/60">Queries Remaining:</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: messageLimit || 3 }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < (messageLimit! - remainingMessages)
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'bg-[#232938] border border-amber-500/20'
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
                    ? 'bg-gradient-to-r from-amber-500/15 via-[#181d2a] to-amber-500/10 border border-amber-500/40 text-white rounded-tr-sm shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                    : 'bg-surface-lowest/90 border border-blue-500/30 text-slate-200 rounded-tl-sm shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
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
          <div className="flex items-center gap-2 p-3 bg-surface-lowest/90 border border-blue-500/30 rounded-xl w-fit shadow-md">
            <span className="text-xs font-mono text-slate-400 mr-1">Subject transmitting</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3.5 sm:p-4 bg-surface-lowest/95 border-t border-amber-500/20">
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
            className="flex-1 bg-surface-lowest border border-amber-500/25 rounded-xl px-4 py-2.5 text-white placeholder-amber-200/40 font-sans text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 disabled:opacity-40 disabled:cursor-not-allowed shadow-inner"
            disabled={timeLeft <= 0 || disableInput || (remainingMessages !== null && remainingMessages <= 0)}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || timeLeft <= 0 || disableInput || (remainingMessages !== null && remainingMessages <= 0)}
            className="btn-marquee-gold px-5 py-2.5 rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center text-black font-bold"
          >
            <Send size={18} />
          </button>
        </div>

        {timeLeft <= 0 && (
          <div className="mt-4 p-3 bg-surface-lowest/90 border border-amber-500/30 rounded-xl text-center">
            <span className="text-xs font-mono uppercase text-amber-200/70 block mb-3">Time Expired — Declare Verdict</span>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => onComplete('ai')}
                className="px-6 py-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-display font-bold uppercase tracking-wide text-xs rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 cursor-pointer border border-blue-400/40"
              >
                Artificial
              </button>
              <button
                onClick={() => onComplete('human')}
                className="btn-marquee-gold px-6 py-2 text-black font-display font-bold uppercase tracking-wide text-xs rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 cursor-pointer"
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
