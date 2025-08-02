# Font Usage Guide - Restock App

## Overview

The Restock app uses a centralized typography system with font family constants to ensure consistent font usage across all components. All Satoshi fonts are properly loaded in the app and available through the `fontFamily` constants.

## Font Loading

✅ **Fonts are already loaded** in `app/_layout.tsx` using `useFonts` from expo-font:
- All Satoshi font weights are configured in `app.json`
- Fonts are loaded before the app renders
- No additional setup required

## Available Font Families

### Base Fonts
```typescript
import { fontFamily } from '../styles/typography';

// Regular weights
fontFamily.satoshi        // 'Satoshi-Regular'
fontFamily.satoshiLight   // 'Satoshi-Light'
fontFamily.satoshiMedium  // 'Satoshi-Medium'
fontFamily.satoshiBold    // 'Satoshi-Bold'
fontFamily.satoshiBlack   // 'Satoshi-Black'

// Italic variants
fontFamily.satoshiItalic        // 'Satoshi-Italic'
fontFamily.satoshiLightItalic   // 'Satoshi-LightItalic'
fontFamily.satoshiMediumItalic  // 'Satoshi-MediumItalic'
fontFamily.satoshiBoldItalic    // 'Satoshi-BoldItalic'
fontFamily.satoshiBlackItalic   // 'Satoshi-BlackItalic'

// Common aliases
fontFamily.regular  // 'Satoshi-Regular'
fontFamily.light    // 'Satoshi-Light'
fontFamily.medium   // 'Satoshi-Medium'
fontFamily.bold     // 'Satoshi-Bold'
fontFamily.black    // 'Satoshi-Black'
fontFamily.italic   // 'Satoshi-Italic'
```

## Usage Patterns

### 1. In Component Style Files

```typescript
// styles/components/my-component.ts
import { StyleSheet } from 'react-native';
import { fontFamily } from '../typography';

export const myComponentStyles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 24,
    color: '#000000',
  },
  
  body: {
    fontFamily: fontFamily.satoshi,
    fontSize: 16,
    color: '#333333',
  },
  
  caption: {
    fontFamily: fontFamily.satoshiLight,
    fontSize: 12,
    color: '#666666',
  },
});
```

### 2. Using Pre-defined Typography Variants

```typescript
// styles/components/my-component.ts
import { StyleSheet } from 'react-native';
import { typography } from '../typography';

export const myComponentStyles = StyleSheet.create({
  // Use complete typography objects
  appTitle: typography.appTitle,
  sectionHeader: typography.sectionHeader,
  bodyMedium: typography.bodyMedium,
  buttonText: typography.buttonText,
  caption: typography.caption,
});
```

### 3. In Component Files

```typescript
// app/components/MyComponent.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { myComponentStyles } from '../../styles/components/my-component';

export const MyComponent = () => {
  return (
    <View>
      <Text style={myComponentStyles.title}>Title</Text>
      <Text style={myComponentStyles.body}>Body text</Text>
      <Text style={myComponentStyles.caption}>Caption</Text>
    </View>
  );
};
```

## Typography Scale

### Pre-defined Typography Variants

```typescript
import { typography } from '../styles/typography';

// Available variants:
typography.appTitle        // Black, 32px - App titles
typography.sectionHeader   // Bold, 24px - Section headers
typography.subsectionHeader // Bold, 20px - Subsection headers
typography.productName     // Medium, 16px - Product names
typography.buttonText      // Medium, 16px - Button text
typography.bodyLarge       // Regular, 18px - Large body text
typography.bodyMedium      // Regular, 16px - Medium body text
typography.bodySmall       // Regular, 14px - Small body text
typography.caption         // Light, 12px - Captions
typography.metadata        // Light, 11px - Metadata
typography.emphasis        // Italic, 16px - Emphasis text
typography.noteText        // Italic, 14px - Notes
typography.legalText       // Light, 10px - Legal text
typography.systemTag       // Light, 9px - System tags
```

## Migration Guide

### From Hardcoded Font Families

**Before:**
```typescript
const styles = StyleSheet.create({
  title: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
  },
});
```

**After:**
```typescript
import { fontFamily } from '../typography';

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 24,
  },
});
```

### From Theme Typography

**Before:**
```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  title: theme.typography.variants.sectionHeader,
});
```

**After:**
```typescript
import { typography } from '../typography';

const styles = StyleSheet.create({
  title: typography.sectionHeader,
});
```

## Best Practices

1. **Always import from typography.ts**: Use the centralized font family constants
2. **Use semantic names**: Choose font families based on their purpose, not just weight
3. **Consistent sizing**: Use the typography scale for consistent font sizes
4. **Prefer variants**: Use pre-defined typography variants when possible
5. **Type safety**: The `as const` assertion ensures type safety

## Common Use Cases

### Headers
```typescript
// App titles
fontFamily: fontFamily.satoshiBlack

// Section headers
fontFamily: fontFamily.satoshiBold

// Subsection headers
fontFamily: fontFamily.satoshiBold
```

### Body Text
```typescript
// Main content
fontFamily: fontFamily.satoshi

// Secondary content
fontFamily: fontFamily.satoshiLight
```

### Interactive Elements
```typescript
// Buttons
fontFamily: fontFamily.satoshiMedium

// Links
fontFamily: fontFamily.satoshiMedium
```

### Specialized Text
```typescript
// Emphasis
fontFamily: fontFamily.satoshiItalic

// Captions
fontFamily: fontFamily.satoshiLight

// Metadata
fontFamily: fontFamily.satoshiLight
```

## Troubleshooting

### Font Not Loading
- Check that fonts are properly configured in `app.json`
- Verify fonts are loaded in `app/_layout.tsx`
- Ensure font files exist in `assets/fonts/Satoshi/`

### TypeScript Errors
- Make sure you're importing from the correct path
- Use the exact font family names from the constants
- Check that `as const` is properly applied

### Styling Issues
- Verify the font family constant matches the loaded font name
- Check that the font weight and style properties are consistent
- Ensure the component is importing the correct style file 