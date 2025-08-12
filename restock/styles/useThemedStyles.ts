import { useMemo } from 'react';
import useThemeStore from '@/app/stores/useThemeStore';
import type { AppColors } from '@/app/theme/colors';

export function useThemedStyles<T>(factory: (theme: AppColors) => T): T {
  const { theme, mode } = useThemeStore();
  return useMemo(() => factory(theme), [mode]);
}


