import { create } from 'zustand';
import colors, { light, dark } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  theme: typeof light | typeof dark;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  theme: light,
  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: next, theme: next === 'dark' ? dark : light });
  },
  setMode: (mode: ThemeMode) => set({ mode, theme: mode === 'dark' ? dark : light }),
}));

export default useThemeStore;


