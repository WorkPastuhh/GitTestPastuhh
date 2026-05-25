/**
 * Сервис локального хранения данных.
 * Использует AsyncStorage для сохранения настроек, прогресса и
 * результатов игры между сессиями.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameResult, UserProfile, GameStatistics } from '../models/types';

const KEYS = {
  USER_PROFILE: '@sudoku/user_profile',
  GAME_RESULTS: '@sudoku/game_results',
  STATISTICS: '@sudoku/statistics',
  CURRENT_GAME: '@sudoku/current_game',
  SETTINGS: '@sudoku/settings',
  THEME_ID: '@sudoku/theme_id',
  UNLOCKED_THEMES: '@sudoku/unlocked_themes',
};

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoRemoveNotes: boolean;
  highlightConflicts: boolean;
  highlightSameNumbers: boolean;
  timerVisible: boolean;
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autoRemoveNotes: true,
  highlightConflicts: true,
  highlightSameNumbers: true,
  timerVisible: true,
  notificationsEnabled: true,
};

export const storageService = {
  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async getProfile(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  async saveGameResult(result: GameResult): Promise<void> {
    const existing = await this.getGameResults();
    existing.push(result);
    await AsyncStorage.setItem(KEYS.GAME_RESULTS, JSON.stringify(existing));
  },

  async getGameResults(): Promise<GameResult[]> {
    const data = await AsyncStorage.getItem(KEYS.GAME_RESULTS);
    return data ? JSON.parse(data) : [];
  },

  async saveStatistics(stats: GameStatistics): Promise<void> {
    await AsyncStorage.setItem(KEYS.STATISTICS, JSON.stringify(stats));
  },

  async getStatistics(): Promise<GameStatistics | null> {
    const data = await AsyncStorage.getItem(KEYS.STATISTICS);
    return data ? JSON.parse(data) : null;
  },

  async saveCurrentGame(gameState: unknown): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_GAME, JSON.stringify(gameState));
  },

  async getCurrentGame(): Promise<unknown | null> {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_GAME);
    return data ? JSON.parse(data) : null;
  },

  async clearCurrentGame(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CURRENT_GAME);
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  async saveThemeId(themeId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_ID, themeId);
  },

  async getThemeId(): Promise<string> {
    const data = await AsyncStorage.getItem(KEYS.THEME_ID);
    return data ?? 'classic';
  },

  async saveUnlockedThemes(themes: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
  },

  async getUnlockedThemes(): Promise<string[]> {
    const data = await AsyncStorage.getItem(KEYS.UNLOCKED_THEMES);
    return data ? JSON.parse(data) : ['classic', 'dark'];
  },

  async clearAll(): Promise<void> {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  },
};
