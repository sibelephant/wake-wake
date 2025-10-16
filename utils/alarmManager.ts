import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

export class AlarmManager {
  private static instance: AlarmManager;
  private alarms: Alarm[] = [];
  private timers: Map<string, any> = new Map();

  public static getInstance(): AlarmManager {
    if (!AlarmManager.instance) {
      AlarmManager.instance = new AlarmManager();
    }
    return AlarmManager.instance;
  }

  async loadAlarms(): Promise<Alarm[]> {
    try {
      const savedAlarms = await AsyncStorage.getItem('alarms');
      if (savedAlarms) {
        this.alarms = JSON.parse(savedAlarms);
        this.scheduleAlarms();
        return this.alarms;
      }
      return [];
    } catch (error) {
      console.error('Error loading alarms:', error);
      return [];
    }
  }

  async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      this.alarms = alarms;
      await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
      this.scheduleAlarms();
      console.log(`✅ Saved ${alarms.length} alarms to AsyncStorage`);
    } catch (error) {
      console.error('❌ Error saving alarms to AsyncStorage:', error);
      throw error; // Re-throw the error so the calling code knows it failed
    }
  }

  private scheduleAlarms(): void {
    // Clear existing timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Schedule enabled alarms
    this.alarms.forEach((alarm) => {
      if (alarm.enabled) {
        this.scheduleAlarm(alarm);
      }
    });
  }

  private scheduleAlarm(alarm: Alarm): void {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });

    if (!alarm.days.includes(currentDay)) {
      return; // Alarm not scheduled for today
    }

    const [hours, minutes] = alarm.time.split(':').map(Number);
    const alarmTime = new Date(now);

    let alarmHours = hours;
    if (alarm.period === 'PM' && hours !== 12) {
      alarmHours += 12;
    } else if (alarm.period === 'AM' && hours === 12) {
      alarmHours = 0;
    }

    alarmTime.setHours(alarmHours, minutes, 0, 0);

    // If alarm time has passed today, schedule for tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const timeUntilAlarm = alarmTime.getTime() - now.getTime();

    const timer = setTimeout(() => {
      this.triggerAlarm(alarm);
    }, timeUntilAlarm);

    this.timers.set(alarm.id, timer);
  }

  private triggerAlarm(alarm: Alarm): void {
    // Navigate to alarm-active screen
    console.log(
      '🔔 Triggering alarm:',
      alarm.id,
      alarm.title,
      'Sound:',
      alarm.melody
    );
    router.push(`/alarm-active/${alarm.id}` as any);
  }

  async updateAlarm(id: string, updates: Partial<Alarm>): Promise<void> {
    const alarmIndex = this.alarms.findIndex((alarm) => alarm.id === id);
    if (alarmIndex !== -1) {
      this.alarms[alarmIndex] = { ...this.alarms[alarmIndex], ...updates };
      await this.saveAlarms(this.alarms);
    }
  }

  async deleteAlarm(id: string): Promise<void> {
    this.alarms = this.alarms.filter((alarm) => alarm.id !== id);
    await this.saveAlarms(this.alarms);
  }
}

export default AlarmManager;
