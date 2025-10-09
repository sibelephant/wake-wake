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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
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
    <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM ACTIVE</Text>
        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
        {/* {alarm && (
          <Text style={styles.alarmTitle}>{alarm.title || 'Test new'}</Text>
        )} */}
      </View>

      <View style={styles.workoutSection}>
        <Text style={styles.workoutTitle}>{getWorkoutTitle()}</Text>
        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>

        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{session.current}</Text>
            <Text style={styles.targetText}>/ {session.target} reps</Text>
          </View>

          <Progress.Circle
            size={140}
            progress={session.current / session.target}
            showsText={false}
            color="rgba(255,255,255,0.9)"
            unfilledColor="rgba(255,255,255,0.2)"
            borderWidth={0}
            thickness={8}
            style={styles.progressCircle}
          />
        </View>

        <Text style={styles.motivationText}>
          {session.current === 0 && 'Great start! Keep the momentum going!'}
          {session.current > 0 &&
            session.current < session.target &&
            'Great start! Keep the momentum going!'}
          {session.current >= session.target && 'Amazing! You did it!'}
          <Text style={styles.fireEmoji}> 🔥</Text>
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.emergencyButton}>
          <MaterialIcons name="warning" size={20} color="white" />
          <Text style={styles.emergencyText}>Emergency Dismiss</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: { alignItems: 'center', marginBottom: 80 },
  alarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3,
    marginBottom: 30,
  },
  timeText: {
    fontSize: 56,
    fontWeight: '300',
    color: 'white',
    marginBottom: 25,
    letterSpacing: -2,
  },
  alarmTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  workoutSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  workoutTitle: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 30,
  },
  instructions: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  progressSection: { alignItems: 'center', marginBottom: 40 },
  counterContainer: { alignItems: 'center', marginBottom: 30 },
  counterText: {
    fontSize: 120,
    fontWeight: '200',
    color: 'white',
    letterSpacing: -5,
  },
  targetText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontWeight: '300',
  },
  progressCircle: { marginVertical: 30 },
  motivationText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 28,
  },
  fireEmoji: {
    fontSize: 20,
  },
  bottomSection: { paddingBottom: 40 },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});
