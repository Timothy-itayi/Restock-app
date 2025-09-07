import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Dimensions } from "react-native";
import { UnifiedAuthGuard } from "../components/UnifiedAuthGuard";
import { SessionProvider } from "./restock-sessions/context/SessionContext";
import { ErrorBoundaryWrapper } from "../components/ErrorBoundaryWrapper";
import { useResponsiveStyles, useAppTheme } from "../hooks/useResponsiveStyles";
import { tabScreenOptions, useTabsTheme } from "../../styles/components/tabs";
import { useMemo, useEffect } from "react";

// Enhanced responsive detection with comprehensive logging
const { width, height } = Dimensions.get('window');
const isLandscape = width > height;
const deviceType = width < 768 ? 'mobile' : width < 810 ? 'tablet' : 'tabletLarge';
const isTablet = deviceType !== 'mobile';

console.log('📱 Device Detection:', {
  width,
  height,
  isLandscape,
  deviceType,
  isTablet,
  screenRatio: (width / height).toFixed(2)
});

export default function TabLayout() {
  return (
    <ErrorBoundaryWrapper>
      <TabLayoutContent />
    </ErrorBoundaryWrapper>
  );
}

function TabLayoutContent() {
  // Use unified responsive theme system with comprehensive logging
  let appTheme;
  let tabsTheme;
  
  try {
    console.log('🎨 Loading Responsive Theme System...');
    appTheme = useAppTheme();
    console.log('📊 App Theme Raw:', appTheme);
    
    tabsTheme = useTabsTheme();
    console.log('📊 Tabs Theme Raw:', tabsTheme);
    
    // Validate theme structure
    if (!appTheme || !appTheme.colors || !appTheme.device || !appTheme.layout) {
      throw new Error('Invalid theme structure');
    }
    
    console.log('✅ Responsive Theme Loaded Successfully:', {
      device: {
        type: appTheme.device.deviceType,
        isTablet: appTheme.device.isTablet,
        isMobile: appTheme.device.isMobile,
        width: appTheme.device.width,
        height: appTheme.device.height,
        isLandscape: appTheme.device.isLandscape
      },
      colors: {
        neutral: appTheme.colors.neutral,
        brand: appTheme.colors.brand
      },
      typography: {
        subsectionHeader: appTheme.typography.subsectionHeader,
        caption: appTheme.typography.caption,
        appTitle: appTheme.typography.appTitle
      },
      layout: {
        maxContentWidth: appTheme.layout.maxContentWidth,
        paddingHorizontal: appTheme.layout.paddingHorizontal,
        tabBarHeight: appTheme.layout.tabBarHeight,
        columns: appTheme.layout.columns
      },
      spacing: {
        xs: appTheme.spacing.xs,
        sm: appTheme.spacing.sm,
        md: appTheme.spacing.md,
        lg: appTheme.spacing.lg,
        xl: appTheme.spacing.xl
      }
    });
    
    console.log('🎯 Tab Theme Configuration:', {
      tabBarHeight: tabsTheme.options.tabBarStyle?.height,
      iconSize: tabsTheme.options.tabBarIconStyle?.width,
      paddingHorizontal: tabsTheme.options.tabBarStyle?.paddingHorizontal,
      maxWidth: tabsTheme.options.tabBarStyle?.maxWidth
    });
    
  } catch (error) {
    console.error('❌ Error loading responsive theme, using fallback:', error);
    // Enhanced fallback theme with tablet support
    appTheme = {
      colors: { 
        neutral: { 
          darkest: '#1A1D20', 
          medium: '#6C757D', 
          lightest: '#FFFFFF', 
          light: '#E1E8ED',
          lighter: '#F8F9FA'
        },
        brand: {
          primary: '#6B7F6B',
          secondary: '#A7B9A7'
        }
      },
      device: { 
        isTablet,
        deviceType,
        width,
        height,
        isLandscape,
        isMobile: !isTablet
      },
      typography: { 
        subsectionHeader: isTablet ? 20 : 18, 
        caption: isTablet ? 12 : 11,
        appTitle: isTablet ? 32 : 28,
        sectionHeader: isTablet ? 24 : 20
      },
      layout: {
        maxContentWidth: isTablet ? 768 : '100%',
        paddingHorizontal: isTablet ? 32 : 20,
        tabBarHeight: isTablet ? 70 : 60,
        columns: isTablet ? 2 : 1,
        touchTargetMin: 44
      },
      spacing: {
        xs: isTablet ? 6 : 4,
        sm: isTablet ? 12 : 8,
        md: isTablet ? 16 : 12,
        lg: isTablet ? 20 : 16,
        xl: isTablet ? 24 : 20,
        xxl: isTablet ? 32 : 24,
        xxxl: isTablet ? 40 : 32
      }
    };
    
    // Fallback tabs theme
    tabsTheme = {
      styles: {
        tabBar: { backgroundColor: '#FFFFFF', height: appTheme.layout.tabBarHeight },
        tabIcon: { width: isTablet ? 32 : 24, height: isTablet ? 32 : 24 }
      },
      options: {
        tabBarActiveTintColor: appTheme.colors.neutral.darkest,
        tabBarInactiveTintColor: appTheme.colors.neutral.medium,
        tabBarStyle: {
          backgroundColor: appTheme.colors.neutral.lightest,
          height: appTheme.layout.tabBarHeight,
          paddingHorizontal: appTheme.spacing.md
        }
      },
      appTheme
    };
  }

  // Monitor theme changes and device orientation changes
  useEffect(() => {
    console.log('🔄 Theme System Monitoring:', {
      deviceType: appTheme.device.deviceType,
      isTablet: appTheme.device.isTablet,
      isLandscape: appTheme.device.isLandscape,
      screenDimensions: {
        width: appTheme.device.width,
        height: appTheme.device.height
      },
      layoutConfig: {
        maxContentWidth: appTheme.layout.maxContentWidth,
        paddingHorizontal: appTheme.layout.paddingHorizontal,
        tabBarHeight: appTheme.layout.tabBarHeight
      }
    });
  }, [appTheme.device.deviceType, appTheme.device.isLandscape, appTheme.layout]);

  // Use responsive styles hook for dynamic styling
  // Use responsive styles hook for dynamic styling
const responsiveStyles = useResponsiveStyles((theme) => {
  console.log('🎨 Creating Responsive Styles with theme:', {
    deviceType: theme.device.deviceType,
    isTablet: theme.device.isTablet,
    tabBarHeight: theme.layout.tabBarHeight,
    spacing: theme.spacing,
  });

  return {
    tabBar: {
      backgroundColor: theme.colors.neutral.lightest,
      borderTopColor: theme.colors.neutral.light,
      borderTopWidth: 1,
      height: theme.layout.tabBarHeight,
      paddingBottom: theme.device.isTablet ? theme.spacing.md : theme.spacing.lg,
      paddingTop: theme.device.isTablet ? theme.spacing.md : theme.spacing.sm,
      paddingHorizontal: theme.device.isTablet ? theme.spacing.xl : theme.spacing.md,
      maxWidth: theme.layout.maxContentWidth as any,
      alignSelf: 'center' as const,
      minHeight: theme.layout.touchTargetMin,
      // Add visible test styling for tablet
      ...(theme.device.isTablet && {
        backgroundColor: '#E8F5E8', // Light green for tablet detection
        borderTopColor: '#6B7F6B',
        borderTopWidth: 2,
      }),
    },
    header: {
      backgroundColor: theme.colors.neutral.lightest,
      borderBottomColor: theme.colors.neutral.light,
      borderBottomWidth: 1,
      paddingHorizontal: theme.layout.paddingHorizontal,
      maxWidth: theme.layout.maxContentWidth as any,
      alignSelf: 'center' as const,
      // Add visible test styling for tablet
      ...(theme.device.isTablet && {
        backgroundColor: '#F0F8F0', // Light green tint for tablet detection
        borderBottomColor: '#6B7F6B',
        borderBottomWidth: 2,
      }),
    },
    headerTitle: {
      fontSize: theme.typography.subsectionHeader,
      fontWeight: '600' as const,
      color: theme.colors.neutral.darkest,
      letterSpacing: theme.device.isTablet ? 0.2 : 0,
      lineHeight: theme.device.isTablet
        ? theme.typography.subsectionHeader * 1.2
        : undefined,
    },
    tabLabel: {
      fontSize: theme.typography.caption,
      fontWeight: '500' as const,
      marginTop: theme.spacing.xs,
      letterSpacing: theme.device.isTablet ? 0.3 : 0,
      color: theme.colors.neutral.darkest,
    },
    tabIcon: {
      width: theme.device.isTablet ? 32 : 24,
      height: theme.device.isTablet ? 32 : 24,
      marginBottom: theme.device.isTablet ? theme.spacing.xs : 0,
    },
  };
});

  // Enhanced responsive screen options using unified theme system
  const screenOptions = useMemo(
    () => {
      console.log('🎨 Building Responsive Screen Options...');
      
      const options = {
        // Theme colors from unified system
        tabBarActiveTintColor: appTheme.colors.neutral.darkest,
        tabBarInactiveTintColor: appTheme.colors.neutral.medium,
        headerTintColor: appTheme.colors.neutral.darkest,
        
        // Use responsive styles from hook
        tabBarStyle: responsiveStyles.tabBar,
        headerStyle: responsiveStyles.header,
        headerTitleStyle: responsiveStyles.headerTitle,
        tabBarLabelStyle: responsiveStyles.tabLabel,
        tabBarIconStyle: responsiveStyles.tabIcon,
        
        // Tab press feedback
        tabBarPressColor: appTheme.colors.neutral.lighter,
        tabBarPressOpacity: 0.8,
      };
      
      console.log('✅ Responsive Screen Options Generated:', {
        tabBarHeight: responsiveStyles.tabBar.height,
        iconSize: responsiveStyles.tabIcon.width,
        paddingHorizontal: responsiveStyles.tabBar.paddingHorizontal,
        maxWidth: responsiveStyles.tabBar.maxWidth,
        headerFontSize: responsiveStyles.headerTitle.fontSize,
        labelFontSize: responsiveStyles.tabLabel.fontSize,
        deviceType: appTheme.device.deviceType
      });
      
      return options;
    },
    [responsiveStyles, appTheme.colors.neutral]
  );

  // Enhanced icon renderer with responsive sizing and logging
  const renderIcon = (iconName: string) => ({ color, size }: { color: string; size: number }) => {
    // Enhanced icon sizing for tablets with better visibility and touch targets
    const baseIconSize = appTheme.device.isTablet ? 32 : 24;
    const iconSize = Math.max(size, baseIconSize);
    
    console.log(`🎯 Rendering Icon: ${iconName}`, {
      requestedSize: size,
      baseSize: baseIconSize,
      finalSize: iconSize,
      isTablet: appTheme.device.isTablet,
      color
    });
    
    return <Ionicons name={iconName as any} size={iconSize} color={color} />;
  };

  return (
    <UnifiedAuthGuard>
      <SessionProvider>
        <Tabs screenOptions={screenOptions}>
          {/* Dashboard */}
          <Tabs.Screen
            name="dashboard/index"
            options={{
              title: tabScreenOptions.dashboard.title,
              tabBarIcon: renderIcon(tabScreenOptions.dashboard.tabBarIcon.name),
            }}
          />

          {/* Restock Sessions */}
          <Tabs.Screen
            name="restock-sessions"
            options={{
              title: tabScreenOptions.restockSessions.title,
              tabBarIcon: renderIcon(tabScreenOptions.restockSessions.tabBarIcon.name),
              headerShown: false,
            }}
          />

          {/* Emails */}
          <Tabs.Screen
            name="emails/index"
            options={{
              title: tabScreenOptions.emails.title,
              tabBarIcon: renderIcon(tabScreenOptions.emails.tabBarIcon.name),
            }}
          />

          {/* Profile */}
          <Tabs.Screen
            name="profile/index"
            options={{
              title: tabScreenOptions.profile.title,
              tabBarIcon: renderIcon(tabScreenOptions.profile.tabBarIcon.name),
            }}
          />
        </Tabs>
      </SessionProvider>
    </UnifiedAuthGuard>
  );
}