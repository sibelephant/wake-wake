import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { useWorkoutDetector } from '@/components/WorkoutDetector';
import { useAlarms } from '@/hooks';
import { WORKOUT_TYPES, SOUND_MAP } from '@/constants';

export default function AlarmActiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alarms } = useAlarms();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const alarmSoundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Find the alarm data
  const alarm = alarms.find((a) => a.id === id);

  // Get workout type configuration
  const workoutType =
    WORKOUT_TYPES.find((w) => w.name === alarm?.workoutType) ||
    WORKOUT_TYPES[0];

  // Workout detection hook
  const { currentCount, reset } = useWorkoutDetector({
    workoutType: alarm?.workoutType || 'steps',
    targetCount: alarm?.workoutCount || 100,
    onProgress: (count) => {
      // Trigger pulse animation on each rep
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    },
    onComplete: async () => {
      // Stop alarm sound
      if (alarmSoundRef.current) {
        await alarmSoundRef.current.stopAsync();
        await alarmSoundRef.current.unloadAsync();
      }
      // Navigate to completion screen
      router.replace(`/workout-complete/${id}`);
    },
    isActive: true,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Play alarm sound on mount
  useEffect(() => {
    const playAlarmSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        const soundSource = alarm?.melody
          ? SOUND_MAP[alarm.melody]
          : SOUND_MAP['alarm.mp3'];

        if (soundSource) {
          const { sound } = await Audio.Sound.createAsync(soundSource, {
            isLooping: true,
            volume: 1.0,
          });

          alarmSoundRef.current = sound;
          await sound.playAsync();
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error playing alarm sound:', error);
        setIsLoading(false);
      }
    };

    playAlarmSound();

    return () => {
      // Cleanup sound on unmount
      if (alarmSoundRef.current) {
        alarmSoundRef.current.stopAsync();
        alarmSoundRef.current.unloadAsync();
      }
    };
  }, [alarm?.melody]);

  // Show loading state or handle missing alarm
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Starting alarm...</Text>
      </View>
    );
  }

  if (!alarm) {
    Alert.alert('Error', 'Alarm not found', [
      { text: 'OK', onPress: () => router.back() },
    ]);
    return null;
  }

  // Format time display
  const formatTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Get dynamic workout instructions
  const getWorkoutInstructions = () => {
    const instructions: Record<string, string> = {
      'jumping-jacks': 'Jump and spread your arms and legs',
      'push-ups': 'Lower your chest to the ground and push back up',
      'sit-ups': 'Lie down and lift your upper body',
      squats: 'Lower your body and stand back up',
      burpees: 'Drop down, push-up, jump up',
      steps: 'Walk around or march in place',
      plank: 'Hold your body in a straight line',
      'mountain-climbers': 'Alternate bringing knees to chest',
    };
    return instructions[alarm.workoutType] || 'Complete your workout exercise';
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const progress = currentCount / (alarm.workoutCount || 1);

    if (progress < 0.25) {
      return 'Great start! Keep the momentum going!';
    } else if (progress < 0.5) {
      return "You're doing amazing! Almost halfway there!";
    } else if (progress < 0.75) {
      return "Awesome job! You're more than halfway!";
    } else if (progress < 0.95) {
      return "So close! Don't give up now!";
    } else {
      return "Final push! You've got this!";
    }
  };

  // Handle emergency dismiss
  const handleEmergencyDismiss = async () => {
    Alert.alert(
      'Emergency Dismiss',
      'Are you sure you want to dismiss this alarm without completing the workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: async () => {
            if (alarmSoundRef.current) {
              await alarmSoundRef.current.stopAsync();
              await alarmSoundRef.current.unloadAsync();
            }
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM ACTIVE</Text>
        <Text style={styles.timeText}>{formatTime()}</Text>
      </View>

      <View style={styles.workoutSection}>
        <Animated.View
          style={[
            styles.workoutTitleContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.workoutTitle}>{workoutType.display}</Text>
        </Animated.View>

        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>

        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{currentCount}</Text>
            <Text style={styles.targetText}>
              / {alarm.workoutCount} {workoutType.unit}
            </Text>
          </View>

          <Progress.Circle
            size={140}
            progress={Math.min(currentCount / (alarm.workoutCount || 1), 1)}
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
          <Text style={styles.fireEmoji}> 🔥</Text>
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyDismiss}
        >
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
    paddingTop: 50,
  },
  header: { alignItems: 'center', marginBottom: 50 },
  alarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 56,
    fontWeight: '300',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -2,
  },
  alarmTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
  },
  workoutSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  workoutTitleContainer: { marginBottom: 20 },
  workoutTitle: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: { fontSize: 18, color: 'white' },
});
