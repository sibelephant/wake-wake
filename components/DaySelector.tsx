import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DAYS_OF_WEEK, UI_COLORS } from '@/constants';

interface DaySelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
}) => {
  return (
    <View style={styles.daysContainer}>
      {DAYS_OF_WEEK.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selectedDays.includes(day) && styles.dayButtonActive,
          ]}
          onPress={() => onToggleDay(day)}
        >
          <Text
            style={[
              styles.dayText,
              selectedDays.includes(day) && styles.dayTextActive,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 32,
    borderRadius: 16,
    backgroundColor: UI_COLORS.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: UI_COLORS.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: UI_COLORS.text.secondary,
  },
  dayTextActive: {
    color: 'white',
  },
});
