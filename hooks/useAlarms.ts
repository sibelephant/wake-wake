import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AlarmManager from '@/utils/alarmManager';
import NotificationManager from '@/utils/notificationManager';
import { Alarm } from '@/types';

/**
 * Custom hook for alarm management operations
 */
export const useAlarms = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlarms = useCallback(async () => {
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
  }, []);

  const toggleAlarm = useCallback(
    async (alarmId: string, currentState: boolean) => {
      try {
        const alarmManager = AlarmManager.getInstance();
        const notificationManager = NotificationManager.getInstance();

        await alarmManager.updateAlarm(alarmId, { enabled: !currentState });
        const updatedAlarms = await alarmManager.loadAlarms();
        setAlarms(updatedAlarms);

        await notificationManager.scheduleAlarmNotifications(updatedAlarms);

        Alert.alert(
          'Success',
          `Alarm ${!currentState ? 'enabled' : 'disabled'} successfully`
        );
      } catch (error) {
        console.error('Error toggling alarm:', error);
        Alert.alert('Error', 'Failed to update alarm');
      }
    },
    []
  );

  const deleteAlarm = useCallback(
    async (alarmId: string) => {
      Alert.alert(
        'Delete Alarm',
        'Are you sure you want to delete this alarm?',
        [
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
                await loadAlarms();

                Alert.alert('Success', 'Alarm deleted successfully');
              } catch (error) {
                console.error('Error deleting alarm:', error);
                Alert.alert('Error', 'Failed to delete alarm');
              }
            },
          },
        ]
      );
    },
    [loadAlarms]
  );

  const saveAlarm = useCallback(async (alarm: Omit<Alarm, 'id'>) => {
    try {
      const alarmManager = AlarmManager.getInstance();
      const notificationManager = NotificationManager.getInstance();

      const newAlarm: Alarm = {
        ...alarm,
        id: Date.now().toString(),
      };

      const existingAlarms = await alarmManager.loadAlarms();
      await alarmManager.saveAlarms([...existingAlarms, newAlarm]);

      try {
        await notificationManager.scheduleAlarmNotifications([
          ...existingAlarms,
          newAlarm,
        ]);
        console.log('✅ Alarm saved and notifications scheduled');
      } catch (notificationError) {
        console.warn(
          '⚠️ Alarm saved but notification scheduling failed:',
          notificationError
        );
      }

      return true;
    } catch (error) {
      console.error('❌ Error saving alarm:', error);
      return false;
    }
  }, []);

  const updateAlarm = useCallback(
    async (alarmId: string, updates: Partial<Alarm>) => {
      try {
        const alarmManager = AlarmManager.getInstance();
        const notificationManager = NotificationManager.getInstance();

        await alarmManager.updateAlarm(alarmId, updates);
        const updatedAlarms = await alarmManager.loadAlarms();
        setAlarms(updatedAlarms);

        try {
          await notificationManager.scheduleAlarmNotifications(updatedAlarms);
          console.log('✅ Alarm updated and notifications rescheduled');
        } catch (notificationError) {
          console.warn(
            '⚠️ Alarm updated but notification scheduling failed:',
            notificationError
          );
        }

        return true;
      } catch (error) {
        console.error('❌ Error updating alarm:', error);
        return false;
      }
    },
    []
  );

  return {
    alarms,
    loading,
    loadAlarms,
    toggleAlarm,
    deleteAlarm,
    saveAlarm,
    updateAlarm,
  };
};
