# Typography Guide - Satoshi Font Family

This guide outlines how to use the Satoshi font family in the Restock app, following CMS-style design principles for optimal readability and hierarchy.

## 🎨 Font Family Overview

The Restock app uses the complete Satoshi font family with the following weights and styles:

### Font Weights
- **Satoshi-Black** (900) - Maximum impact for app titles
- **Satoshi-Bold** (700) - Clear hierarchy for section headers
- **Satoshi-Medium** (500) - Readability for product names and buttons
- **Satoshi-Regular** (400) - Main content and body text
- **Satoshi-Light** (300) - Subtle information like captions and metadata

### Italic Variants
- **Satoshi-Italic** - User-entered content and emphasis
- **Satoshi-LightItalic** - Subtle emphasis
- **Satoshi-MediumItalic** - Medium emphasis
- **Satoshi-BoldItalic** - Strong emphasis
- **Satoshi-BlackItalic** - Maximum emphasis

## 📏 Typography Scale

### Font Sizes
```typescript
xs: 12,    // Captions, metadata
sm: 14,    // Body small, notes
base: 16,  // Body medium, buttons, product names
lg: 18,    // Body large
xl: 20,    // Subsection headers
2xl: 24,   // Section headers
3xl: 32,   // App title
```

### Line Heights
```typescript
tight: 1.2,    // Headers
normal: 1.4,   // Body text
relaxed: 1.6,  // Large body text
loose: 1.8,    // Notes and emphasis
```

## 🎯 Usage Guidelines

### 1. App Titles & Brand Elements
**Font**: `Satoshi-Black`
**Use Case**: App title, hero text, maximum impact elements
```typescript
// In StyleSheet
title: {
  fontFamily: 'Satoshi-Black',
  fontSize: 32,
  fontWeight: '900',
  lineHeight: 40,
}

// In Tailwind
className="font-satoshi-black text-3xl leading-10 font-black"
```

### 2. Section Headers
**Font**: `Satoshi-Bold`
**Use Case**: Page sections, major content divisions
```typescript
// In StyleSheet
sectionHeader: {
  fontFamily: 'Satoshi-Bold',
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 32,
}

// In Tailwind
className="font-satoshi-bold text-2xl leading-8 font-bold"
```

### 3. Product Names & Buttons
**Font**: `Satoshi-Medium`
**Use Case**: Product names, button text, interactive elements
```typescript
// In StyleSheet
productName: {
  fontFamily: 'Satoshi-Medium',
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 24,
}

// In Tailwind
className="font-satoshi-medium text-base leading-6 font-medium"
```

### 4. Body Text
**Font**: `Satoshi-Regular`
**Use Case**: Main content, descriptions, general text
```typescript
// In StyleSheet
bodyText: {
  fontFamily: 'Satoshi-Regular',
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 24,
}

// In Tailwind
className="font-satoshi text-base leading-6 font-normal"
```

### 5. Captions & Metadata
**Font**: `Satoshi-Light`
**Use Case**: Timestamps, system tags, legal info, subtle information
```typescript
// In StyleSheet
caption: {
  fontFamily: 'Satoshi-Light',
  fontSize: 12,
  fontWeight: '300',
  lineHeight: 16,
}

// In Tailwind
className="font-satoshi-light text-xs leading-4 font-light"
```

### 6. Emphasis & Notes
**Font**: `Satoshi-Italic`
**Use Case**: User-entered notes, emphasis, special content
```typescript
// In StyleSheet
noteText: {
  fontFamily: 'Satoshi-Italic',
  fontSize: 14,
  fontWeight: '400',
  fontStyle: 'italic',
  lineHeight: 20,
}

// In Tailwind
className="font-satoshi-italic text-sm leading-5 font-normal italic"
```

## 🔧 Implementation Examples

