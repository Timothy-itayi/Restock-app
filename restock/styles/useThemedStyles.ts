import { useMemo } from 'react';
import useThemeStore from '@/app/stores/useThemeStore';

export function useThemedStyles<T>(factory: (theme: ReturnType<typeof useThemeStore>['theme']) => T): T {
  const { theme, mode } = useThemeStore();
  return useMemo(() => factory(theme), [mode]);
}


