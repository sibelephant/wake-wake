import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = [
  '#6366f1', '#ef4444', '#06b6d4', '#f97316',
  '#8b5cf6', '#84cc16', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4',
];

const MELODIES = [
  { name: 'Classic', color: '#6366f1', icon: '♪', file: 'classic.mp3' },
  { name: 'Wind', color: '#ef4444', icon: '♪', file: 'wind.mp3' },
  { name: 'Ocean', color: '#06b6d4', icon: '♪', file: 'ocean.mp3' },
  { name: 'Rain', color: '#8b5cf6', icon: '♪', file: 'rain.mp3' },
  { name: 'Birds', color: '#f97316', icon: '♪', file: 'birds.mp3' },
];

const WORKOUT_TYPES = [
  { name: 'jumping-jacks', display: 'Jumping Jacks', defaultCount: 20, unit: 'reps' },
  { name: 'push-ups', display: 'Push-ups', defaultCount: 15, unit: 'reps' },
  { name: 'sit-ups', display: 'Sit-ups', defaultCount: 25, unit: 'reps' },
  { name: 'squats', display: 'Squats', defaultCount: 20, unit: 'reps' },
  { name: 'burpees', display: 'Burpees', defaultCount: 10, unit: 'reps' },
  { name: 'steps', display: 'Walking Steps', defaultCount: 100, unit: 'steps' },
  { name: 'plank', display: 'Plank Hold', defaultCount: 30, unit: 'seconds' },
  { name: 'mountain-climbers', display: 'Mountain Climbers', defaultCount: 30, unit: 'reps' },
];

export default function AddAlarmScreen() {
  const [time, setTime] = useState({ hours: 9, minutes: 0 });
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedMelody, setSelectedMelody] = useState(MELODIES[0]);
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [workoutCount, setWorkoutCount] = useState(WORKOUT_TYPES[0].defaultCount);
  const [showCountModal, setShowCountModal] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleWorkoutTypeChange = (workout: typeof WORKOUT_TYPES[0]) => {
    setWorkoutType(workout);
    setWorkoutCount(workout.defaultCount);
  };

  const saveAlarm = () => {
    // Just simulate alarm save, no backend/storage
    const newAlarm = {
      id: Date.now().toString(),
      title: title || 'New Alarm',
      time: `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
      period,
      days: selectedDays,
      color: selectedColor,
      melody: selectedMelody,
      enabled: true,
      workoutType: workoutType.name,
      workoutCount,
      workoutUnit: workoutType.unit,
      createdAt: new Date().toISOString(),
    };

    console.log('Alarm created (not saved):', newAlarm);
    router.back(); // go back as before
  };

  const CountModal = () => (
    <Modal
      visible={showCountModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Set {workoutType.display} Count
          </Text>
          <Text style={styles.modalSubtitle}>
            How many {workoutType.unit}?
          </Text>
          <View style={styles.countSelector}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setWorkoutCount(Math.max(1, workoutCount - 5))}>
              <MaterialIcons name="remove" size={24} color="#6366f1" />
            </TouchableOpacity>
            <Text style={styles.countText}>{workoutCount}</Text>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setWorkoutCount(workoutCount + 5)}>
              <MaterialIcons name="add" size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCountModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => setShowCountModal(false)}>
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Alarm</Text>
        <TouchableOpacity onPress={saveAlarm}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.timePickerContainer}>
          <View style={styles.timePicker}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Hours</Text>
              <View style={styles.timeValues}>
                <Text style={styles.inactiveTime}>08</Text>
                <Text style={styles.activeTime}>{String(time.hours).padStart(2, '0')}</Text>
                <Text style={styles.inactiveTime}>10</Text>
              </View>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Minutes</Text>
              <View style={styles.timeValues}>
                <Text style={styles.inactiveTime}>59</Text>
                <Text style={styles.activeTime}>{String(time.minutes).padStart(2, '0')}</Text>
                <Text style={styles.inactiveTime}>01</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Days Selector */}
        <View style={styles.section}>
          <View style={styles.daysContainer}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.dayButtonActive
                ]}
                onPress={() => toggleDay(day)}>
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day) && styles.dayTextActive
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Color</Text>
          <View style={styles.colorsContainer}>
            {COLORS.map((color, index) => (
              <TouchableOpacity
                key={`${color}-${index}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonActive
                ]}
                onPress={() => setSelectedColor(color)}>
                {selectedColor === color && (
                  <Text style={styles.colorCheckMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Melody Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Melody</Text>
          <View style={styles.melodiesContainer}>
            {MELODIES.map(melody => (
              <TouchableOpacity
                key={melody.name}
                style={[
                  styles.melodyButton,
                  { backgroundColor: melody.color },
                  selectedMelody.name === melody.name && styles.melodyButtonActive
                ]}
                onPress={() => setSelectedMelody(melody)}>
                <Text style={styles.melodyIcon}>{melody.icon}</Text>
                <Text style={styles.melodyName}>{melody.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake-up Workout</Text>
          <View style={styles.workoutContainer}>
            {WORKOUT_TYPES.map(workout => (
              <TouchableOpacity
                key={workout.name}
                style={[
                  styles.workoutButton,
                  workoutType.name === workout.name && styles.workoutButtonActive
                ]}
                onPress={() => handleWorkoutTypeChange(workout)}>
                <Text style={[
                  styles.workoutText,
                  workoutType.name === workout.name && styles.workoutTextActive
                ]}>
                  {workout.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.countCustomizer}
            onPress={() => setShowCountModal(true)}>
            <Text style={styles.countCustomizerText}>
              {workoutCount} {workoutType.unit}
            </Text>
            <MaterialIcons name="edit" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <CountModal />
    </View>
  );
}

// Styles remain exactly the same

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cancelText: {
    fontSize: 16,
    color: '#6366f1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  timeValues: {
    alignItems: 'center',
  },
  inactiveTime: {
    fontSize: 20,
    color: '#cbd5e1',
    marginVertical: 5,
  },
  activeTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 5,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#6366f1',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  dayTextActive: {
    color: 'white',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorButtonActive: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  colorCheckMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  melodiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  melodyButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  melodyButtonActive: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  melodyIcon: {
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },
  melodyName: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  workoutContainer: {
    gap: 12,
  },
  workoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workoutButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#6366f1',
  },
  workoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  workoutTextActive: {
    color: '#6366f1',
  },
  countCustomizer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  countCustomizerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  countSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  countButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 30,
    minWidth: 80,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalSaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});