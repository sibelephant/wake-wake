import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as KeepAwake from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

interface WorkoutSession {
  type: 'jumping-jacks' | 'push-ups' | 'sit-ups';
  target: number;
  current: number;
  isActive: boolean;
}

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<WorkoutSession>({
    type: 'jumping-jacks',
    target: 20,
    current: 0,
    isActive: true,
  });
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [sound, setSound] = useState<Audio.Sound>();
  const lastMovementTime = useRef(Date.now());
  const movementThreshold = 1.5;

  useEffect(() => {
    // Keep screen awake
    KeepAwake.activateKeepAwake();
    
    // Disable back button
    const backAction = () => {
      Alert.alert('Complete Workout', 'You must complete your workout to dismiss the alarm!');
      return true;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Start accelerometer
    startAccelerometer();
    
    // Play alarm sound
    playAlarmSound();

    return () => {
      KeepAwake.deactivateKeepAwake();
      backHandler.remove();
      Accelerometer.removeAllListeners();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(100);
    Accelerometer.addListener(accelerometerData => {
      setAccelerometerData(accelerometerData);
      detectMovement(accelerometerData);
    });
  };

  const detectMovement = (data: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    const now = Date.now();
    
    if (magnitude > movementThreshold && now - lastMovementTime.current > 500) {
      lastMovementTime.current = now;
      incrementCount();
    }
  };

  const incrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSession(prev => {
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
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
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
      const { sound } = await Audio.Sound.createAsync(
        // Using a system sound for the alarm
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
    } catch (error) {
      console.error('Error playing alarm sound:', error);
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
    return session.type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM</Text>
        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
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
                { width: `${(session.current / session.target) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {session.isActive && (
          <View style={styles.motionIndicator}>
            <Text style={styles.motionText}>
              Movement: {accelerometerData.x.toFixed(2)}, {accelerometerData.y.toFixed(2)}, {accelerometerData.z.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.motivationSection}>
        <Text style={styles.motivationText}>
          {session.current === 0 && "Let's get moving! 💪"}
          {session.current > 0 && session.current < session.target && "Keep going! You're doing great! 🔥"}
          {session.current >= session.target && "Amazing! You did it! 🎉"}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.emergencyButton, { opacity: 0.3 }]}
        onPress={() => Alert.alert('Emergency Only', 'This button is for emergencies only!')}>
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
    marginBottom: 10,
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