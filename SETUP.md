# 🛠️ Setup & Development Guide

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wakewake

# Install dependencies
npm install

# Start development server
npx expo start
```

## 🔧 Development Commands

### Start Development Server

```bash
# Normal start
npx expo start

# Clear cache (use when code changes not reflecting)
npx expo start --clear

# Development mode with go
npx expo start --go
```

### Run on Devices

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios

# Web (limited functionality)
npx expo start --web
```

### Build Standalone Apps

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Both
eas build --platform all
```

## ⚙️ Configuration

### Poppins Font

The app uses Poppins font family. Fonts are loaded in `app/_layout.tsx`:

```tsx
const [fontsLoaded] = useFonts({
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
});
```

**Usage:**

```tsx
import { StyledText, TextBold } from '@/components';

<StyledText>Regular text</StyledText>
<TextBold>Bold text</TextBold>
```

See `POPPINS_FONT_GUIDE.md` for more details.

### Step Detection

Configured in `components/WorkoutDetector.tsx`:

```typescript
// Settings
const THRESHOLD = 1.3; // g-force threshold for step detection
const UPDATE_INTERVAL = 100; // ms between accelerometer updates
```

**Adjusting sensitivity:**

- Increase threshold (e.g., 1.5) for less sensitive detection
- Decrease threshold (e.g., 1.1) for more sensitive detection

### Notifications

Configured in `utils/notificationManager.ts`:

```typescript
// Android notification priority
priority: Notifications.AndroidNotificationPriority.MAX;

// Sound enabled
sound: true;
```

**Important:** Notifications require standalone build. They don't work in Expo Go.

## 🧪 Testing

### Test Custom Sounds

1. Create an alarm
2. Tap "Add Custom Sound" in sound picker
3. Select an audio file
4. Check console for logs when alarm triggers

### Test Step Detection

1. Create alarm with 10 steps target (for quick testing)
2. Let alarm trigger
3. Walk or shake device
4. Watch counter increase
5. Complete steps to dismiss

### Test Background Notifications

**Requires standalone build:**

```bash
# Build and install
npx expo run:android

# Or use EAS
eas build --platform android --profile preview
```

Then:

1. Set alarm for 2 minutes from now
2. Close app completely
3. Wait for alarm time
4. Notification should appear with sound
5. Tap notification → opens to alarm screen

## 📦 Storage

The app uses AsyncStorage for data persistence:

### Storage Keys

- `alarms` - Array of alarm objects
- `workout_sessions` - Array of completed workouts
- `custom_sounds` - Array of custom sound references

### Data Structures

**Alarm:**

```typescript
{
  id: string;
  title: string;
  time: string; // HH:MM format
  enabled: boolean;
  days: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  workoutType: string; // Always "steps"
  workoutCount: number;
  melody: string; // Sound filename or custom_id
}
```

**Workout Session:**

```typescript
{
  id: string;
  alarmId: string;
  alarmTitle: string;
  workoutType: string;
  targetCount: number;
  completedCount: number;
  startTime: string;
  endTime: string;
  duration: number; // seconds
}
```

## 🐛 Debugging

### View Console Logs

- In Expo Go: Press `j` in terminal to open debugger
- In Chrome: Open `http://localhost:8081/debugger-ui`
- In standalone build: Use `adb logcat` (Android) or Xcode console (iOS)

### Common Issues

**1. Metro Bundler Cache Issues**

Symptom: Code changes not reflecting
Solution:

```bash
npx expo start --clear
```

**2. Font Not Loading**

Symptom: Text appears in system font
Solution: Check `app/_layout.tsx` - ensure fonts load before app renders

**3. Notifications Not Working**

Symptom: No notification when alarm triggers
Solution: Build standalone app (doesn't work in Expo Go)

**4. Custom Sound Not Playing**

Symptom: Default sound plays instead of custom
Solution: Check console logs for errors. Verify sound file exists.

## 🔄 Development Workflow

### Adding New Features

1. Create feature branch
2. Make changes
3. Test in Expo Go (if possible)
4. Build standalone for full testing
5. Create pull request

### Code Style

- Use TypeScript for type safety
- Follow Expo/React Native best practices
- Use Poppins font components for text
- Keep components small and focused
- Use hooks for state management

### File Organization

- **Screens** → `/app`
- **Components** → `/components`
- **Utilities** → `/utils`
- **Constants** → `/constants`
- **Hooks** → `/hooks`
- **Styles** → `/styles`

## 📝 Environment Variables

No environment variables required for basic functionality.

For production builds, configure in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "your-api-url"
      }
    }
  }
}
```

## 🚢 Deployment

### Android

```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## 📚 Additional Documentation

- `README.md` - Project overview and features
- `ARCHITECTURE.md` - System architecture and design
- `POPPINS_FONT_GUIDE.md` - Font usage guide
- `CUSTOM_SOUNDS.md` - Custom sound implementation details

## 🆘 Getting Help

1. Check console logs for errors
2. Review documentation files
3. Check Expo documentation: https://docs.expo.dev
4. Search GitHub issues
5. Create new issue with details

## ✅ Pre-deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Fonts loading correctly
- [ ] Notifications work in standalone build
- [ ] Custom sounds working
- [ ] Step detection accurate
- [ ] Workout history saves correctly
- [ ] App doesn't crash on alarm trigger
- [ ] Background notifications functioning
- [ ] Code linted and formatted
