import { io, Socket } from 'socket.io-client';

export interface PlayerSeat {
  playerId: string;
  seatNumber: number;
  username: string;
  chips: number;
  isReady?: boolean;
  betAmount: number;
  betStatus: 'not_bet' | 'placed' | 'locked';
  answerStatus: 'not_answered' | 'answered';
  connected: boolean;
}

export interface SettlementResult {
  playerId: string;
  username: string;
  seatNumber: number;
  score: number;
  betAmount: number;
  netEarnings: number;
  finalChips: number;
}

export interface FeedRevealedData {
  feedIndex: number;
  isAI: boolean;
  classification: string;
  playerResults: Array<{
    playerId: string;
    seatNumber: number;
    username: string;
    answer: string;
    isCorrect: boolean;
  }>;
}

export interface TableState {
  roomId: string;
  roomCode?: string;
  hostConnected?: boolean;
  status: 'waiting' | 'betting' | 'playing' | 'revealing' | 'settled';
  currentFeedIndex: number;
  totalFeeds: number;
  roundTimer: number;
  currentVideo: {
    id: number;
    title: string;
    videoSrc: string;
  };
  players: PlayerSeat[];
  settlements: SettlementResult[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:8080`;

class MultiplayerSocketService {
  private socket: Socket | null = null;
  private currentRoomId: string = 'table_01';
  private lastJoinData: { roomId: string; playerId: string; username: string; currentChips: number } | null = null;

  public getCurrentRoomId(): string {
    return this.currentRoomId;
  }

  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(`${BACKEND_URL}/round1`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 30,
        reconnectionDelay: 500,
      });

      this.socket.on('connect', () => {
        console.log('[MultiplayerSocket] Connected to /round1 server:', this.socket?.id);
        if (this.lastJoinData) {
          console.log('[MultiplayerSocket] Emitting join_table on connection:', this.lastJoinData);
          this.socket?.emit('join_table', this.lastJoinData);
        }
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[MultiplayerSocket] Connection error:', err.message);
      });
    }
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.lastJoinData = null;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinAsHost(roomId: string, hostId: string) {
    this.currentRoomId = roomId;
    const socket = this.connect();
    socket.emit('host_join', { roomId, hostId });
  }

  public hostStartGame(roomId: string) {
    this.connect().emit('host_start_game', { roomId });
  }

  public toggleReady(roomId: string, playerId: string, isReady: boolean) {
    this.connect().emit('toggle_ready', { roomId, playerId, isReady });
  }

  public joinTable(roomId: string, playerId: string, username: string, currentChips: number) {
    this.currentRoomId = roomId;
    this.lastJoinData = { roomId, playerId, username, currentChips };
    const socket = this.connect();
    if (socket.connected) {
      socket.emit('join_table', this.lastJoinData);
    }
  }

  public reconnectTable(roomId: string, playerId: string) {
    this.currentRoomId = roomId;
    const socket = this.connect();
    socket.emit('reconnect_table', { roomId, playerId });
  }

  public selectSeat(roomId: string, playerId: string, desiredSeat: number) {
    this.connect().emit('select_seat', { roomId, playerId, desiredSeat });
  }

  public placeBet(roomId: string, playerId: string, betAmount: number | 'ALL_IN') {
    this.connect().emit('place_bet', { roomId, playerId, betAmount });
  }

  public startTable(roomId: string) {
    this.connect().emit('start_table', { roomId });
  }

  public quickStart(roomId: string) {
    this.connect().emit('quick_start', { roomId });
  }

  public addBots(roomId: string) {
    this.connect().emit('add_bots', { roomId });
  }

  public submitAnswer(roomId: string, playerId: string, feedIndex: number, answer: 'real' | 'ai') {
    this.connect().emit('submit_answer', { roomId, playerId, feedIndex, answer });
  }

  public resetTable(roomId: string) {
    this.connect().emit('reset_table', { roomId });
  }
}

export const multiplayerSocket = new MultiplayerSocketService();
