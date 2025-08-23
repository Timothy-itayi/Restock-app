import { useMemo } from 'react';
import { useSafeTheme } from '@/app/stores/useThemeStore';
import type { AppColors } from '@/app/theme/colors';

export function useThemedStyles<T>(factory: (theme: AppColors) => T): T {
  const { theme, mode } = useSafeTheme();
  
  return useMemo(() => factory(theme as AppColors), [theme, mode]);
}


