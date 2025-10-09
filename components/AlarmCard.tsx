import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Alarm } from '@/types';
import { DAYS_OF_WEEK } from '@/constants';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, currentState: boolean) => void;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onPress,
  onLongPress,
}) => {
  return (
    <View style={[styles.alarmCard, { backgroundColor: alarm.color }]}>
      <TouchableOpacity
        style={styles.alarmCardContent}
        onPress={() => onPress?.(alarm.id)}
        onLongPress={() => onLongPress?.(alarm.id)}
      >
        <View style={styles.alarmHeader}>
          <View>
            <Text style={styles.alarmTitle}>{alarm.title}</Text>
            <Text style={styles.alarmTime}>
              {alarm.time} {alarm.period}
            </Text>
          </View>
          <Switch
            value={alarm.enabled}
            onValueChange={() => onToggle(alarm.id, alarm.enabled)}
            trackColor={{
              false: 'rgba(255,255,255,0.3)',
              true: 'rgba(255,255,255,0.5)',
            }}
            thumbColor="white"
          />
        </View>
        <View style={styles.daysContainer}>
          {DAYS_OF_WEEK.map((day) => (
            <Text
              key={day}
              style={[
                styles.dayText,
                { opacity: alarm.days.includes(day) ? 1 : 0.5 },
              ]}
            >
              {day}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  alarmCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  alarmCardContent: { flex: 1 },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alarmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  alarmTime: { fontSize: 24, fontWeight: '700', color: 'white' },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayText: { fontSize: 12, fontWeight: '500', color: 'white' },
});
