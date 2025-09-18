'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MoodTheme {
  id: string;
  name: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  backgroundImage?: string;
  musicUrl?: string;
  isActive: boolean;
}

interface ThemeState {
  currentTheme: MoodTheme;
  themes: MoodTheme[];
  isBlurEnabled: boolean;
  
  // Actions
  setTheme: (theme: MoodTheme) => void;
  toggleBlur: () => void;
  addCustomTheme: (theme: Omit<MoodTheme, 'id'>) => void;
}

const defaultThemes: MoodTheme[] = [
  {
    id: 'romantic-sunset',
    name: 'Romantic Sunset',
    description: 'Warm and intimate evening vibes',
    colorScheme: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      background: '#FFF8E1',
    },
    isActive: false,
  },
  {
    id: 'midnight-passion',
    name: 'Midnight Passion',
    description: 'Deep and mysterious night theme',
    colorScheme: {
      primary: '#8E44AD',
      secondary: '#E74C3C',
      accent: '#F39C12',
      background: '#2C3E50',
    },
    isActive: false,
  },
  {
    id: 'soft-morning',
    name: 'Soft Morning',
    description: 'Gentle and loving morning theme',
    colorScheme: {
      primary: '#F8BBD0',
      secondary: '#E1BEE7',
      accent: '#81C784',
      background: '#FAFAFA',
    },
    isActive: true,
  },
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultThemes.find(t => t.isActive) || defaultThemes[0],
      themes: defaultThemes,
      isBlurEnabled: false,

      setTheme: (theme) => {
        set((state) => ({
          currentTheme: theme,
          themes: state.themes.map(t => ({
            ...t,
            isActive: t.id === theme.id,
          })),
        }));
        
        // Apply theme CSS variables
        const root = document.documentElement;
        root.style.setProperty('--theme-primary', theme.colorScheme.primary);
        root.style.setProperty('--theme-secondary', theme.colorScheme.secondary);
        root.style.setProperty('--theme-accent', theme.colorScheme.accent);
        root.style.setProperty('--theme-background', theme.colorScheme.background);
      },

      toggleBlur: () => {
        set((state) => ({ isBlurEnabled: !state.isBlurEnabled }));
      },

      addCustomTheme: (themeData) => {
        const newTheme: MoodTheme = {
          ...themeData,
          id: `custom-${Date.now()}`,
        };
        
        set((state) => ({
          themes: [...state.themes, newTheme],
        }));
      },
    }),
    {
      name: 'uiw-theme-storage',
    }
  )
);

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}