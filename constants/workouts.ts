/**
 * Workout type configuration
 */
export type WorkoutType = {
  name: string;
  display: string;
  defaultCount: number;
  unit: 'reps' | 'steps' | 'seconds';
};

/**
 * Available workout types for wake-up exercises
 */
export const WORKOUT_TYPES: WorkoutType[] = [
  {
    name: 'jumping-jacks',
    display: 'Jumping Jacks',
    defaultCount: 20,
    unit: 'reps',
  },
  {
    name: 'push-ups',
    display: 'Push-ups',
    defaultCount: 15,
    unit: 'reps',
  },
  {
    name: 'sit-ups',
    display: 'Sit-ups',
    defaultCount: 25,
    unit: 'reps',
  },
  {
    name: 'squats',
    display: 'Squats',
    defaultCount: 20,
    unit: 'reps',
  },
  {
    name: 'burpees',
    display: 'Burpees',
    defaultCount: 10,
    unit: 'reps',
  },
  {
    name: 'steps',
    display: 'Walking Steps',
    defaultCount: 100,
    unit: 'steps',
  },
  {
    name: 'plank',
    display: 'Plank Hold',
    defaultCount: 30,
    unit: 'seconds',
  },
  {
    name: 'mountain-climbers',
    display: 'Mountain Climbers',
    defaultCount: 30,
    unit: 'reps',
  },
] as const;

/**
 * Days of the week abbreviations
 */
export const DAYS_OF_WEEK = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const;

/**
 * Default workout day selection (weekdays)
 */
export const DEFAULT_WORKOUT_DAYS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;