### In React Native StyleSheet
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // App title
  appTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    color: '#000000',
  },
  
  // Section header
  sectionHeader: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#000000',
  },
  
  // Product name
  productName: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#000000',
  },
  
  // Body text
  bodyText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#000000',
  },
  
  // Caption
  caption: {
    fontFamily: 'Satoshi-Light',
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 16,
    color: '#6C757D',
  },
  
  // Note text
  noteText: {
    fontFamily: 'Satoshi-Italic',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 20,
    color: '#000000',
  },
});
```

### In Tailwind CSS (NativeWind)
```typescript
// App title
<Text className="font-satoshi-black text-3xl leading-10 font-black text-primary-800">
  Restock
</Text>

// Section header
<Text className="font-satoshi-bold text-2xl leading-8 font-bold text-primary-800">
  Recent Sessions
</Text>

// Product name
<Text className="font-satoshi-medium text-base leading-6 font-medium text-primary-800">
  Organic Bananas
</Text>

// Body text
<Text className="font-satoshi text-base leading-6 font-normal text-primary-800">
  This is the main content text.
</Text>

// Caption
<Text className="font-satoshi-light text-xs leading-4 font-light text-text-secondary">
  Last updated 2 hours ago
</Text>

// Note text
<Text className="font-satoshi-italic text-sm leading-5 font-normal italic text-primary-800">
  User note: Need to check supplier availability
</Text>
```

### Using Theme Typography Variants
```typescript
import { theme } from '../theme';

// Using predefined variants
<Text style={theme.typography.variants.appTitle}>
  Restock
</Text>

<Text style={theme.typography.variants.sectionHeader}>
  Recent Sessions
</Text>

<Text style={theme.typography.variants.productName}>
  Organic Bananas
</Text>

<Text style={theme.typography.variants.bodyMedium}>
  This is body text.
</Text>

<Text style={theme.typography.variants.caption}>
  Last updated 2 hours ago
</Text>

<Text style={theme.typography.variants.noteText}>
  User note: Need to check supplier availability
</Text>
```

## 🎨 Design Principles

### 1. Hierarchy
- Use **Black** for maximum impact (app titles)
- Use **Bold** for clear hierarchy (section headers)
- Use **Medium** for readability (product names, buttons)
- Use **Regular** for main content
- Use **Light** for subtle information

### 2. Consistency
- Maintain consistent font weights across similar elements
- Use the same font family for related content
- Follow the established typography scale

### 3. Readability
- Ensure sufficient contrast between text and background
- Use appropriate line heights for optimal reading
- Consider screen size and viewing distance

### 4. Emphasis
- Use **Italic** variants sparingly for emphasis
- Reserve **Light** weights for metadata and captions
- Use **Bold** and **Black** for important information

## 🔍 Testing Fonts

To test that all fonts are loading correctly, use the `FontTest` component:

```typescript
import FontTest from './components/FontTest';

// In your screen
<FontTest />
```

This component displays all Satoshi font variants to verify they're loading properly.

## 📱 Responsive Considerations

- Font sizes should scale appropriately on different screen sizes
- Consider using relative units where possible
- Test readability on both small and large devices
- Ensure touch targets remain accessible with larger fonts

## 🎯 Best Practices

1. **Consistency**: Use the same font weight for similar elements across the app
2. **Hierarchy**: Establish clear visual hierarchy using font weights
3. **Readability**: Prioritize readability over decorative styling
4. **Performance**: Fonts are loaded once and cached for optimal performance
5. **Accessibility**: Ensure sufficient contrast and readable font sizes
6. **Maintenance**: Use the theme system for easy updates and consistency

## 🔄 Migration Notes

When updating existing components:

1. Replace generic `fontWeight` with specific `fontFamily` declarations
2. Use the theme's typography variants for consistency
3. Update both StyleSheet and Tailwind implementations
4. Test on different devices to ensure proper rendering
5. Verify that all font weights are loading correctly

This typography system provides a solid foundation for the Restock app's design, ensuring consistency, readability, and professional appearance across all screens and components. 