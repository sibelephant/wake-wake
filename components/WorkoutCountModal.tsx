import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WorkoutType } from '@/constants';
import { UI_COLORS } from '@/constants';

interface WorkoutCountModalProps {
  visible: boolean;
  workoutType: WorkoutType;
  count: number;
  onCountChange: (count: number) => void;
  onClose: () => void;
}

export const WorkoutCountModal: React.FC<WorkoutCountModalProps> = ({
  visible,
  workoutType,
  count,
  onCountChange,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set {workoutType.display} Count</Text>
          <Text style={styles.modalSubtitle}>How many {workoutType.unit}?</Text>
          <View style={styles.countSelector}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => onCountChange(Math.max(1, count - 5))}
            >
              <MaterialIcons
                name="remove"
                size={24}
                color={UI_COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.countText}>{count}</Text>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => onCountChange(count + 5)}
            >
              <MaterialIcons name="add" size={24} color={UI_COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveButton} onPress={onClose}>
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    color: UI_COLORS.text.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: UI_COLORS.text.secondary,
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
    backgroundColor: UI_COLORS.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 32,
    fontWeight: '700',
    color: UI_COLORS.text.primary,
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
    backgroundColor: UI_COLORS.border.light,
  },
  modalCancelText: {
    fontSize: 16,
    color: UI_COLORS.text.secondary,
  },
  modalSaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: UI_COLORS.primary,
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
