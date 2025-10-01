// 🧪 Phase 1 Test Helper Functions
// Copy and paste these into your components to debug

// Test 1: Check AsyncStorage directly
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugAsyncStorage() {
  const data = await AsyncStorage.getItem('alarms');
  console.log('=== AsyncStorage Debug ===');
  console.log('Raw data:', data);
  if (data) {
    console.log('Parsed:', JSON.parse(data));
    console.log('Count:', JSON.parse(data).length);
  } else {
    console.log('No alarms stored yet');
  }
  console.log('========================');
}

// Test 2: Clear all alarms (for testing)
export async function clearAllAlarms() {
  await AsyncStorage.removeItem('alarms');
  console.log('✅ All alarms cleared from storage');
}

// Test 3: Add test alarm programmatically
export async function addTestAlarm() {
  const testAlarm = {
    id: Date.now().toString(),
    title: 'Test Alarm',
    time: '09:30',
    period: 'AM',
    days: ['Mon', 'Wed', 'Fri'],
    color: '#FF6B6B',
    melody: 'default',
    enabled: true,
    workoutType: 'Squats',
    workoutCount: 10,
  };

  const existing = await AsyncStorage.getItem('alarms');
  const alarms = existing ? JSON.parse(existing) : [];
  alarms.push(testAlarm);
  await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
  console.log('✅ Test alarm added:', testAlarm);
}

// Test 4: Verify alarm manager singleton
import { AlarmManager } from './alarmManager';

export async function testAlarmManager() {
  console.log('=== AlarmManager Test ===');
  const manager = AlarmManager.getInstance();
  const alarms = await manager.loadAlarms();
  console.log('Loaded alarms:', alarms);
  console.log('Count:', alarms.length);
  console.log('========================');
}

// HOW TO USE:
// 1. Import in your index.tsx:
//    import { debugAsyncStorage, testAlarmManager } from '@/utils/testHelpers';
//
// 2. Add button to test:
//    <Button title="Debug Storage" onPress={debugAsyncStorage} />
//
// 3. Or call in useEffect:
//    useEffect(() => {
//      debugAsyncStorage();
//    }, []);
