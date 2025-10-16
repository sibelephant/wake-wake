# Poppins Font Integration

## Overview

The app now uses **Poppins** font family throughout the entire interface for a modern, clean look.

## Available Font Weights

- `Poppins_400Regular` - Regular weight (default)
- `Poppins_500Medium` - Medium weight
- `Poppins_600SemiBold` - Semi-bold weight
- `Poppins_700Bold` - Bold weight

## Usage

### Option 1: Use StyledText Components (Recommended)

```tsx
import { StyledText, TextMedium, TextBold } from '@/components';

// Default (regular)
<StyledText>Regular text</StyledText>

// With variant prop
<StyledText variant="bold">Bold text</StyledText>

// Using convenience components
<TextMedium>Medium weight text</TextMedium>
<TextBold>Bold text</TextBold>
```

### Option 2: Use Theme Font Family

```tsx
import { theme } from '@/styles/theme';

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
  },
  body: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 16,
  },
});
```

### Option 3: Direct Font Name

```tsx
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins_600SemiBold',
  },
});
```

## Font Loading

Fonts are loaded in `app/_layout.tsx` using `expo-font` and the splash screen is shown until fonts are ready.

## Migration Guide

To update existing Text components:

**Before:**

```tsx
<Text style={styles.title}>Hello</Text>
```

**After:**

```tsx
<StyledText variant="bold" style={styles.title}>Hello</StyledText>
// or
<TextBold style={styles.title}>Hello</TextBold>
```

## Benefits

- ✅ Modern, professional typography
- ✅ Consistent font across all screens
- ✅ Easy to change weights with variants
- ✅ Better readability
- ✅ Google Fonts integration
