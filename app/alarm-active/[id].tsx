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
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { useWorkoutDetector } from '@/components/WorkoutDetector';
import { StyledText, TextBold, TextSemiBold } from '@/components';
import { useAlarms } from '@/hooks';
import { WORKOUT_TYPES, SOUND_MAP } from '@/constants';
import { isCustomSound, getCustomSoundUri } from '@/utils/customSoundManager';

export default function AlarmActiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alarms, loadAlarms } = useAlarms();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(new Date());
  const alarmSoundRef = useRef<Audio.Sound | null>(null);

  // Find the alarm data
  const alarm = alarms.find((a) => a.id === id);

  // Load alarms if not loaded yet
  useEffect(() => {
    if (alarms.length === 0) {
      loadAlarms();
    }
  }, [alarms.length, loadAlarms]);

  // Get workout type configuration
  const workoutType =
    WORKOUT_TYPES.find((w) => w.name === alarm?.workoutType) ||
    WORKOUT_TYPES[0];

  // Workout detection hook
  const { currentCount, reset } = useWorkoutDetector({
    workoutType: alarm?.workoutType || 'steps',
    targetCount: alarm?.workoutCount || 100,
    onProgress: (count) => {
      // Animation removed for cleaner experience
    },
    onComplete: async () => {
      // Calculate duration in seconds
      const duration = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000
      );

      // Stop alarm sound
      if (alarmSoundRef.current) {
        await alarmSoundRef.current.stopAsync();
        await alarmSoundRef.current.unloadAsync();
      }

      // Navigate to completion screen with workout data
      const params = new URLSearchParams({
        alarmId: id || '',
        alarmTitle: alarm?.title || 'Alarm',
        workoutType: alarm?.workoutType || 'steps',
        target: (alarm?.workoutCount || 100).toString(),
        completed: (alarm?.workoutCount || 100).toString(),
        duration: duration.toString(),
      });

      router.push(`/workout-complete/${id}?${params.toString()}` as any);
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
    // Don't play sound until we have alarm data
    if (!alarm) {
      return;
    }

    const playAlarmSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        let soundSource;

        // Check if it's a custom sound
        if (alarm?.melody && isCustomSound(alarm.melody)) {
          const customUri = await getCustomSoundUri(alarm.melody);

          if (customUri) {
            soundSource = { uri: customUri };
          } else {
            console.warn('Custom sound URI not found, using default');
            soundSource = SOUND_MAP['samsung.mp3'];
          }
        } else {
          // Use built-in sound
          soundSource = alarm?.melody
            ? SOUND_MAP[alarm.melody]
            : SOUND_MAP['samsung.mp3'];
        }

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
  }, [alarm]);

  // Show loading state or handle missing alarm
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <StyledText style={styles.loadingText}>Starting alarm...</StyledText>
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
        <StyledText style={styles.alarmText}>ALARM ACTIVE</StyledText>
        <StyledText style={styles.timeText}>{formatTime()}</StyledText>
      </View>

      <View style={styles.workoutSection}>
        <View style={styles.workoutTitleContainer}>
          <StyledText style={styles.workoutTitle}>
            {workoutType.display}
          </StyledText>
        </View>

        <StyledText style={styles.instructions}>
          {getWorkoutInstructions()}
        </StyledText>

        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <StyledText style={styles.counterText}>{currentCount}</StyledText>
            <StyledText style={styles.targetText}>
              / {alarm.workoutCount} {workoutType.unit}
            </StyledText>
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

        <StyledText style={styles.motivationText}>
          {getMotivationalMessage()}
          <StyledText style={styles.fireEmoji}> 🔥</StyledText>
        </StyledText>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyDismiss}
        >
          <MaterialIcons name="warning" size={20} color="white" />
          <TextSemiBold style={styles.emergencyText}>
            Emergency Dismiss
          </TextSemiBold>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  alarmText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 48,
    color: 'white',
    letterSpacing: -1,
    textAlign: 'center',
  },
  alarmTitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 4,
  },
  workoutSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitleContainer: {
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
  },
  instructions: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  counterText: {
    fontSize: 96,
    color: 'white',
    letterSpacing: -4,
  },
  targetText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  progressCircle: {
    marginVertical: 24,
  },
  motivationText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    paddingHorizontal: 32,
  },
  fireEmoji: {
    fontSize: 18,
  },
  bottomSection: {
    paddingBottom: 32,
  },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
});
