// Theme configuration for the Restock app
// Updated to match portfolio aesthetic with semantic color system

export const colors = {
  // Primary portfolio colors (dark grey and white)
  primary: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D', // Main industrial grey
    600: '#495057',
    700: '#343A40',
    800: '#212529', // Dark charcoal grey (portfolio exterior)
    900: '#1A1D20',
  },
  
  // Paper and background colors (white and warm whites)
  paper: {
    50: '#FFFFFF', // Pure white (paper)
    100: '#FEFEFE',
    200: '#FDFDFD',
    300: '#FCFCFC',
    400: '#FBFBFB',
    500: '#FAFAFA',
    600: '#F9F9F9',
    700: '#F8F8F8',
    800: '#F7F7F7',
    900: '#F6F6F6',
  },

  // Semantic button colors
  buttons: {
    // Navigation/action buttons (green - leading somewhere)
    navigation: '#22C55E', // Green for moving to different screens
    quickAction: '#22C55E', // Green for quick actions
    auth: '#22C55E', // Green for authentication buttons
    
    // Edit buttons (deep orange/light brown)
    edit: '#F97316', // Deep orange for edit actions
    
    // Sign out (red)
    signOut: '#EF4444', // Red for sign out
    
    // Default/neutral buttons
    primary: '#6C757D', // Industrial grey for primary actions
    secondary: '#ADB5BD', // Light grey for secondary actions
  },

  // Content text colors
  text: {
    important: '#3B82F6', // Blue for important information
    primary: '#000000', // Black for regular content
    secondary: '#6C757D', // Grey for secondary text
    muted: '#ADB5BD', // Light grey for muted text
  },

  // Status colors (muted and professional)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Accent colors (from portfolio sticky notes)
  accent: {
    yellow: '#FCD34D',
    orange: '#F97316',
    pink: '#EC4899',
    green: '#22C55E',
    blue: '#3B82F6',
    red: '#EF4444',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const typography = {
  // Font families using Satoshi
  fonts: {
    black: 'Satoshi-Black',
    bold: 'Satoshi-Bold',
    medium: 'Satoshi-Medium',
    regular: 'Satoshi-Regular',
    light: 'Satoshi-Light',
    italic: 'Satoshi-Italic',
    lightItalic: 'Satoshi-LightItalic',
    mediumItalic: 'Satoshi-MediumItalic',
    boldItalic: 'Satoshi-BoldItalic',
    blackItalic: 'Satoshi-BlackItalic',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  // Typography variants following CMS design principles
  variants: {
    // App Title - Black weight for maximum impact
    appTitle: {
      fontFamily: 'Satoshi-Black',
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '900',
    },
    // Section Headers - Bold weight for clear hierarchy
    sectionHeader: {
      fontFamily: 'Satoshi-Bold',
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
    },
    // Subsection Headers - Bold weight, smaller size
    subsectionHeader: {
      fontFamily: 'Satoshi-Bold',
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
    },
    // Product Names & Buttons - Medium weight for readability
    productName: {
      fontFamily: 'Satoshi-Medium',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
    },
    buttonText: {
      fontFamily: 'Satoshi-Medium',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
    },
    // Body Text - Regular weight for main content
    bodyLarge: {
      fontFamily: 'Satoshi-Regular',
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400',
    },
    bodyMedium: {
      fontFamily: 'Satoshi-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    bodySmall: {
      fontFamily: 'Satoshi-Regular',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
    // Caption & Metadata - Light weight for subtle information
    caption: {
      fontFamily: 'Satoshi-Light',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '300',
    },
    metadata: {
      fontFamily: 'Satoshi-Light',
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '300',
    },
    // Emphasis & Notes - Italic for user-entered content
    emphasis: {
      fontFamily: 'Satoshi-Italic',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      fontStyle: 'italic',
    },
    noteText: {
      fontFamily: 'Satoshi-Italic',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      fontStyle: 'italic',
    },
    // Legal & System Text - Light weight for minimal presence
    legalText: {
      fontFamily: 'Satoshi-Light',
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '300',
    },
    systemTag: {
      fontFamily: 'Satoshi-Light',
      fontSize: 9,
      lineHeight: 11,
      fontWeight: '300',
    },
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
  },
};

// Component-specific theme tokens (Portfolio-style)
export const components = {
  button: {
    // Navigation buttons (green)
    navigation: {
      backgroundColor: colors.buttons.navigation,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Quick action buttons (green)
    quickAction: {
      backgroundColor: colors.buttons.quickAction,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Auth buttons (green)
    auth: {
      backgroundColor: colors.buttons.auth,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Edit buttons (deep orange)
    edit: {
      backgroundColor: colors.buttons.edit,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Sign out buttons (red)
    signOut: {
      backgroundColor: colors.buttons.signOut,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Primary buttons (industrial grey)
    primary: {
      backgroundColor: colors.buttons.primary,
      color: '#FFFFFF',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Secondary buttons (light grey)
    secondary: {
      backgroundColor: colors.buttons.secondary,
      color: colors.text.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontWeight: typography.weights.medium,
    },
    // Outline buttons
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      borderColor: colors.primary[300],
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      fontWeight: typography.weights.normal,
    },
    // Floating action button
    floating: {
      backgroundColor: colors.buttons.navigation,
      color: '#FFFFFF',
      borderRadius: borderRadius.full,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  },
  
  input: {
    backgroundColor: colors.paper[50],
    borderColor: colors.primary[200],
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    placeholderTextColor: colors.text.muted,
  },
  
  card: {
    backgroundColor: colors.paper[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    ...shadows.sm,
  },
  
  cardElevated: {
    backgroundColor: colors.paper[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  toast: {
    success: {
      backgroundColor: colors.paper[50],
      borderLeftColor: colors.success[500],
      borderLeftWidth: 4,
      borderRadius: borderRadius.md,
    },
    error: {
      backgroundColor: colors.paper[50],
      borderLeftColor: colors.error[500],
      borderLeftWidth: 4,
      borderRadius: borderRadius.md,
    },
    warning: {
      backgroundColor: colors.paper[50],
      borderLeftColor: colors.warning[500],
      borderLeftWidth: 4,
      borderRadius: borderRadius.md,
    },
    info: {
      backgroundColor: colors.paper[50],
      borderLeftColor: colors.text.important,
      borderLeftWidth: 4,
      borderRadius: borderRadius.md,
    },
  },
  
  navigation: {
    backgroundColor: colors.paper[50],
    borderTopColor: colors.primary[200],
    borderTopWidth: 1,
    activeColor: colors.text.primary,
    inactiveColor: colors.text.muted,
  },
  
  header: {
    backgroundColor: colors.paper[50],
    borderBottomColor: colors.primary[200],
    borderBottomWidth: 1,
  },
  
  statusBadge: {
    backgroundColor: colors.primary[100],
    color: colors.primary[700],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
};

// Utility functions
export const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info') => {
  switch (status) {
    case 'success': return colors.success[500];
    case 'error': return colors.error[500];
    case 'warning': return colors.warning[500];
    case 'info': return colors.text.important;
    default: return colors.primary[500];
  }
};

export const getStatusBackgroundColor = (status: 'success' | 'error' | 'warning' | 'info') => {
  switch (status) {
    case 'success': return colors.success[50];
    case 'error': return colors.error[50];
    case 'warning': return colors.warning[50];
    case 'info': return colors.primary[50];
    default: return colors.primary[50];
  }
};

// Export theme object for easy access
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  components,
  getStatusColor,
  getStatusBackgroundColor,
};

export default theme; 