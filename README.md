# ⏰ WakeWake - Walking Steps Alarm App

A React Native Expo app that helps you wake up by requiring you to complete walking steps before dismissing the alarm.

## 🎯 Features

- **Walking Steps Workout**: Only workout type - count steps by walking or marching in place
- **Custom Alarm Sounds**: Choose your own audio files for alarm sounds
- **Background Notifications**: Alarms trigger even when app is closed (requires standalone build)
- **Poppins Font**: Modern, clean typography throughout the app
- **Workout History**: Track your completed workouts with clear history option
- **Persistent Alarms**: Alarms stored in AsyncStorage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# For notifications to work, build standalone app:
npx expo run:android
# or
eas build --platform android
```

### Development

```bash
# Start with cache cleared (if code changes not reflecting)
npx expo start --clear

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## 📱 How to Use

### Creating an Alarm

1. Tap the `+` button on the home screen
2. Set the alarm time
3. Choose which days to repeat
4. Select walking steps target (default: 100 steps)
5. Pick an alarm sound (built-in or custom)
6. Save the alarm

### Adding Custom Sounds

1. In the alarm sound picker, tap "Add Custom Sound"
2. Select an audio file from your device
3. The sound will be available for all alarms

### When Alarm Triggers

1. Notification appears with sound (even if app is closed)
2. Tap notification to open alarm screen
3. Start walking or marching in place
4. Complete the target number of steps
5. Alarm dismisses automatically when goal reached

### Viewing Workout History

1. Go to "Workout History" tab
2. See all completed workout sessions
3. Tap "Clear History" to remove all entries

## 🎨 Technology Stack

- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based navigation
- **AsyncStorage** - Data persistence
- **Expo Notifications** - Background alarms
- **Expo Sensors** - Step detection via Accelerometer
- **Poppins Font** - Typography

## 📁 Project Structure

```
/app                      # Expo Router screens
  /(tabs)                 # Tab navigation screens
    index.tsx             # Alarms list
    workout-history.tsx   # Workout history
    timezones.tsx         # Timezones (placeholder)
  /alarm-active           # Active alarm screen
  /workout-complete       # Completion screen
  add-alarm.tsx           # Create new alarm
  _layout.tsx             # Root layout

/components               # Reusable components
  WorkoutDetector.tsx     # Step counting logic
  StyledText.tsx          # Poppins text components

/constants                # App constants
  workouts.ts             # Workout type config
  sounds.ts               # Built-in sounds

/hooks                    # Custom React hooks
  useAlarms.ts            # Alarm management
  useFrameworkReady.ts    # Font loading

/utils                    # Utility functions
  alarmManager.ts         # Alarm scheduling
  notificationManager.ts  # Notification handling
  customSoundManager.ts   # Custom sound storage
  helpers.ts              # General helpers

/styles                   # Theme configuration
  theme.ts                # Colors, spacing, typography
```

## 🔧 Configuration

### Step Detection Settings

Located in `components/WorkoutDetector.tsx`:

- **Threshold**: 1.3g (optimized for walking)
- **Update Interval**: 100ms
- **Detection**: Accelerometer magnitude changes

### Notification Settings

Located in `utils/notificationManager.ts`:

- **Priority**: MAX (Android)
- **Sound**: Enabled
- **Auto-dismiss**: No (requires workout completion)

## ⚠️ Important Notes

### Background Notifications

- **Don't work in Expo Go** - Expo Go has limitations
- **Require standalone build** - Use `eas build` or `expo run:android`
- **Android only for now** - iOS requires additional permissions setup

### Custom Sounds

- Stored in app's file system using expo-file-system/legacy
- Fallback to default sound if custom sound fails
- File format: MP3 recommended

## 🛠️ Troubleshooting

### Alarms not triggering when app closed

**Solution**: Build a standalone app. Expo Go doesn't support background notifications.

```bash
npx expo run:android
```

### Custom sound not playing

**Solution**: Check console logs for errors. Sound will fallback to default alarm.mp3 if custom sound fails.

### Code changes not reflecting

**Solution**: Clear Metro bundler cache.

```bash
npx expo start --clear
```

### Font not loading

**Solution**: Ensure fonts are loaded before rendering. Check `app/_layout.tsx` for font loading logic.

## 📄 License

MIT

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- Poppins font by Indian Type Foundry
