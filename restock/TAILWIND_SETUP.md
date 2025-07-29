# Tailwind CSS Setup for Restock App

This document outlines the Tailwind CSS (NativeWind) setup and the new component system for the Restock app.

## 🎨 Overview

The Restock app now uses **NativeWind** (Tailwind CSS for React Native) for consistent, modern styling. This provides:

- **Consistent Design System**: Centralized theme with sage green colors
- **Rapid Development**: Utility-first CSS classes
- **Type Safety**: Full TypeScript support
- **Modern Components**: Reusable, accessible components

## 📦 Dependencies

### Core Dependencies
- `nativewind`: Tailwind CSS for React Native
- `tailwindcss`: Tailwind CSS core (dev dependency)

### Configuration Files
- `tailwind.config.js`: Tailwind configuration with custom theme
- `babel.config.js`: Babel configuration for NativeWind
- `global.css`: Global CSS imports
- `app/theme/index.ts`: Centralized theme configuration

## 🎯 Theme System

### Color Palette

#### Sage Green (Primary Brand)
```typescript
sage: {
  50: '#F7F8F7',   // Lightest
  100: '#E8EDE8',
  200: '#D1DCD1',
  300: '#B4C5B4',
  400: '#8FA68F',
  500: '#6B7F6B',  // Primary
  600: '#5A6A5A',
  700: '#4A574A',
  800: '#3D463D',
  900: '#333A33',  // Darkest
}
```

#### Neutral Colors
```typescript
neutral: {
  50: '#FAFAFA',   // Backgrounds
  100: '#F5F5F5',
  200: '#E5E5E5',  // Borders
  300: '#D4D4D4',
  400: '#A3A3A3',  // Placeholder text
  500: '#737373',  // Secondary text
  600: '#525252',
  700: '#404040',  // Primary text
  800: '#262626',
  900: '#171717',
}
```

#### Status Colors
- **Success**: `success-500` (#22C55E) - Green
- **Warning**: `warning-500` (#F59E0B) - Amber
- **Error**: `error-500` (#EF4444) - Red
- **Info**: `info-500` (#3B82F6) - Blue

### Typography
```typescript
sizes: {
  xs: 12,    // Captions
  sm: 14,    // Small text
  base: 16,  // Body text
  lg: 18,    // Large text
  xl: 20,    // Headings
  '2xl': 24, // Large headings
  '3xl': 30, // Page titles
  '4xl': 36, // Hero text
}
```

### Spacing
```typescript
xs: 4,   // 4px
sm: 8,   // 8px
md: 16,  // 16px
lg: 24,  // 24px
xl: 32,  // 32px
'2xl': 48, // 48px
'3xl': 64, // 64px
```

## 🧩 Component Library

### Button Component
```tsx
import { Button } from '../components';

<Button 
  title="Click me" 
  onPress={handlePress}
  variant="primary" // primary | secondary | outline | ghost
  size="md"         // sm | md | lg
  disabled={false}
  loading={false}
  fullWidth={false}
/>
```

### Input Component
```tsx
import { Input } from '../components';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  variant="default" // default | filled | outlined
  size="md"         // sm | md | lg
  error="Invalid email"
  helperText="We'll never share your email"
  leftIcon={<Ionicons name="mail" size={20} />}
  fullWidth
/>
```

### Card Component
```tsx
import { Card } from '../components';

<Card
  title="Card Title"
  subtitle="Card subtitle"
  variant="default" // default | elevated | outlined
  padding="md"      // none | sm | md | lg
>
  <Text>Card content goes here</Text>
</Card>
```

### Toast Component
```tsx
import { CustomToast } from '../components';

<CustomToast
  visible={showToast}
  type="success" // success | info | warning | error
  title="Success!"
  message="Your action was completed successfully."
  autoDismiss={true}
  duration={4000}
  onDismiss={() => setShowToast(false)}
/>
```

## 🎨 Usage Examples

### Basic Styling
```tsx
// Background colors
<View className="bg-sage-500" />
<View className="bg-neutral-50" />

// Text colors
<Text className="text-neutral-900" />
<Text className="text-sage-500" />

// Spacing
<View className="p-4 m-2" />
<View className="px-6 py-3" />

// Typography
<Text className="text-lg font-semibold" />
<Text className="text-sm text-neutral-600" />

// Borders and shadows
<View className="border border-neutral-200 rounded-lg shadow-soft" />
```

### Responsive Design
```tsx
// Conditional styling
<View className="w-full md:w-1/2 lg:w-1/3" />

// Flexbox
<View className="flex-row items-center justify-between" />
<View className="flex-1 space-y-4" />
```

### Interactive States
```tsx
// Hover and active states
<Button className="active:bg-sage-600" />
<Input className="focus:border-sage-500" />
```

## 🔧 Configuration

### Tailwind Config (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: { /* sage green palette */ },
        neutral: { /* neutral palette */ },
        success: { /* status colors */ },
        // ... other colors
      },
      // Custom spacing, typography, shadows, etc.
    },
  },
  plugins: [],
}
```

### Babel Config (`babel.config.js`)
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "types": ["nativewind/types"]
  }
}
```

