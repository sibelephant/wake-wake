import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WORKOUT_TYPES, WorkoutType, UI_COLORS } from '@/constants';

interface WorkoutSelectorProps {
  selectedWorkout: WorkoutType;
  workoutCount: number;
  onSelectWorkout: (workout: WorkoutType) => void;
  onEditCount: () => void;
}

export const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({
  selectedWorkout,
  workoutCount,
  onSelectWorkout,
  onEditCount,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Wake-up Workout</Text>
      {/* <View style={styles.workoutContainer}>
        {WORKOUT_TYPES.map((workout) => (
          <TouchableOpacity
            key={workout.name}
            style={[
              styles.workoutButton,
              selectedWorkout.name === workout.name &&
                styles.workoutButtonActive,
            ]}
            onPress={() => onSelectWorkout(workout)}
          >
            <Text
              style={[
                styles.workoutText,
                selectedWorkout.name === workout.name &&
                  styles.workoutTextActive,
              ]}
            >
              {workout.display}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
      <TouchableOpacity style={styles.countCustomizer} onPress={onEditCount}>
        <Text style={styles.countCustomizerText}>
          {workoutCount} {selectedWorkout.unit}
        </Text>
        <MaterialIcons name="edit" size={20} color={UI_COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
    marginBottom: 12,
  },
  workoutContainer: {
    gap: 12,
  },
  workoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: UI_COLORS.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workoutButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: UI_COLORS.primary,
  },
  workoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: UI_COLORS.text.secondary,
    textAlign: 'center',
  },
  workoutTextActive: {
    color: UI_COLORS.primary,
  },
  countCustomizer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: UI_COLORS.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.border.medium,
  },
  countCustomizerText: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
  },
});
