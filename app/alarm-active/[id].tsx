import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AlarmActiveScreen() {
  // Static UI placeholders matching the image
  const alarm = {
    title: 'Test new',
    color: '#FF8C42', // Orange gradient color
  };

  const session = {
    type: 'steps',
    target: 100,
    current: 19,
    unit: 'steps',
    isActive: true,
  };

  const pulseAnim = new Animated.Value(1);

  // Static helper functions
  const getWorkoutTitle = () => {
    return 'Steps';
  };

  const getWorkoutInstructions = () => 'Walk around or march in place';

  const getMotivationalMessage = () => 'Great start! Keep the momentum going!';

  return (
    <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM ACTIVE</Text>
        <Text style={styles.timeText}>8:12 AM</Text>
      </View>

      <View style={styles.workoutSection}>
        <Animated.View
          style={[
            styles.workoutTitleContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.workoutTitle}>{getWorkoutTitle()}</Text>
        </Animated.View>

        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>

        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{session.current}</Text>
            <Text style={styles.targetText}>
              / {session.target} {session.unit}
            </Text>
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
          {getMotivationalMessage()}
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
