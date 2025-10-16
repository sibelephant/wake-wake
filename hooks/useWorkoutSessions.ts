import { useState, useEffect } from 'react';
import {
  getWorkoutSessions,
  getWorkoutStats,
  WorkoutSession,
  WorkoutStats,
} from '@/utils/workoutSessionManager';

export const useWorkoutSessions = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalExercises: 0,
    averageCompletion: 0,
    streak: 0,
    lastWorkoutDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, statsData] = await Promise.all([
        getWorkoutSessions(),
        getWorkoutStats(),
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    sessions,
    stats,
    isLoading,
    refresh: loadData,
  };
};
