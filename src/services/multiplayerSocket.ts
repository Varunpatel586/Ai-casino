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
  lastDelta?: number;
  lastMultiplier?: number;
  lastIsCorrect?: boolean;
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
  totalFeeds: number;
  isAI: boolean;
  classification: string;
  playerResults: Array<{
    playerId: string;
    seatNumber: number;
    username: string;
    answer?: string;
    isCorrect: boolean;
    timeTaken?: number;
    multiplier?: number;
    betAmount?: number;
    netDelta?: number;
    newChips?: number;
  }>;
}

export interface TableSummary {
  room_id: string;
  room_code?: string;
  status: string;
  current_feed_index: number;
  total_seats: number;
  occupied_seats: number;
  active_seats: number;
  has_space: boolean;
  exists?: boolean;
  updated_at?: number | null;
}

export interface TableState {
  roomId: string;
  roomCode?: string;
  hostConnected?: boolean;
  status: 'waiting' | 'betting' | 'playing' | 'revealing' | 'settled';
  currentFeedIndex: number;
  totalFeeds: number;
  roundTimer: number;
  feedStartTime?: number;
  currentVideo: {
    id: number;
    title: string;
    type?: 'image' | 'video';
    mediaSrc?: string;
    videoSrc: string;
  };
  players: PlayerSeat[];
  settlements: SettlementResult[];
}

import { getBackendUrl } from './apiConfig';

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
      const serverUrl = getBackendUrl();
      this.socket = io(`${serverUrl}/round1`, {
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

  public skipToRound2(roomId: string) {
    this.connect().emit('skip_to_round2', { roomId });
  }

  public getTables() {
    this.connect().emit('get_tables', {});
  }

  public hostGetTables() {
    this.connect().emit('host_get_tables', {});
  }

  public fetchTablesRest(): Promise<{ tables: TableSummary[]; source: string } | null> {
    return fetch(`${getBackendUrl()}/api/round1/tables`)
      .then((r) => r.json())
      .then((data) => (data?.success && Array.isArray(data.tables) ? data : null))
      .catch(() => null);
  }

  public joinTableAuto(roomId: string, playerId: string, username: string, currentChips: number) {
    this.currentRoomId = roomId;
    this.lastJoinData = { roomId, playerId, username, currentChips };
    const socket = this.connect();
    if (socket.connected) {
      socket.emit('join_table_auto', this.lastJoinData);
    }
  }
}

export const multiplayerSocket = new MultiplayerSocketService();
