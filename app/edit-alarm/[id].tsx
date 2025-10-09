import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  WorkoutCountModal,
  DaySelector,
  ColorSelector,
  MelodySelector,
  WorkoutSelector,
} from '@/components';
import { useAlarmSound, useAlarms } from '@/hooks';
import { ALARM_COLORS, MELODIES, WORKOUT_TYPES, MelodyType } from '@/constants';
import { CustomSound, getCustomSounds } from '@/utils/customSoundManager';
import { theme } from '@/styles/theme';

export default function EditAlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alarms, loadAlarms, updateAlarm } = useAlarms();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state with alarm data
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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

  // Load alarms first, then populate form
  useEffect(() => {
    const initialize = async () => {
      // Load alarms from storage
      await loadAlarms();
    };

    initialize();
  }, []);

  // Load alarm data when alarms are loaded
  useEffect(() => {
    const loadAlarmData = async () => {
      // Wait for alarms to be loaded
      if (alarms.length === 0) {
        return;
      }

      const alarm = alarms.find((a) => a.id === id);

      if (!alarm) {
        Alert.alert('Error', 'Alarm not found', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      // Parse time and set date
      const [hours, minutes] = alarm.time.split(':').map(Number);
      let alarmHours = hours;
      if (alarm.period === 'PM' && hours !== 12) {
        alarmHours += 12;
      } else if (alarm.period === 'AM' && hours === 12) {
        alarmHours = 0;
      }

      const date = new Date();
      date.setHours(alarmHours);
      date.setMinutes(minutes);
      setSelectedDate(date);

      // Set other fields
      setSelectedDays(alarm.days);
      setTitle(alarm.title);
      setSelectedColor(alarm.color);

      // Find workout type
      const workout = WORKOUT_TYPES.find((w) => w.name === alarm.workoutType);
      if (workout) {
        setWorkoutType(workout);
      }
      setWorkoutCount(alarm.workoutCount);

      // Find melody (built-in or custom)
      const melody = MELODIES.find((m) => m.file === alarm.melody);
      if (melody) {
        setSelectedMelody(melody);
      } else {
        // Check custom sounds
        const customSounds = await getCustomSounds();
        const customSound = customSounds.find((s) => s.id === alarm.melody);
        if (customSound) {
          setSelectedMelody(customSound);
        }
      }

      setIsLoading(false);
    };

    loadAlarmData();
  }, [alarms, id]);

  const handleWorkoutTypeChange = (workout: (typeof WORKOUT_TYPES)[0]) => {
    setWorkoutType(workout);
    setWorkoutCount(workout.defaultCount);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
  };

  const handleUpdateAlarm = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for the alarm');
      return;
    }

    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    const melodyIdentifier =
      'file' in selectedMelody ? selectedMelody.file : selectedMelody.id;

    const success = await updateAlarm(id, {
      title: title,
      time: `${String(displayHours).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')}`,
      period: period as 'AM' | 'PM',
      days: selectedDays,
      color: selectedColor,
      melody: melodyIdentifier,
      workoutType: workoutType.name,
      workoutCount,
    });

    if (success) {
      Alert.alert('Success', 'Alarm updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to update alarm. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading alarm...</Text>
      </View>
    );
  }

  // Get the alarm after loading is complete
  const alarm = alarms.find((a) => a.id === id);

  if (!alarm) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Alarm</Text>
        <TouchableOpacity onPress={handleUpdateAlarm}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Alarm Time</Text>

          {Platform.OS === 'android' && !showTimePicker && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {selectedDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
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
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
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
    fontWeight: theme.typography.fontWeight.semibold,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
});
