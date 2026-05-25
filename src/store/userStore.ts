import { create } from 'zustand';
import { UserProfile, SubscriptionType, GameStatistics } from '../models/types';
import { Difficulty } from '../utils/sudokuGenerator';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface UserStore {
  profile: UserProfile | null;
  statistics: GameStatistics;
  isAuthenticated: boolean;

  login: (username: string, email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  recordGameResult: (
    difficulty: Difficulty,
    time: number,
    won: boolean
  ) => void;
  updateSubscription: (type: SubscriptionType, expiresAt: number) => void;
  updateRating: (change: number) => void;
}

const initialStatistics: GameStatistics = {
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  winRate: 0,
  averageTime: { easy: 0, medium: 0, hard: 0, expert: 0 },
  bestTime: { easy: null, medium: null, hard: null, expert: null },
  currentStreak: 0,
  longestStreak: 0,
  totalPlayTime: 0,
};

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  statistics: initialStatistics,
  isAuthenticated: false,

  login: (username: string, email: string) => {
    const profile: UserProfile = {
      id: generateId(),
      username,
      email,
      createdAt: Date.now(),
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: { easy: null, medium: null, hard: null, expert: null },
      rating: 1000,
      subscriptionType: 'free',
    };

    set({ profile, isAuthenticated: true });
  },

  logout: () => {
    set({ profile: null, isAuthenticated: false, statistics: initialStatistics });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const { profile } = get();
    if (!profile) return;

    set({ profile: { ...profile, ...updates } });
  },

  recordGameResult: (difficulty: Difficulty, time: number, won: boolean) => {
    const { profile, statistics } = get();
    if (!profile) return;

    const newStats = { ...statistics };
    newStats.totalGamesPlayed++;
    newStats.totalPlayTime += time;

    if (won) {
      newStats.totalGamesWon++;
      newStats.currentStreak++;
      newStats.longestStreak = Math.max(
        newStats.longestStreak,
        newStats.currentStreak
      );

      const currentBest = newStats.bestTime[difficulty];
      if (currentBest === null || time < currentBest) {
        newStats.bestTime[difficulty] = time;
      }
    } else {
      newStats.currentStreak = 0;
    }

    newStats.winRate =
      newStats.totalGamesPlayed > 0
        ? newStats.totalGamesWon / newStats.totalGamesPlayed
        : 0;

    set({
      profile: {
        ...profile,
        gamesPlayed: profile.gamesPlayed + 1,
        gamesWon: won ? profile.gamesWon + 1 : profile.gamesWon,
        bestTime: newStats.bestTime,
      },
      statistics: newStats,
    });
  },

  updateSubscription: (type: SubscriptionType, expiresAt: number) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        subscriptionType: type,
        subscriptionExpiresAt: expiresAt,
      },
    });
  },

  updateRating: (change: number) => {
    const { profile } = get();
    if (!profile) return;

    set({
      profile: {
        ...profile,
        rating: Math.max(0, profile.rating + change),
      },
    });
  },
}));
