import { create } from 'zustand';
import { AppTheme } from '../models/types';
import { defaultThemes, getThemeById } from '../themes/defaultThemes';

interface ThemeStore {
  currentThemeId: string;
  unlockedThemes: string[];
  availableThemes: AppTheme[];

  getCurrentTheme: () => AppTheme;
  setTheme: (themeId: string) => void;
  unlockTheme: (themeId: string) => void;
  isThemeUnlocked: (themeId: string) => boolean;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  currentThemeId: 'classic',
  unlockedThemes: ['classic', 'dark'],
  availableThemes: defaultThemes,

  getCurrentTheme: () => {
    return getThemeById(get().currentThemeId);
  },

  setTheme: (themeId: string) => {
    const { unlockedThemes } = get();
    if (unlockedThemes.includes(themeId)) {
      set({ currentThemeId: themeId });
    }
  },

  unlockTheme: (themeId: string) => {
    set((state) => ({
      unlockedThemes: state.unlockedThemes.includes(themeId)
        ? state.unlockedThemes
        : [...state.unlockedThemes, themeId],
    }));
  },

  isThemeUnlocked: (themeId: string) => {
    return get().unlockedThemes.includes(themeId);
  },
}));
