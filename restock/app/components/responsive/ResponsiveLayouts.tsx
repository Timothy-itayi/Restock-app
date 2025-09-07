import React from 'react';
import { View, ScrollView, ViewStyle, ScrollViewProps } from 'react-native';
import { useAppTheme } from '../../hooks/useResponsiveStyles';

// ========================
// RESPONSIVE LAYOUT PRIMITIVES FOR IPAD OPTIMIZATION
// ========================

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
  padding?: boolean;
}

// Container component with max width and responsive padding for iPad
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  centered = true,
  padding = true,
}) => {
  const { layout, spacing, patterns, device } = useAppTheme();
  
  const containerStyle: ViewStyle = {
    ...patterns.container(device.deviceType),
    ...(padding && { 
      paddingHorizontal: layout.paddingHorizontal,
      paddingVertical: spacing.lg,
    }),
    ...style,
  };
  
  return <View style={containerStyle}>{children}</View>;
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}

// Grid component that adapts to tablet screen sizes
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap,
  style,
}) => {
  const { spacing, device, patterns } = useAppTheme();
  
  const gridGap = gap ?? spacing.md;
  const gridColumns = columns ?? (device.isTablet ? 2 : 1);
  
  const gridStyle: ViewStyle = {
    ...patterns.grid(device.deviceType, gridGap),
    ...style,
  };
  
  // Calculate child width for even distribution
  const childrenArray = React.Children.toArray(children);
  const itemWidth = device.isTablet 
    ? `${(100 - (gridColumns - 1) * 2) / gridColumns}%` 
    : '100%';
  
  return (
    <View style={gridStyle}>
      {childrenArray.map((child, index) => (
        <View 
          key={index} 
          style={{ 
            width: itemWidth,
            marginBottom: gridGap,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

// Card component with responsive sizing for tablet
export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  style,
  elevated = false,
}) => {
  const { colors, spacing, patterns, device } = useAppTheme();
  
  const cardStyle: ViewStyle = {
    ...patterns.card(device.deviceType),
    backgroundColor: colors.neutral.lightest,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    ...(elevated && {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }),
    ...style,
  };
  
  return <View style={cardStyle}>{children}</View>;
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: keyof ReturnType<typeof useAppTheme>['spacing'];
  horizontal?: boolean;
  wrap?: boolean;
  style?: ViewStyle;
}

// Stack component for consistent spacing
export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing: spacingKey = 'md',
  horizontal = false,
  wrap = false,
  style,
}) => {
  const { spacing } = useAppTheme();
  
  const stackStyle: ViewStyle = {
    flexDirection: horizontal ? 'row' : 'column',
    ...(wrap && { flexWrap: 'wrap' }),
    ...style,
  };
  
  const gap = spacing[spacingKey];
  const childrenArray = React.Children.toArray(children);
  
  return (
    <View style={stackStyle}>
      {childrenArray.map((child, index) => (
        <View 
          key={index}
          style={index < childrenArray.length - 1 ? {
            [horizontal ? 'marginRight' : 'marginBottom']: gap
          } : undefined}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  centered?: boolean;
  padding?: boolean;
}

// ScrollView with responsive container
export const ResponsiveScrollView: React.FC<ResponsiveScrollViewProps> = ({
  children,
  centered = true,
  padding = true,
  style,
  contentContainerStyle,
  ...props
}) => {
  const { layout, spacing, patterns, device } = useAppTheme();
  
  const containerStyle = {
    ...patterns.container(device.deviceType),
    ...(padding && {
      paddingHorizontal: layout.paddingHorizontal,
      paddingVertical: spacing.lg,
    }),
    ...contentContainerStyle,
  };
  
  return (
    <ScrollView
      style={style}
      contentContainerStyle={containerStyle}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

interface ResponsiveActionGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Action grid optimized for tablet touch targets
export const ResponsiveActionGrid: React.FC<ResponsiveActionGridProps> = ({
  children,
  style,
}) => {
  const { layout, spacing, patterns, device } = useAppTheme();
  
  const gridStyle: ViewStyle = {
    ...patterns.actionGrid(device.deviceType),
    ...style,
  };
  
  // For tablets, ensure minimum touch target size
  const childrenWithTouchTargets = React.Children.map(children, (child, index) => (
    <View 
      key={index}
      style={{
        ...patterns.touchTarget(device.deviceType),
        flex: device.isTablet ? 0 : 1,
        minWidth: device.isTablet ? layout.cardMinWidth / layout.actionGridColumns : undefined,
      }}
    >
      {child}
    </View>
  ));
  
  return (
    <View style={gridStyle}>
      {childrenWithTouchTargets}
    </View>
  );
};

// Export all components
export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveStack,
  ResponsiveScrollView,
  ResponsiveActionGrid,
};