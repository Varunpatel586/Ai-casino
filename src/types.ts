export interface Player {
  id: string;
  username: string;
  chips: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  bonusEarnings: number;
  currentRound: number;
  gameState: GameState;
}

export interface GameState {
  round1Bet?: number;
  round2Bet?: number;
  round3Bet?: number;
  round1Answers?: number[];
  round2Answers?: string[];
  round3Answers?: string[];
}

export interface LeaderboardEntry {
  username: string;
  chips: number;
  timestamp: number;
}

export type GameScreen =
  | 'intro'
  | 'rules'
  | 'username'
  | 'round1'
  | 'round2'
  | 'round3'
  | 'bonus'
  | 'leaderboard';

export type BetAmount = 10 | 30 | 'ALL_IN';
