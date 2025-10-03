import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import * as KeepAwake from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import AlarmManager, { Alarm } from '@/utils/alarmManager';

// Sound file mapping for dynamic requires
const SOUND_MAP: Record<string, any> = {
  'alarm.wav': require('@/assets/sounds/alarm.wav'),
  'gentle.wav': require('@/assets/sounds/gentle.wav'),
  'energetic.wav': require('@/assets/sounds/energetic.wav'),
  'nature.wav': require('@/assets/sounds/nature.wav'),
  'digital.wav': require('@/assets/sounds/digital.wav'),
  // Fallback for old MP3 format
  'alarm.mp3': require('@/assets/sounds/alarm.mp3'),
};

interface WorkoutSession {
  type: 'jumping-jacks' | 'push-ups' | 'sit-ups';
  target: number;
  current: number;
  isActive: boolean;
}

export default function WorkoutScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || '';

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [session, setSession] = useState<WorkoutSession>({
    type: 'jumping-jacks',
    target: 20,
    current: 0,
    isActive: true,
  });

  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastMovementTime = useRef(Date.now());
  const movementThreshold = 1.5;
  const accelerometerSubscription = useRef<{ remove: () => void } | null>(null);

  // Load alarm data
  useEffect(() => {
    const loadAlarmData = async () => {
      try {
        const alarmManager = AlarmManager.getInstance();
        const alarms = await alarmManager.loadAlarms();
        const foundAlarm = alarms.find((a) => a.id === id);

        if (foundAlarm) {
          setAlarm(foundAlarm);
          setSession({
            type: foundAlarm.workoutType as WorkoutSession['type'],
            target: foundAlarm.workoutCount,
            current: 0,
            isActive: true,
          });
        }
      } catch (error) {
        console.error('Error loading alarm:', error);
      }
    };

    loadAlarmData();
  }, [id]);

  useEffect(() => {
    // Keep screen awake
    KeepAwake.activateKeepAwakeAsync();

    // Disable back button
    const backAction = () => {
      Alert.alert(
        'Complete Workout',
        'You must complete your workout to dismiss the alarm!'
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Start accelerometer
    startAccelerometer();

    // Play alarm sound
    playAlarmSound();

    return () => {
      KeepAwake.deactivateKeepAwake();
      backHandler.remove();
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(100);
    accelerometerSubscription.current = Accelerometer.addListener((data) => {
      setAccelerometerData(data);
      detectMovement(data);
    });
  };

  const detectMovement = (data: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );
    const now = Date.now();

    if (magnitude > movementThreshold && now - lastMovementTime.current > 500) {
      lastMovementTime.current = now;
      incrementCount();
    }
  };

  const incrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSession((prev) => {
      const newCount = prev.current + 1;

      if (newCount >= prev.target) {
        completeWorkout();
        return { ...prev, current: newCount, isActive: false };
      }

      return { ...prev, current: newCount };
    });
  };

  const completeWorkout = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Workout Complete!',
        'Great job! Your alarm has been dismissed.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const playAlarmSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Use the alarm's selected melody
      const soundFile = alarm?.melody || 'alarm.wav';
      console.log(
        `🔔 Playing alarm sound: ${soundFile} for alarm: ${
          alarm?.title || 'Unknown'
        }`
      );

      // Get the sound source from the mapping
      const soundSource = SOUND_MAP[soundFile];
      if (!soundSource) {
        console.error(`Sound file not found: ${soundFile}, using default`);
        // Fallback to default alarm sound
        const { sound } = await Audio.Sound.createAsync(
          SOUND_MAP['alarm.wav'],
          { isLooping: true, volume: 1.0 }
        );
        soundRef.current = sound;
        await sound.playAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        isLooping: true,
        volume: 1.0,
      });

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      Alert.alert('Audio Error', 'Could not play alarm sound');
    }
  };

  const getWorkoutInstructions = () => {
    switch (session.type) {
      case 'jumping-jacks':
        return 'Jump with arms and legs spread, then return to start position';
      case 'push-ups':
        return 'Lower your body to the ground, then push back up';
      case 'sit-ups':
        return 'Lie down and raise your torso to a sitting position';
      default:
        return 'Complete the exercise movements';
    }
  };

  const getWorkoutTitle = () => {
    return session.type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM 🔔</Text>
        {alarm && (
          <Text style={styles.alarmTitle}>
            {alarm.title || 'Morning Workout'}
          </Text>
        )}
        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
      </View>

      <View style={styles.workoutSection}>
        <Text style={styles.workoutTitle}>{getWorkoutTitle()}</Text>
        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>

        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {session.current} / {session.target}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(session.current / session.target) * 100}%` },
              ]}
            />
          </View>
        </View>

        {session.isActive && (
          <View style={styles.motionIndicator}>
            <Text style={styles.motionText}>
              Movement: {accelerometerData.x.toFixed(2)},{' '}
              {accelerometerData.y.toFixed(2)}, {accelerometerData.z.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.motivationSection}>
        <Text style={styles.motivationText}>
          {session.current === 0 && "Let's get moving! 💪"}
          {session.current > 0 &&
            session.current < session.target &&
            "Keep going! You're doing great! 🔥"}
          {session.current >= session.target && 'Amazing! You did it! 🎉'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.emergencyButton, { opacity: 0.3 }]}
        onPress={() =>
          Alert.alert('Emergency Only', 'This button is for emergencies only!')
        }
      >
        <Text style={styles.emergencyText}>Emergency Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  alarmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    letterSpacing: 2,
    marginBottom: 8,
  },
  alarmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  workoutSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  counterText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#06b6d4',
    marginBottom: 20,
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  motionIndicator: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  motionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  motivationSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f59e0b',
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
