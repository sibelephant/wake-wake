import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Alarm {
  id: string;
  title: string;
  time: string;
  period: 'AM' | 'PM';
  days: string[];
  enabled: boolean;
  workoutType: string;
  workoutCount: number;
  workoutUnit: string;
  melody: any;
}

export class NotificationManager {
  private static instance: NotificationManager;

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async scheduleAlarmNotifications(alarms: Alarm[]): Promise<void> {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    for (const alarm of alarms) {
      if (alarm.enabled) {
        await this.scheduleAlarmNotification(alarm);
      }
    }
  }

  private async scheduleAlarmNotification(alarm: Alarm): Promise<void> {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    let alarmHours = hours;

    // Convert to 24-hour format
    if (alarm.period === 'PM' && hours !== 12) {
      alarmHours += 12;
    } else if (alarm.period === 'AM' && hours === 12) {
      alarmHours = 0;
    }

    // Schedule for each selected day
    for (const day of alarm.days) {
      const dayIndex = this.getDayIndex(day);
      const now = new Date();
      const alarmDate = new Date();
      
      // Set the alarm time
      alarmDate.setHours(alarmHours, minutes, 0, 0);
      
      // Calculate days until the target day
      const currentDay = now.getDay();
      let daysUntilAlarm = (dayIndex - currentDay + 7) % 7;
      
      // If it's today but the time has passed, schedule for next week
      if (daysUntilAlarm === 0 && alarmDate <= now) {
        daysUntilAlarm = 7;
      }
      
      alarmDate.setDate(now.getDate() + daysUntilAlarm);

      await Notifications.scheduleNotificationAsync({
        identifier: `${alarm.id}-${day}`,
        content: {
          title: '⏰ Alarm Active!',
          body: `Time for your ${alarm.title} workout! Complete ${alarm.workoutCount} ${alarm.workoutUnit} to dismiss.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            alarmId: alarm.id,
            workoutType: alarm.workoutType,
            workoutCount: alarm.workoutCount,
          },
        },
        trigger: {
          date: alarmDate,
          repeats: true,
        },
      });
    }
  }

  private getDayIndex(day: string): number {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.indexOf(day);
  }

  async cancelAlarmNotifications(alarmId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(alarmId)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data?.alarmId;
      if (alarmId) {
        // Navigate to active alarm screen
        router.push(`/alarm-active/${alarmId}`);
      }
    });
  }
}

export default NotificationManager;