## 🚀 Getting Started

### 1. Import Global CSS
In your root layout (`app/_layout.tsx`):
```tsx
import '../global.css';
```

### 2. Use Tailwind Classes
```tsx
<View className="bg-white p-4 rounded-lg shadow-soft">
  <Text className="text-lg font-semibold text-neutral-900">
    Hello World
  </Text>
</View>
```

### 3. Use Theme Utilities
```tsx
import { theme } from '../theme';

<View style={{ backgroundColor: theme.colors.sage[500] }}>
  <Text style={{ color: theme.colors.neutral[50] }}>
    Themed content
  </Text>
</View>
```

## 📱 Component Demo

To see all components in action, check out the `ComponentDemo.tsx` file:
```tsx
import ComponentDemo from '../components/ComponentDemo';

// Use in your app to showcase all components
<ComponentDemo />
```

## 🎯 Best Practices

### 1. Use Semantic Class Names
```tsx
// ✅ Good
<Text className="text-lg font-semibold text-neutral-900" />

// ❌ Avoid
<Text className="text-20 font-bold text-black" />
```

### 2. Leverage Component Variants
```tsx
// ✅ Use component variants
<Button variant="primary" size="md" />

// ❌ Avoid inline styling
<Button className="bg-sage-500 text-white px-4 py-3" />
```

### 3. Use Theme Utilities for Dynamic Values
```tsx
// ✅ Use theme for dynamic values
const statusColor = theme.getStatusColor(status);

// ❌ Avoid hardcoded values
const statusColor = '#22C55E';
```

### 4. Maintain Consistency
```tsx
// ✅ Consistent spacing
<View className="space-y-4">
  <Card />
  <Card />
  <Card />
</View>

// ❌ Inconsistent spacing
<View>
  <Card className="mb-4" />
  <Card className="mb-4" />
  <Card />
</View>
```

## 🔄 Migration Guide

### From StyleSheet to Tailwind
```tsx
// Before (StyleSheet)
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

<View style={styles.container} />

// After (Tailwind)
<View className="bg-white p-4 rounded-lg shadow-soft" />
```

### From Custom Colors to Theme
```tsx
// Before
const colors = {
  primary: '#6B7F6B',
  background: '#F5F5F5',
};

// After
import { theme } from '../theme';

const colors = theme.colors;
// Use: colors.sage[500], colors.neutral[100], etc.
```

## 🐛 Troubleshooting

### Common Issues

1. **Classes not working**: Ensure `nativewind/babel` is in your Babel config
2. **TypeScript errors**: Make sure `nativewind/types` is in your tsconfig
3. **Hot reload issues**: Restart the development server after config changes

### Debug Mode
Enable debug mode to see which classes are being applied:
```tsx
// Add to your component
<View className="debug" />
```

## 📚 Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Native Styling Guide](https://reactnative.dev/docs/style)

---

This setup provides a modern, scalable styling system for the Restock app with consistent design tokens and reusable components. 