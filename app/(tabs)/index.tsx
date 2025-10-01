import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AlarmManager from '@/utils/alarmManager';
import NotificationManager from '@/utils/notificationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alarms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const loadAlarms = async () => {
    try {
      setLoading(true);
      const alarmManager = AlarmManager.getInstance();
      const loadedAlarms = await alarmManager.loadAlarms();
      setAlarms(loadedAlarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
      Alert.alert('Error', 'Failed to load alarms');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlarm = async (alarmId: string, currentState: boolean) => {
    try {
      const alarmManager = AlarmManager.getInstance();
      const notificationManager = NotificationManager.getInstance();

      // Update alarm enabled state
      await alarmManager.updateAlarm(alarmId, { enabled: !currentState });

      // Reload all alarms to get fresh state
      const updatedAlarms = await alarmManager.loadAlarms();
      setAlarms(updatedAlarms);

      // Re-schedule all notifications
      await notificationManager.scheduleAlarmNotifications(updatedAlarms);

      Alert.alert(
        'Success',
        `Alarm ${!currentState ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      console.error('Error toggling alarm:', error);
      Alert.alert('Error', 'Failed to update alarm');
    }
  };

  const deleteAlarm = async (alarmId: string) => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const alarmManager = AlarmManager.getInstance();
            const notificationManager = NotificationManager.getInstance();

            await alarmManager.deleteAlarm(alarmId);
            await notificationManager.cancelAlarmNotifications(alarmId);

            // Reload alarms
            await loadAlarms();

            Alert.alert('Success', 'Alarm deleted successfully');
          } catch (error) {
            console.error('Error deleting alarm:', error);
            Alert.alert('Error', 'Failed to delete alarm');
          }
        },
      },
    ]);
  };

  // 🧪 Debug function for testing
  const debugStorage = async () => {
    const data = await AsyncStorage.getItem('alarms');
    console.log('=== PHASE 1 DEBUG ===');
    console.log('Raw AsyncStorage:', data);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Parsed alarms:', parsed);
      console.log('Total count:', parsed.length);
      parsed.forEach((alarm: any, idx: number) => {
        console.log(`Alarm ${idx + 1}:`, {
          title: alarm.title,
          time: alarm.time,
          enabled: alarm.enabled,
          days: alarm.days,
        });
      });
    } else {
      console.log('No alarms in storage');
    }
    console.log('==================');
    Alert.alert('Debug', 'Check console for AsyncStorage data');
  };

  const AlarmCard = ({ alarm }: { alarm: any }) => (
    <View style={[styles.alarmCard, { backgroundColor: alarm.color }]}>
      <TouchableOpacity
        style={styles.alarmCardContent}
        onPress={() => router.push(`/alarm-active/${alarm.id}`)}
        onLongPress={() => deleteAlarm(alarm.id)}
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
            onValueChange={() => toggleAlarm(alarm.id, alarm.enabled)}
            trackColor={{
              false: 'rgba(255,255,255,0.3)',
              true: 'rgba(255,255,255,0.5)',
            }}
            thumbColor="white"
          />
        </View>
        <View style={styles.daysContainer}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-alarm')}
        >
          <MaterialIcons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading alarms...</Text>
          </View>
        ) : alarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="alarm-off" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No alarms yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first alarm
            </Text>
          </View>
        ) : (
          alarms.map((alarm) => <AlarmCard key={alarm.id} alarm={alarm} />)
        )}

        {/* 🧪 Debug Button for Testing */}
        {__DEV__ && (
          <TouchableOpacity style={styles.debugButton} onPress={debugStorage}>
            <MaterialIcons name="bug-report" size={20} color="#ffffff" />
            <Text style={styles.debugButtonText}>Debug Storage</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '600', color: '#1e293b' },
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
  scrollView: { flex: 1, paddingHorizontal: 20 },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748b' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  emptySubtext: { marginTop: 8, fontSize: 16, color: '#94a3b8' },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    gap: 8,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
