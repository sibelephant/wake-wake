/**
 * Utility helper functions for the app
 */

/**
 * Formats workout type from kebab-case to Title Case
 * @param type - Workout type in kebab-case (e.g., 'jumping-jacks')
 * @returns Formatted string (e.g., 'Jumping Jacks')
 */
export const formatWorkoutType = (type: string): string => {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets workout instructions based on workout type
 * @param type - Workout type
 * @returns Instruction string
 */
export const getWorkoutInstructions = (type: string): string => {
  const instructions: Record<string, string> = {
    steps: 'Walk around or march in place',
  };

  return instructions[type] || 'Complete the exercise movements';
};

/**
 * Gets motivational message based on progress
 * @param current - Current count
 * @param target - Target count
 * @returns Motivational message
 */
export const getMotivationalMessage = (
  current: number,
  target: number
): string => {
  const percentage = (current / target) * 100;

  if (percentage === 0) {
    return "Let's get started! You can do this!";
  } else if (percentage < 25) {
    return 'Great start! Keep the momentum going!';
  } else if (percentage < 50) {
    return "You're doing great! Halfway there!";
  } else if (percentage < 75) {
    return 'Amazing progress! Keep pushing!';
  } else if (percentage < 100) {
    return 'Almost there! Finish strong!';
  } else {
    return 'Incredible work! You did it!';
  }
};

/**
 * Converts 12-hour time to 24-hour format
 * @param hours - Hours (1-12)
 * @param period - AM or PM
 * @returns Hours in 24-hour format (0-23)
 */
export const convertTo24Hour = (hours: number, period: 'AM' | 'PM'): number => {
  let alarmHours = hours;

  if (period === 'PM' && hours !== 12) {
    alarmHours += 12;
  } else if (period === 'AM' && hours === 12) {
    alarmHours = 0;
  }

  return alarmHours;
};

/**
 * Formats time for display
 * @param hours - Hours
 * @param minutes - Minutes
 * @returns Formatted time string (e.g., '09:30')
 */
export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}`;
};

/**
 * Formats date for workout history
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., 'Sep 30, 7:00 AM')
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month} ${day}, ${displayHours}:${String(minutes).padStart(
    2,
    '0'
  )} ${period}`;
};

/**
 * Formats duration in seconds to readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., '5m 30s')
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs}s`;
  }

  return `${mins}m ${secs}s`;
};

/**
 * Calculates completion percentage
 * @param completed - Number completed
 * @param target - Target number
 * @returns Percentage (0-100)
 */
export const calculatePercentage = (
  completed: number,
  target: number
): number => {
  if (target === 0) return 0;
  return Math.min(100, Math.round((completed / target) * 100));
};
