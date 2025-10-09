import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
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
  const [inputValue, setInputValue] = useState(count.toString());

  // Update input value when count prop changes or modal opens
  useEffect(() => {
    if (visible) {
      setInputValue(count.toString());
    }
  }, [count, visible]);

  const handleInputChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);

    // Update count if valid number
    const numValue = parseInt(numericText, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onCountChange(numValue);
    }
  };
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
            <TextInput
              style={styles.countInput}
              value={inputValue}
              onChangeText={handleInputChange}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={4}
            />
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => onCountChange(count + 5)}
            >
              <MaterialIcons name="add" size={24} color={UI_COLORS.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Tap the number to type a custom amount
          </Text>

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
  countInput: {
    fontSize: 32,
    fontWeight: '700',
    color: UI_COLORS.text.primary,
    marginHorizontal: 30,
    minWidth: 80,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: UI_COLORS.primary,
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 12,
    color: UI_COLORS.text.secondary,
    marginBottom: 20,
    marginTop: -10,
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
