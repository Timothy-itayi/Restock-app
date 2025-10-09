# Skeleton Loading Components

This directory contains skeleton loading components for the Restock app. These components provide a smooth loading experience by showing placeholder content that matches the actual screen layout.

## Components

### `SkeletonBox`
A reusable animated skeleton box component that can be used to create skeleton layouts.

**Props:**
- `width`: Width of the skeleton box (number or percentage string)
- `height`: Height of the skeleton box
- `borderRadius`: Border radius for rounded corners
- `style`: Additional styles
- `backgroundColor`: Background color (defaults to `#e9ecef`)

### Screen-Specific Skeletons

#### `DashboardSkeleton`
Skeleton for the dashboard screen showing:
- Welcome section with user name and store name placeholders
- Quick actions grid with icon and text placeholders
- Unfinished sessions cards with supplier breakdown placeholders

#### `RestockSessionsSkeleton`
Skeleton for the restock sessions screen showing:
- Start section with instructions
- Session flow with product list placeholders
- Action buttons

#### `EmailsSkeleton`
Skeleton for the emails screen showing:
- Email summary section
- Email list with supplier info and action placeholders
- Send all button

#### `ProfileSkeleton`
Skeleton for the profile screen showing:
- Header with title and settings button
- Profile section with avatar and user info
- Store plan card
- Stats cards
- Sign out section

#### `WelcomeSkeleton`
Skeleton for the welcome screen showing:
- Header with title and subtitle
- Email input field
- Action buttons
- Divider
- Alternative sign-in options
- Footer text

#### `SignInSkeleton`
Skeleton for the sign-in screen showing:
- Header with title and subtitle
- Returning user button
- Google sign-in button
- Link button
- Divider
- Email and password inputs
- Sign-in button

## Usage

```tsx
import { DashboardSkeleton } from '../components/skeleton';

// In your component
if (loading) {
  return <DashboardSkeleton />;
}
```

## Features

- **Animated**: All skeleton components use smooth opacity animations
- **Responsive**: Skeleton boxes support both fixed widths and percentage widths
- **Consistent**: All skeletons use the same color scheme and animation timing
- **Lightweight**: Minimal performance impact with efficient animations

## Customization

You can customize the skeleton appearance by:

1. **Colors**: Modify the `backgroundColor` prop in `SkeletonBox`
2. **Animation**: Adjust the animation duration in the `useEffect` hook
3. **Layout**: Update the skeleton structure to match your screen layout

## Best Practices

1. **Match Layout**: Ensure skeleton components closely match the actual screen layout
2. **Consistent Timing**: Use the same animation duration across all skeletons
3. **Appropriate Sizing**: Use realistic dimensions that match actual content
4. **Performance**: Skeleton components should be lightweight and not impact app performance

## Implementation Notes

- All skeletons use the same base `SkeletonBox` component for consistency
- Animations are handled with React Native's `Animated` API
- Skeletons are designed to work with the existing style systems
- Components are exported through an index file for easy importing 