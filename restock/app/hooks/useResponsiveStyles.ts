import { useMemo, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useSafeTheme } from '../stores/useThemeStore';
import type { AppColors } from '../theme/colors';

// --- Device type detection --------------------------------------------------

const getDeviceType = (width: number) => {
  if (width < 768) return 'mobile';
  if (width < 810) return 'tablet';
  return 'tabletLarge';
};

// --- Responsive tokens ------------------------------------------------------

const getSpacing = (deviceType: string) => {
  if (deviceType === 'tablet')
    return { xs: 6, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 };
  if (deviceType === 'tabletLarge')
    return { xs: 8, sm: 16, md: 20, lg: 24, xl: 32, xxl: 40, xxxl: 48 };
  return { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
};

const getTypography = (deviceType: string) => {
  if (deviceType === 'tablet')
    return {
      appTitle: 32,
      sectionHeader: 24,
      subsectionHeader: 20,
      productName: 18,
      buttonText: 18,
      bodyLarge: 18,
      bodyMedium: 16,
      bodySmall: 14,
      caption: 12,
    };
  if (deviceType === 'tabletLarge')
    return {
      appTitle: 36,
      sectionHeader: 28,
      subsectionHeader: 22,
      productName: 18,
      buttonText: 18,
      bodyLarge: 20,
      bodyMedium: 18,
      bodySmall: 16,
      caption: 13,
    };
  return {
    appTitle: 28,
    sectionHeader: 20,
    subsectionHeader: 18,
    productName: 16,
    buttonText: 16,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    caption: 11,
  };
};

const getLayout = (deviceType: string) => {
  if (deviceType === 'tablet')
    return {
      maxContentWidth: 768,
      paddingHorizontal: 32,
      columns: 2,
      actionGridColumns: 3,
      cardMinWidth: 200,
      tabBarHeight: 70,
      touchTargetMin: 44,
    };
  if (deviceType === 'tabletLarge')
    return {
      maxContentWidth: 900,
      paddingHorizontal: 40,
      columns: 3,
      actionGridColumns: 4,
      cardMinWidth: 220,
      tabBarHeight: 80,
      touchTargetMin: 44,
    };
  return {
    maxContentWidth: '100%',
    paddingHorizontal: 20,
    columns: 1,
    actionGridColumns: 2,
    cardMinWidth: 0,
    tabBarHeight: 60,
    touchTargetMin: 44,
  };
};

// --- Device info hook -------------------------------------------------------

export function useDeviceInfo() {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const deviceType = getDeviceType(width);
  const isTablet = deviceType !== 'mobile';

  return {
    width,
    height,
    isLandscape,
    deviceType,
    isTablet,
    isMobile: deviceType === 'mobile',
  };
}

// --- App theme with responsive tokens ---------------------------------------

export function useAppTheme() {
  const { theme: colorTheme, mode } = useSafeTheme();
  const deviceInfo = useDeviceInfo();
  const { deviceType } = deviceInfo;

  return useMemo(
    () => ({
      colors: colorTheme as AppColors,
      device: deviceInfo,
      spacing: getSpacing(deviceType),
      typography: getTypography(deviceType),
      layout: getLayout(deviceType),
      patterns: {
        container: (dt: string) => ({
          flex: 1,
          maxWidth: getLayout(dt).maxContentWidth,
          alignSelf: 'center' as const,
          width: '100%',
        }),
        grid: () => ({
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          justifyContent: 'space-between' as const,
        }),
        card: (dt: string) => ({
          minWidth: getLayout(dt).cardMinWidth,
          flex: dt === 'mobile' ? 1 : 0,
        }),
        actionGrid: (dt: string) => ({
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          justifyContent:
            dt === 'mobile'
              ? ('space-between' as const)
              : ('space-around' as const),
        }),
        touchTarget: (dt: string) => ({
          minHeight: getLayout(dt).touchTargetMin,
          minWidth: getLayout(dt).touchTargetMin,
        }),
      },
      getResponsiveValue: <T>(
        values: Partial<Record<string, T>>,
        fallback: T
      ): T => {
        return values[deviceType] || values.tablet || fallback;
      },
    }),
    [colorTheme, mode, deviceType, deviceInfo.width, deviceInfo.height, deviceInfo.isLandscape]
  );
}

// --- Responsive styles hook -------------------------------------------------

export function useResponsiveStyles<T>(
  factory: (appTheme: ReturnType<typeof useAppTheme>) => T
): T {
  const appTheme = useAppTheme();

  const styles = useMemo(() => {
    console.log('🎨 useResponsiveStyles factory running', {
      deviceType: appTheme.device.deviceType,
      width: appTheme.device.width,
      height: appTheme.device.height,
      isLandscape: appTheme.device.isLandscape,
    });
    return factory(appTheme);
  }, [
    appTheme.colors,
    appTheme.device.deviceType,
    appTheme.device.width,
    appTheme.device.height,
    appTheme.device.isLandscape,
  ]);

  // extra logging so you know when styles change
  useEffect(() => {
    console.log('✅ responsiveStyles updated', styles);
  }, [styles]);

  return styles;
}

// --- Utilities --------------------------------------------------------------

export const createResponsiveStyles = <T extends Record<string, any>>(
  styles: (appTheme: ReturnType<typeof useAppTheme>) => T
) => {
  return (appTheme: ReturnType<typeof useAppTheme>) => {
    return StyleSheet.create(styles(appTheme));
  };
};

export function useResponsive() {
  const deviceInfo = useDeviceInfo();
  const { deviceType } = deviceInfo;

  return useMemo(
    () => ({
      ...deviceInfo,
      spacing: getSpacing(deviceType),
      typography: getTypography(deviceType),
      layout: getLayout(deviceType),
    }),
    [deviceInfo, deviceType]
  );
}
