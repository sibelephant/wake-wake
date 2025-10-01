import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkoutCompleteScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || '';

  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Celebration animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Celebration haptics
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 300);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const handleViewHistory = () => {
    router.push('/workout-history');
  };

  return (
    <LinearGradient colors={['#10b981', '#059669']} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={120} color="white" />
        </View>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You completed your workout!</Text>

        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>🎉 Workout Complete!</Text>
          <Text style={styles.achievementSubtext}>
            You're officially awake and energized!
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="fitness-center" size={24} color="white" />
            <Text style={styles.statLabel}>Workout</Text>
            <Text style={styles.statValue}>Completed</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="alarm" size={24} color="white" />
            <Text style={styles.statLabel}>Alarm</Text>
            <Text style={styles.statValue}>Dismissed</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="energy-savings-leaf" size={24} color="white" />
            <Text style={styles.statLabel}>Energy</Text>
            <Text style={styles.statValue}>Boosted</Text>
          </View>
        </View>

        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            "The way you start your morning sets the tone for your entire day.
            Great job taking control!"
          </Text>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleViewHistory}
        >
          <MaterialIcons name="history" size={20} color="#10b981" />
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  achievementContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  achievementSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  motivationContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 10,
  },
  motivationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingBottom: 30,
    gap: 15,
  },
  historyButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});
