import { Grid, Difficulty } from '../utils/sudokuGenerator';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
  gamesPlayed: number;
  gamesWon: number;
  bestTime: Record<Difficulty, number | null>;
  rating: number;
  subscriptionType: SubscriptionType;
  subscriptionExpiresAt?: number;
}

export type SubscriptionType = 'free' | 'premium' | 'pro';

export interface GameState {
  id: string;
  puzzle: Grid;
  solution: Grid;
  currentGrid: Grid;
  notes: CellNotes[][];
  difficulty: Difficulty;
  startedAt: number;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  hintsUsed: number;
  errorsCount: number;
  maxErrors: number;
  selectedCell: { row: number; col: number } | null;
}

export interface CellNotes {
  values: Set<number>;
}

export interface GameResult {
  id: string;
  userId: string;
  difficulty: Difficulty;
  completedAt: number;
  elapsedTime: number;
  hintsUsed: number;
  errorsCount: number;
  score: number;
  isTournamentGame: boolean;
  tournamentId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  participants: TournamentParticipant[];
  status: TournamentStatus;
  entryFee: number;
  prizePool: number;
}

export type TournamentStatus =
  | 'upcoming'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface TournamentParticipant {
  userId: string;
  username: string;
  joinedAt: number;
  completedAt?: number;
  elapsedTime?: number;
  score?: number;
  rank?: number;
}

export interface AppTheme {
  id: string;
  name: string;
  isPremium: boolean;
  colors: ThemeColors;
  preview: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  success: string;
  gridLine: string;
  gridLineThick: string;
  cellBackground: string;
  cellSelected: string;
  cellHighlight: string;
  cellConflict: string;
  cellFixed: string;
  numberFixed: string;
  numberUser: string;
  numberError: string;
  noteText: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  gamesPlayed: number;
  averageTime: number;
  rank: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  difficulty: Difficulty;
  puzzle: Grid;
  solution: Grid;
  completedByCount: number;
}

export interface GameStatistics {
  totalGamesPlayed: number;
  totalGamesWon: number;
  winRate: number;
  averageTime: Record<Difficulty, number>;
  bestTime: Record<Difficulty, number | null>;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number;
}
