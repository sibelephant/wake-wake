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
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  WorkoutCountModal,
  DaySelector,
  ColorSelector,
  MelodySelector,
  WorkoutSelector,
  StyledText,
  TextMedium,
  TextSemiBold,
} from '@/components';
import { useAlarmSound, useAlarms } from '@/hooks';
import {
  ALARM_COLORS,
  MELODIES,
  WORKOUT_TYPES,
  DEFAULT_WORKOUT_DAYS,
  MelodyType,
} from '@/constants';
import { CustomSound } from '@/utils/customSoundManager';
import { theme } from '@/styles/theme';

export default function AddAlarmScreen() {
  // Create a Date object for the time picker
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(9);
    date.setMinutes(0);
    return date;
  });

  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    DEFAULT_WORKOUT_DAYS as unknown as string[]
  );
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(ALARM_COLORS[0]);
  const [selectedMelody, setSelectedMelody] = useState<
    MelodyType | CustomSound
  >(MELODIES[0]);
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [workoutCount, setWorkoutCount] = useState(
    WORKOUT_TYPES[0].defaultCount
  );
  const [showCountModal, setShowCountModal] = useState(false);

  const { playPreviewSound } = useAlarmSound();
  const { saveAlarm } = useAlarms();

  const handleWorkoutTypeChange = (workout: (typeof WORKOUT_TYPES)[0]) => {
    setWorkoutType(workout);
    setWorkoutCount(workout.defaultCount);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    // On Android, hide the picker when user dismisses or selects
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    // Update the time if a date was selected (not cancelled)
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
  };

  const handleSaveAlarm = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for the alarm');
      return;
    }

    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    // Get melody identifier (file name for built-in, id for custom)
    const melodyIdentifier =
      'file' in selectedMelody ? selectedMelody.file : selectedMelody.id;

    const success = await saveAlarm({
      title: title,
      time: `${String(displayHours).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')}`,
      period: period as 'AM' | 'PM',
      days: selectedDays,
      color: selectedColor,
      melody: melodyIdentifier,
      enabled: true,
      workoutType: workoutType.name,
      workoutCount,
    });

    if (success) {
      // Navigate back immediately (don't wait for alert)
      router.dismiss();
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Alarm created successfully!');
      }, 100);
    } else {
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <StyledText style={styles.cancelText}>Cancel</StyledText>
        </TouchableOpacity>
        <TextSemiBold style={styles.headerTitle}>Add Alarm</TextSemiBold>
        <TouchableOpacity onPress={handleSaveAlarm}>
          <TextSemiBold style={styles.saveText}>Save</TextSemiBold>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.section}>
          <TextSemiBold style={styles.sectionTitle}>
            Set Alarm Time
          </TextSemiBold>

          {Platform.OS === 'android' && !showTimePicker && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <TextSemiBold style={styles.timeButtonText}>
                {selectedDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </TextSemiBold>
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.dateTimePicker}
            />
          )}
        </View>

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
    color: theme.colors.text.primary,
  },
  saveText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  timeButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
  },
  dateTimePicker: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
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
});
