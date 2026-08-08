export type Role = 'CREW' | 'IMPOSTOR';

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji avatar
  color: string;  // Tailwind color key or hex
  score: number;
  isAlive: boolean;
  role?: Role;
  voteTargetId?: string;
}

export interface PlayerGroup {
  id: string;
  name: string;
  players: Array<{ name: string; avatar: string; color: string }>;
  createdAt: number;
}

export interface WordItem {
  word: string;
  hint?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  isCustom?: boolean;
  words: WordItem[];
}

export type ImpostorKnowledge = 'none' | 'category_only' | 'fake_word';
export type ClueOrder = 'free' | 'turns' | 'timer';
export type VotingMode = 'verbal' | 'secret';

export interface GameConfig {
  impostorCount: number; // 1, 2, 3 or -1 for dynamic
  impostorKnowledge: ImpostorKnowledge;
  clueOrder: ClueOrder;
  turnTimerSeconds: number; // 0 = off, 30, 45, 60, 90, 120
  votingMode: VotingMode;
  impostorCanGuess: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categoryId: string; // Category ID or 'random'
}

export type GamePhase = 
  | 'HOME' 
  | 'SETUP' 
  | 'ROLES' 
  | 'CLUES' 
  | 'VOTING' 
  | 'LAST_GUESS' 
  | 'RESOLUTION' 
  | 'SCOREBOARD'
  | 'CATEGORIES'
  | 'GROUPS'
  | 'RULES';

export interface VoteTally {
  playerId: string;
  votesReceived: number;
  voters: string[];
}

export type GlobalLeaderboardMap = Record<string, { name: string; avatar: string; wins: number; totalGames: number; score: number }>;

export interface MatchRecord {
  id: string;
  timestamp: number;
  categoryName: string;
  secretWord: string;
  playersCount: number;
  impostorNames: string[];
  winningTeam: 'CREW' | 'IMPOSTOR';
  reason: string;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  config: GameConfig;
  players: Player[];
  secretWord: WordItem;
  categoryName: string;
  fakeWord?: string;
  impostorIds: string[];
  currentTurnIndex: number;
  votes: Record<string, string>; // voterPlayerId -> targetPlayerId
  eliminatedPlayerId?: string;
  roundNotice?: string;
  impostorGuessedWord?: string;
  impostorGuessCorrect?: boolean;
  winningTeam?: 'CREW' | 'IMPOSTOR';
  winningReason?: string;
  roundNumber: number;
  matchHistory: MatchRecord[];
}
