import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { Animated } from 'react-native';

export default function AlarmActiveScreen() {
  // Static UI placeholders
  const alarm = {
    title: 'Morning Alarm',
    color: '#FF6B6B',
  };

  const session = {
    type: 'jumping-jacks',
    target: 20,
    current: 5,
    unit: 'reps',
    isActive: true,
  };

  const pulseAnim = new Animated.Value(1);

  // Static helper functions
  const getWorkoutTitle = () => {
    return session.type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getWorkoutInstructions = () => 'Jump with arms and legs spread, then return to start position';

  const getMotivationalMessage = () => "Keep it up! You're doing great! 💪";

  return (
    <View style={[styles.container, { backgroundColor: alarm.color }]}>
      <View style={styles.header}>
        <Text style={styles.alarmText}>ALARM ACTIVE</Text>
        <Text style={styles.timeText}>07:00 AM</Text>
        <Text style={styles.alarmTitle}>{alarm.title}</Text>
      </View>

      <View style={styles.workoutSection}>
        <Animated.View style={[styles.workoutTitleContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.workoutTitle}>{getWorkoutTitle()}</Text>
        </Animated.View>
        
        <Text style={styles.instructions}>{getWorkoutInstructions()}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{session.current}</Text>
            <Text style={styles.targetText}>/ {session.target} {session.unit}</Text>
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

        <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>

        {session.isActive && (
          <View style={styles.detectionIndicator}>
            <MaterialIcons 
              name="sensors" 
              size={24} 
              color="rgba(255,255,255,0.8)" 
            />
            <Text style={styles.detectionText}>Movement Detection Active</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.emergencyButton}>
          <MaterialIcons name="warning" size={20} color="white" />
          <Text style={styles.emergencyText}>Emergency Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 40 },
  alarmText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 2, marginBottom: 8 },
  timeText: { fontSize: 42, fontWeight: '700', color: 'white', marginBottom: 8 },
  alarmTitle: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  workoutSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  workoutTitleContainer: { marginBottom: 20 },
  workoutTitle: { fontSize: 28, fontWeight: '700', color: 'white', textAlign: 'center' },
  instructions: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 40, lineHeight: 22, paddingHorizontal: 20 },
  progressSection: { alignItems: 'center', marginBottom: 30 },
  counterContainer: { alignItems: 'center', marginBottom: 20 },
  counterText: { fontSize: 56, fontWeight: '800', color: 'white' },
  targetText: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  progressCircle: { marginVertical: 20 },
  motivationText: { fontSize: 18, fontWeight: '600', color: 'white', textAlign: 'center', marginBottom: 30 },
  detectionIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  detectionText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginLeft: 8 },
  bottomSection: { paddingBottom: 30 },
  emergencyButton: { flexDirection: 'row', backgroundColor: 'rgba(220, 38, 38, 0.8)', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emergencyText: { fontSize: 16, fontWeight: '600', color: 'white', marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  loadingText: { fontSize: 18, color: 'white' },
});
