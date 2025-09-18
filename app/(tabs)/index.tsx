import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; // 👈 add useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../../utils/notificationManager';

interface Alarm {
  id: string;
  title: string;
  time: string;
  period: 'AM' | 'PM';
  days: string[];
  color: string;
  melody: string;
  enabled: boolean;
  workoutType: 'jumping-jacks' | 'push-ups' | 'sit-ups';
  workoutCount: number;
}

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    setupNotifications();
  }, []);

  // 👇 reload alarms whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const setupNotifications = async () => {
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.requestPermissions();
    notificationManager.setupNotificationListeners();
  };

  const loadAlarms = async () => {
    try {
      const savedAlarms = await AsyncStorage.getItem('alarms');
      if (savedAlarms) {
        const parsedAlarms = JSON.parse(savedAlarms);
        setAlarms(parsedAlarms);

        const notificationManager = NotificationManager.getInstance();
        await notificationManager.scheduleAlarmNotifications(parsedAlarms);
      } else {
        const defaultAlarms: Alarm[] = [
          {
            id: '1',
            title: 'Wake up',
            time: '09:00',
            period: 'AM',
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            color: '#6366f1',
            melody: 'classic.mp3',
            enabled: true,
            workoutType: 'jumping-jacks',
            workoutCount: 20,
          },
        ];
        setAlarms(defaultAlarms);
        await AsyncStorage.setItem('alarms', JSON.stringify(defaultAlarms));
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  };

  const saveAlarms = async (updatedAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  };

  const toggleAlarm = async (id: string) => {
    const updatedAlarms = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );
    setAlarms(updatedAlarms);
    await saveAlarms(updatedAlarms);

    const notificationManager = NotificationManager.getInstance();
    await notificationManager.scheduleAlarmNotifications(updatedAlarms);
  };

  const AlarmCard = ({ alarm }: { alarm: Alarm }) => (
    <TouchableOpacity
      style={[styles.alarmCard, { backgroundColor: alarm.color }]}
      onPress={() => router.push(`/alarm-active/${alarm.id}`)}>
      <View style={styles.alarmHeader}>
        <View>
          <Text style={styles.alarmTitle}>{alarm.title}</Text>
          <Text style={styles.alarmTime}>
            {alarm.time} {alarm.period}
          </Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={() => toggleAlarm(alarm.id)}
          trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
          thumbColor="white"
        />
      </View>
      <View style={styles.daysContainer}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <Text
            key={day}
            style={[
              styles.dayText,
              { opacity: alarm.days.includes(day) ? 1 : 0.5 },
            ]}>
            {day}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-alarm')}>
          <MaterialIcons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {alarms.map(alarm => (
          <AlarmCard key={alarm.id} alarm={alarm} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  alarmTime: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});
