

// Font Family Constants - Satoshi Font Weights
// These match the font names loaded in _layout.tsx
export const fontFamily = {
  // Base Satoshi fonts
  satoshi: 'Satoshi-Regular',
  satoshiLight: 'Satoshi-Light',
  satoshiMedium: 'Satoshi-Medium',
  satoshiBold: 'Satoshi-Bold',
  satoshiBlack: 'Satoshi-Black',
  
  // Italic variants
  satoshiItalic: 'Satoshi-Italic',
  satoshiLightItalic: 'Satoshi-LightItalic',
  satoshiMediumItalic: 'Satoshi-MediumItalic',
  satoshiBoldItalic: 'Satoshi-BoldItalic',
  satoshiBlackItalic: 'Satoshi-BlackItalic',
  
  // Aliases for common use cases
  regular: 'Satoshi-Regular',
  light: 'Satoshi-Light',
  medium: 'Satoshi-Medium',
  bold: 'Satoshi-Bold',
  black: 'Satoshi-Black',
  italic: 'Satoshi-Italic',
} as const;

// Typography scale following CMS design principles
export const typography = {
  // App Title - Black weight for maximum impact
  appTitle: {
    fontFamily: fontFamily.satoshiBlack,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900' as const,
  },
  
  // Section Headers - Bold weight for clear hierarchy
  sectionHeader: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  
  // Subsection Headers - Bold weight, smaller size
  subsectionHeader: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  
  // Product Names & Buttons - Medium weight for readability
  productName: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  
  buttonText: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  
  // Body Text - Regular weight for main content
  bodyLarge: {
    fontFamily: fontFamily.satoshi,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  
  bodyMedium: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  
  bodySmall: {
    fontFamily: fontFamily.satoshi,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  
  // Caption & Metadata - Light weight for subtle information
  caption: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '300' as const,
  },
  
  metadata: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '300' as const,
  },
  
  // Emphasis & Notes - Italic for user-entered content
  emphasis: {
    fontFamily: fontFamily.satoshiItalic,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
  },
  
  noteText: {
    fontFamily: fontFamily.satoshiItalic,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
  },
  
  // Legal & System Text - Light weight for minimal presence
  legalText: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '300' as const,
  },
  
  systemTag: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '300' as const,
  },
};

// Tailwind utility classes for typography
export const typographyClasses = {
  // App Title
  'text-app-title': 'font-satoshi-black text-3xl leading-10 font-black',
  
  // Section Headers
  'text-section-header': 'font-satoshi-bold text-2xl leading-8 font-bold',
  'text-subsection-header': 'font-satoshi-bold text-xl leading-7 font-bold',
  
  // Product Names & Buttons
  'text-product-name': 'font-satoshi-medium text-base leading-6 font-medium',
  'text-button': 'font-satoshi-medium text-base leading-6 font-medium',
  
  // Body Text
  'text-body-large': 'font-satoshi text-lg leading-7 font-normal',
  'text-body-medium': 'font-satoshi text-base leading-6 font-normal',
  'text-body-small': 'font-satoshi text-sm leading-5 font-normal',
  
  // Caption & Metadata
  'text-caption': 'font-satoshi-light text-xs leading-4 font-light',
  'text-metadata': 'font-satoshi-light text-xs leading-3 font-light',
  
  // Emphasis & Notes
  'text-emphasis': 'font-satoshi-italic text-base leading-6 font-normal italic',
  'text-note': 'font-satoshi-italic text-sm leading-5 font-normal italic',
  
  // Legal & System
  'text-legal': 'font-satoshi-light text-xs leading-3 font-light',
  'text-system': 'font-satoshi-light text-xs leading-3 font-light',
};

// Typography scale for consistent sizing
export const fontSize = {
  xs: 12,    // Caption, metadata
  sm: 14,    // Body small, notes
  base: 16,  // Body medium, buttons, product names
  lg: 18,    // Body large
  xl: 20,    // Subsection headers
  '2xl': 24, // Section headers
  '3xl': 32, // App title
};

// Line height scale for optimal readability
export const lineHeight = {
  tight: 1.2,    // Headers
  normal: 1.5,   // Body text
  relaxed: 1.75, // Large body text
  loose: 2,      // Notes and emphasis
};

// Font weight mapping
export const fontWeight = {
  thin: '100',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

// Typography variants for different contexts
export const typographyVariants = {
  // Headers
  h1: typography.appTitle,
  h2: typography.sectionHeader,
  h3: typography.subsectionHeader,
  
  // Content
  body: typography.bodyMedium,
  bodyLarge: typography.bodyLarge,
  bodySmall: typography.bodySmall,
  
  // Interactive elements
  button: typography.buttonText,
  product: typography.productName,
  
  // Specialized content
  note: typography.noteText,
  emphasis: typography.emphasis,
  caption: typography.caption,
  metadata: typography.metadata,
  legal: typography.legalText,
  system: typography.systemTag,
};

export default typography; 