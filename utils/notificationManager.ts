import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior (only if not in Expo Go)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface Alarm {
  id: string;
  title: string;
  time: string;
  period: 'AM' | 'PM';
  days: string[];
  color: string;
  melody: string;
  enabled: boolean;
  workoutType: string;
  workoutCount: number;
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
    if (isExpoGo) {
      console.warn('Notifications not supported in Expo Go');
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async scheduleAlarmNotifications(alarms: Alarm[]): Promise<void> {
    if (isExpoGo) {
      console.log('Skipping notifications in Expo Go');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return;
      }

      for (const alarm of alarms) {
        if (alarm.enabled) {
          try {
            await this.scheduleAlarmNotification(alarm);
          } catch (scheduleError) {
            console.warn(
              `Failed to schedule notification for alarm ${alarm.id}:`,
              scheduleError
            );
            // Continue with other alarms
          }
        }
      }
      console.log(
        `✅ Scheduled notifications for ${
          alarms.filter((a) => a.enabled).length
        } alarms`
      );
    } catch (error) {
      console.error('❌ Error in scheduleAlarmNotifications:', error);
      throw error; // Re-throw so calling code can handle it
    }
  }

  private async scheduleAlarmNotification(alarm: Alarm): Promise<void> {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    let alarmHours = hours;

    if (alarm.period === 'PM' && hours !== 12) {
      alarmHours += 12;
    } else if (alarm.period === 'AM' && hours === 12) {
      alarmHours = 0;
    }

    for (const day of alarm.days) {
      const dayIndex = this.getDayIndex(day);

      await Notifications.scheduleNotificationAsync({
        identifier: `${alarm.id}-${day}`,
        content: {
          title: 'Alarm Active',
          body: `Time for your ${alarm.title} workout`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            alarmId: alarm.id,
            workoutType: alarm.workoutType,
            workoutCount: alarm.workoutCount,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: alarmHours,
          minute: minutes,
          weekday: dayIndex + 1,
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
    if (isExpoGo) {
      return;
    }

    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(alarmId)) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
  }

  setupNotificationListeners(): void {
    if (isExpoGo) {
      console.log('Skipping notification listeners in Expo Go');
      return;
    }

    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      const alarmId = response.notification.request.content.data?.alarmId;
      if (alarmId) {
        router.push(`/workout/${alarmId}`);
      }
    });
  }
}

export default NotificationManager;
