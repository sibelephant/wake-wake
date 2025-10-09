import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TimeState } from '@/types';
import { UI_COLORS } from '@/constants';

interface TimePickerModalProps {
  visible: boolean;
  time: TimeState;
  period: 'AM' | 'PM';
  onTimeChange: (time: TimeState) => void;
  onPeriodChange: (period: 'AM' | 'PM') => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  time,
  period,
  onTimeChange,
  onPeriodChange,
  onClose,
}) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timeModalContent}>
          <Text style={styles.modalTitle}>Set Time</Text>

          <View style={styles.timePickerRow}>
            {/* Hours Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={`hour-${hour}`}
                    style={[
                      styles.pickerItem,
                      time.hours === hour && styles.pickerItemActive,
                    ]}
                    onPress={() => onTimeChange({ ...time, hours: hour })}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        time.hours === hour && styles.pickerItemTextActive,
                      ]}
                    >
                      {String(hour).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={`minute-${minute}`}
                    style={[
                      styles.pickerItem,
                      time.minutes === minute && styles.pickerItemActive,
                    ]}
                    onPress={() => onTimeChange({ ...time, minutes: minute })}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        time.minutes === minute && styles.pickerItemTextActive,
                      ]}
                    >
                      {String(minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Period Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Period</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {(['AM', 'PM'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.pickerItem,
                      period === p && styles.pickerItemActive,
                    ]}
                    onPress={() => onPeriodChange(p)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        period === p && styles.pickerItemTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
  timeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    minWidth: 320,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
    marginBottom: 8,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 10,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.text.secondary,
    marginBottom: 10,
  },
  pickerScroll: {
    maxHeight: 200,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: UI_COLORS.background,
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: UI_COLORS.primary,
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: UI_COLORS.text.secondary,
  },
  pickerItemTextActive: {
    color: 'white',
    fontWeight: '600',
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
