import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Animated,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as KeepAwake from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';


interface WorkoutSession {
  type: string;
  target: number;
  current: number;
  isActive: boolean;
  unit: string;
}

interface Alarm {
  id: string;
  title: string;
  workoutType: string;
  workoutCount: number;
  workoutUnit: string;
  melody: any;
  color: string;
}

export default function AlarmActiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [session, setSession] = useState<WorkoutSession>({
    type: 'jumping-jacks',
    target: 20,
    current: 0,
    isActive: true,
    unit: 'reps',
  });
  
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [sound, setSound] = useState<Audio.Sound>();
  const [isDetecting, setIsDetecting] = useState(true);
  const lastMovementTime = useRef(Date.now());
  const movementThreshold = 1.5;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadAlarmData();
    KeepAwake.activateKeepAwake();
    
    const backAction = () => {
      Alert.alert('Complete Workout', 'You must complete your workout to dismiss the alarm!', [
        { text: 'OK', style: 'default' }
      ]);
      return true;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    startAccelerometer();
    playAlarmSound();
    startPulseAnimation();

    return () => {
      KeepAwake.deactivateKeepAwake();
      backHandler.remove();
      Accelerometer.removeAllListeners();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAlarmData = async () => {
    try {
      const alarms = await AsyncStorage.getItem('alarms');
      if (alarms) {
        const parsedAlarms = JSON.parse(alarms);
        const currentAlarm = parsedAlarms.find((a: Alarm) => a.id === id);
        if (currentAlarm) {
          setAlarm(currentAlarm);
          setSession({
            type: currentAlarm.workoutType,
            target: currentAlarm.workoutCount,
            current: 0,
            isActive: true,
            unit: currentAlarm.workoutUnit,
          });
        }
      }
    } catch (error) {
      console.error('Error loading alarm data:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(100);
    Accelerometer.addListener(accelerometerData => {
      setAccelerometerData(accelerometerData);
      if (isDetecting) {
        detectMovement(accelerometerData);
      }
    });
  };

  const detectMovement = (data: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    const now = Date.now();
    
    if (magnitude > movementThreshold && now - lastMovementTime.current > 600) {
      lastMovementTime.current = now;
      incrementCount();
    }
  };

  const incrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.vibrate(100);
    
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
      
      setIsDetecting(false);
      
      // Save workout completion
      const workoutHistory = {
        alarmId: id,
        completedAt: new Date().toISOString(),
        workoutType: session.type,
        target: session.target,
        completed: session.target,
        duration: Date.now() - lastMovementTime.current,
      };
      
      const existingHistory = await AsyncStorage.getItem('workoutHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(workoutHistory);
      await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      router.replace(`/workout-complete/${id}`);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const playAlarmSound = async () => {
    try {
      // Create a simple beep sound using Audio
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      setSound(sound);
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      // Fallback to vibration if sound fails
      const vibrationPattern = [1000, 1000, 1000, 1000];
      Vibration.vibrate(vibrationPattern, true);
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
      case 'squats':
        return 'Lower your body by bending knees, then stand back up';
      case 'burpees':
        return 'Drop to push-up, jump feet to hands, then jump up';
      case 'steps':
        return 'Walk around or march in place';
      case 'plank':
        return 'Hold plank position - keep your body straight';
      case 'mountain-climbers':
        return 'In plank position, alternate bringing knees to chest';
      default:
        return 'Complete the exercise movements';
    }
  };

  const getWorkoutTitle = () => {
    return session.type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getMotivationalMessage = () => {
    const progress = session.current / session.target;
    if (progress === 0) return "Time to wake up! Let's get moving! 💪";
    if (progress < 0.3) return "Great start! Keep the momentum going! 🔥";
    if (progress < 0.6) return "You're doing amazing! Halfway there! 💯";
    if (progress < 0.9) return "Almost done! Push through! 🚀";
    return "Final stretch! You've got this! 🎉";
  };

  if (!alarm) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading alarm...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: alarm.color }]}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM ACTIVE</Text>
        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </Text>
        <Text style={styles.alarmTitle}>{alarm.title}</Text>
      </View>

      <View style={styles.workoutSection}>
        <Animated.View style={[styles.workoutTitleContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.workoutTitle}>{getWorkoutTitle()}</Text>
        </Animated.View>
        
        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {session.current}
            </Text>
            <Text style={styles.targetText}>
              / {session.target} {session.unit}
            </Text>
          </View>
          
          <Progress.Circle
            size={120}
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
          {getMotivationalMessage()}
        </Text>

        {session.isActive && (
          <View style={styles.detectionIndicator}>
            <MaterialIcons 
              name="sensors" 
              size={24} 
              color="rgba(255,255,255,0.8)" 
            />
            <Text style={styles.detectionText}>
              Movement Detection Active
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => {
            Alert.alert(
              'Emergency Dismiss',
              'Are you sure you want to dismiss this alarm? This should only be used in emergencies.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Dismiss', 
                  style: 'destructive',
                  onPress: () => router.replace('/(tabs)')
                }
              ]
            );
          }}>
          <MaterialIcons name="warning" size={20} color="white" />
          <Text style={styles.emergencyText}>Emergency Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  alarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 42,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  alarmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  workoutSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitleContainer: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  counterText: {
    fontSize: 56,
    fontWeight: '800',
    color: 'white',
  },
  targetText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  progressCircle: {
    marginVertical: 20,
  },
  motivationText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  detectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detectionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  bottomSection: {
    paddingBottom: 30,
  },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});