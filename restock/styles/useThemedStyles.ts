import { useMemo } from 'react';
import { useSafeTheme } from '../lib/stores/useThemeStore';
import type { AppColors } from '../lib/theme/colors';

export function useThemedStyles<T>(factory: (theme: AppColors) => T): T {
  const { theme, mode } = useSafeTheme();
  
  return useMemo(() => factory(theme as AppColors), [theme, mode]);
}


