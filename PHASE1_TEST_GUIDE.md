# Phase 1 Testing Guide - WakeWake Alarm App

## Testing Date: October 1, 2025

## ✅ Phase 1 Features to Test

### 1. **Alarm Creation & Persistence**

- [ ] Navigate to "Add Alarm" tab
- [ ] Fill in alarm details:
  - Title (e.g., "Morning Workout")
  - Time (e.g., 07:00 AM)
  - Select days (e.g., Mon, Wed, Fri)
  - Choose workout type (Squats, Push-ups, Jumping Jacks)
  - Set workout count (e.g., 10 reps)
- [ ] Tap "Set Alarm"
- [ ] Verify alarm appears in the main alarm list
- [ ] **Expected:** Alarm saved to AsyncStorage and appears immediately

### 2. **Alarm List Display**

- [ ] Go back to main "Alarms" tab
- [ ] Verify created alarm is displayed with correct:
  - Title
  - Time
  - Days (abbreviated: Mon, Wed, Fri)
  - Enabled status (should be ON by default)
- [ ] **Expected:** All alarm details match what was entered

### 3. **Toggle Alarm On/Off**

- [ ] Tap the toggle switch on an alarm
- [ ] Watch the switch animate to OFF position
- [ ] **Expected:**
  - Visual feedback (switch color change)
  - Alarm status updates in AsyncStorage
  - Console log: "Skipping notifications in Expo Go" (in Expo Go)

### 4. **Delete Alarm**

- [ ] Long-press or find delete button on an alarm
- [ ] Confirm deletion if prompted
- [ ] **Expected:**
  - Alarm removed from list immediately
  - AsyncStorage updated
  - Alarm no longer appears after app reload

### 5. **Data Persistence**

- [ ] Create 2-3 different alarms
- [ ] Close the Expo Go app completely (force quit)
- [ ] Reopen the app
- [ ] **Expected:** All alarms still visible with correct settings

### 6. **Navigation Test**

- [ ] Create an alarm
- [ ] Navigate to "Workout History" tab
- [ ] Navigate back to "Alarms" tab
- [ ] **Expected:** Alarm still visible (useFocusEffect reload working)

### 7. **Multiple Alarms**

- [ ] Create 3+ alarms with different settings
- [ ] Toggle each one on/off individually
- [ ] **Expected:** Each alarm maintains its own state independently

## 🔍 What to Check in Console

Since you're running in **Expo Go**, you should see:

```
LOG  Skipping notifications in Expo Go
LOG  Skipping notification listeners in Expo Go
WARN  Notifications not supported in Expo Go
```

These are **EXPECTED** warnings - notifications work only in development/production builds.

## 🐛 Known Limitations in Expo Go

1. **Notifications Don't Work**: Real alarm scheduling is disabled in Expo Go
2. **No Actual Alarm Triggers**: Alarms won't ring at scheduled times
3. **Expo-AV Deprecation Warning**: You might see warnings about expo-av (we'll fix in Phase 2)

## ✅ Success Criteria

Phase 1 is successful if:

- ✅ You can create alarms and they appear in the list
- ✅ Alarms persist after closing/reopening the app
- ✅ Toggle switches update alarm enabled status
- ✅ Delete removes alarms permanently
- ✅ No TypeScript compilation errors
- ✅ App doesn't crash when navigating between tabs

## 📱 Manual Testing Steps

### Test Case 1: Create & View

```
1. Open Expo Go app
2. Tap "+" or "Add Alarm" tab
3. Enter: "Test Alarm", 09:30 AM, Monday
4. Select "Squats", set 15 reps
5. Tap "Set Alarm"
6. Go to "Alarms" tab
7. Verify alarm appears
```

### Test Case 2: Persistence

```
1. Create alarm "Morning Run"
2. Create alarm "Evening Workout"
3. Force close Expo Go
4. Reopen app
5. Check both alarms are still there
```

### Test Case 3: Toggle & Delete

```
1. Create test alarm
2. Toggle it OFF (green → gray)
3. Toggle it back ON
4. Delete the alarm
5. Verify it's gone
```

## 🔧 Debugging AsyncStorage

To verify data is actually being saved, you can add this debug code temporarily:

```typescript
// Add to index.tsx in useEffect
AsyncStorage.getItem('alarms').then((data) => {
  console.log('Raw AsyncStorage data:', data);
});
```

## 📊 Test Results Template

Copy this to track your testing:

```
✅ Alarm Creation: PASS / FAIL
✅ Alarm Display: PASS / FAIL
✅ Toggle On/Off: PASS / FAIL
✅ Delete Alarm: PASS / FAIL
✅ Data Persistence: PASS / FAIL
✅ Navigation: PASS / FAIL
✅ Multiple Alarms: PASS / FAIL

Issues Found:
- [Describe any issues]

Notes:
- [Any observations]
```

## 🚀 Next Steps After Testing

Once Phase 1 testing is complete:

1. Report any bugs or issues found
2. We'll fix critical issues
3. Move to Phase 2:
   - Complete expo-audio migration for workout screen
   - Build development APK for real notification testing
   - Implement workout history tracking
   - Add settings screen

## 💡 Tips

- **Reload app**: Shake phone → "Reload"
- **Clear cache**: Shake phone → "Clear Metro bundler cache"
- **View logs**: Terminal shows all console.log outputs
- **Inspector**: Shake phone → "Toggle Element Inspector" to debug UI

---

**Ready to test?** Open the Expo Go app and follow the test cases above!
