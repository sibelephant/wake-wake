/**
 * Core alarm interface
 */
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

/**
 * Workout session state
 */
export interface WorkoutSession {
  type:
    | 'jumping-jacks'
    | 'push-ups'
    | 'sit-ups'
    | 'squats'
    | 'burpees'
    | 'steps'
    | 'plank'
    | 'mountain-climbers';
  target: number;
  current: number;
  isActive: boolean;
}

/**
 * Time picker state
 */
export interface TimeState {
  hours: number;
  minutes: number;
}

/**
 * Accelerometer data from device sensors
 */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

/**
 * Workout history entry
 */
export interface WorkoutHistoryEntry {
  alarmId: string;
  completedAt: string;
  workoutType: string;
  target: number;
  completed: number;
  duration: number;
}

/**
 * Workout statistics
 */
export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  averageCompletion: number;
  streak: number;
}
