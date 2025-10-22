import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_SESSIONS_KEY = 'workout_sessions';

export interface WorkoutSession {
  id: string;
  alarmId: string;
  alarmTitle: string;
  workoutType: string;
  target: number;
  completed: number;
  completedAt: string;
  duration: number; // in seconds
  wasCompleted: boolean;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  averageCompletion: number;
  streak: number;
  lastWorkoutDate: string | null;
}

/**
 * Save a completed workout session
 */
export const saveWorkoutSession = async (
  session: Omit<WorkoutSession, 'id' | 'completedAt'>
): Promise<boolean> => {
  try {
    const sessions = await getWorkoutSessions();

    const newSession: WorkoutSession = {
      ...session,
      id: Date.now().toString(),
      completedAt: new Date().toISOString(),
    };

    sessions.push(newSession);
    await AsyncStorage.setItem(WORKOUT_SESSIONS_KEY, JSON.stringify(sessions));

    console.log('✅ Workout session saved:', {
      id: newSession.id,
      alarmTitle: newSession.alarmTitle,
      workoutType: newSession.workoutType,
      completed: newSession.completed,
      target: newSession.target,
    });

    return true;
  } catch (error) {
    console.error('❌ Error saving workout session:', error);
    return false;
  }
};

/**
 * Get all workout sessions
 */
export const getWorkoutSessions = async (): Promise<WorkoutSession[]> => {
  try {
    const stored = await AsyncStorage.getItem(WORKOUT_SESSIONS_KEY);
    if (!stored) return [];

    const sessions: WorkoutSession[] = JSON.parse(stored);

    // Sort by date, newest first
    return sessions.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  } catch (error) {
    console.error('❌ Error getting workout sessions:', error);
    return [];
  }
};

/**
 * Get workout sessions for a specific alarm
 */
export const getAlarmWorkoutSessions = async (
  alarmId: string
): Promise<WorkoutSession[]> => {
  try {
    const sessions = await getWorkoutSessions();
    return sessions.filter((s) => s.alarmId === alarmId);
  } catch (error) {
    console.error('❌ Error getting alarm workout sessions:', error);
    return [];
  }
};

/**
 * Calculate workout statistics
 * Average completion resets at the beginning of every month
 */
export const getWorkoutStats = async (): Promise<WorkoutStats> => {
  try {
    const sessions = await getWorkoutSessions();

    if (sessions.length === 0) {
      return {
        totalWorkouts: 0,
        totalExercises: 0,
        averageCompletion: 0,
        streak: 0,
        lastWorkoutDate: null,
      };
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter sessions to only include current month
    const currentMonthSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt);
      return (
        sessionDate.getMonth() === currentMonth &&
        sessionDate.getFullYear() === currentYear
      );
    });

    // Use all sessions for total workouts and total exercises
    const totalWorkouts = sessions.length;
    const totalExercises = sessions.reduce((sum, s) => sum + s.completed, 0);

    // Calculate average completion ONLY from current month's sessions
    const averageCompletion =
      currentMonthSessions.length > 0
        ? Math.round(
            currentMonthSessions.reduce(
              (sum, s) => sum + (s.completed / s.target) * 100,
              0
            ) / currentMonthSessions.length
          )
        : 0;

    // Calculate streak (consecutive days with at least one workout)
    const streak = calculateStreak(sessions);
    const lastWorkoutDate = sessions[0]?.completedAt || null;

    return {
      totalWorkouts,
      totalExercises,
      averageCompletion,
      streak,
      lastWorkoutDate,
    };
  } catch (error) {
    console.error('❌ Error calculating workout stats:', error);
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      averageCompletion: 0,
      streak: 0,
      lastWorkoutDate: null,
    };
  }
};

/**
 * Calculate workout streak (consecutive days)
 */
const calculateStreak = (sessions: WorkoutSession[]): number => {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique workout dates
  const workoutDates = sessions.map((s) => {
    const date = new Date(s.completedAt);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const uniqueDates = Array.from(new Set(workoutDates)).sort((a, b) => b - a);

  // Check if there's a workout today or yesterday
  const lastWorkoutDate = new Date(uniqueDates[0]);
  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If last workout was more than 1 day ago, streak is broken
  if (daysSinceLastWorkout > 1) return 0;

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i - 1]);
    const dayDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Delete a workout session
 */
export const deleteWorkoutSession = async (
  sessionId: string
): Promise<boolean> => {
  try {
    const sessions = await getWorkoutSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(WORKOUT_SESSIONS_KEY, JSON.stringify(filtered));

    console.log('✅ Workout session deleted:', sessionId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting workout session:', error);
    return false;
  }
};

/**
 * Clear all workout sessions
 */
export const clearWorkoutSessions = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(WORKOUT_SESSIONS_KEY);
    console.log('✅ All workout sessions cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing workout sessions:', error);
    return false;
  }
};
