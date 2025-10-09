import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  TimePickerModal,
  WorkoutCountModal,
  DaySelector,
  ColorSelector,
  MelodySelector,
  WorkoutSelector,
} from '@/components';
import { useAlarmSound, useAlarms } from '@/hooks';
import {
  ALARM_COLORS,
  MELODIES,
  WORKOUT_TYPES,
  DEFAULT_WORKOUT_DAYS,
} from '@/constants';
import { TimeState } from '@/types';
import { theme } from '@/styles/theme';

export default function AddAlarmScreen() {
  const [time, setTime] = useState<TimeState>({ hours: 9, minutes: 0 });
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    DEFAULT_WORKOUT_DAYS as unknown as string[]
  );
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(ALARM_COLORS[0]);
  const [selectedMelody, setSelectedMelody] = useState(MELODIES[0]);
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [workoutCount, setWorkoutCount] = useState(
    WORKOUT_TYPES[0].defaultCount
  );
  const [showCountModal, setShowCountModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const { playPreviewSound } = useAlarmSound();
  const { saveAlarm } = useAlarms();

  const handleWorkoutTypeChange = (workout: (typeof WORKOUT_TYPES)[0]) => {
    setWorkoutType(workout);
    setWorkoutCount(workout.defaultCount);
  };

  const handleSaveAlarm = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for the alarm');
      return;
    }

    const success = await saveAlarm({
      title: title || 'New Alarm',
      time: `${String(time.hours).padStart(2, '0')}:${String(
        time.minutes
      ).padStart(2, '0')}`,
      period,
      days: selectedDays,
      color: selectedColor,
      melody: selectedMelody.file,
      enabled: true,
      workoutType: workoutType.name,
      workoutCount,
    });

    if (success) {
      Alert.alert('Success', 'Alarm created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Alarm</Text>
        <TouchableOpacity onPress={handleSaveAlarm}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <TouchableOpacity
          style={styles.timePickerContainer}
          onPress={() => setShowTimeModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.timePicker}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Hours</Text>
              <View style={styles.timeValues}>
                <Text style={styles.inactiveTime}>
                  {String(time.hours === 1 ? 12 : time.hours - 1).padStart(
                    2,
                    '0'
                  )}
                </Text>
                <Text style={styles.activeTime}>
                  {String(time.hours).padStart(2, '0')}
                </Text>
                <Text style={styles.inactiveTime}>
                  {String(time.hours === 12 ? 1 : time.hours + 1).padStart(
                    2,
                    '0'
                  )}
                </Text>
              </View>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Minutes</Text>
              <View style={styles.timeValues}>
                <Text style={styles.inactiveTime}>
                  {String((time.minutes + 59) % 60).padStart(2, '0')}
                </Text>
                <Text style={styles.activeTime}>
                  {String(time.minutes).padStart(2, '0')}
                </Text>
                <Text style={styles.inactiveTime}>
                  {String((time.minutes + 1) % 60).padStart(2, '0')}
                </Text>
              </View>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Period</Text>
              <View style={styles.timeValues}>
                <Text style={styles.inactiveTime}>
                  {period === 'AM' ? 'PM' : 'AM'}
                </Text>
                <Text style={styles.activeTime}>{period}</Text>
                <Text style={styles.inactiveTime}>
                  {period === 'AM' ? 'PM' : 'AM'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.tapToEditText}>Tap to edit time</Text>
        </TouchableOpacity>

        {/* Days Selector */}
        <View style={styles.section}>
          <DaySelector
            selectedDays={selectedDays}
            onToggleDay={(day) =>
              setSelectedDays((prev) =>
                prev.includes(day)
                  ? prev.filter((d) => d !== day)
                  : [...prev, day]
              )
            }
          />
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Color Selection */}
        <ColorSelector
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />

        {/* Melody Selection */}
        <MelodySelector
          selectedMelody={selectedMelody}
          onSelectMelody={setSelectedMelody}
          onPreviewMelody={playPreviewSound}
        />

        {/* Workout Selection */}
        <WorkoutSelector
          selectedWorkout={workoutType}
          workoutCount={workoutCount}
          onSelectWorkout={handleWorkoutTypeChange}
          onEditCount={() => setShowCountModal(true)}
        />
      </ScrollView>

      <TimePickerModal
        visible={showTimeModal}
        time={time}
        period={period}
        onTimeChange={setTime}
        onPeriodChange={setPeriod}
        onClose={() => setShowTimeModal(false)}
      />
      <WorkoutCountModal
        visible={showCountModal}
        workoutType={workoutType}
        count={workoutCount}
        onCountChange={setWorkoutCount}
        onClose={() => setShowCountModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  cancelText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  saveText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  timePickerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  timeValues: {
    alignItems: 'center',
  },
  inactiveTime: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.border.dark,
    marginVertical: 5,
  },
  activeTime: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginVertical: 5,
  },
  timeSeparator: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  tapToEditText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginTop: 10,
    textAlign: 'center',
  },
});
