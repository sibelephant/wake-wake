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
    name: 'steps',
    display: '',
    defaultCount: 100,
    unit: 'steps',
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
