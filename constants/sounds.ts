import { MaterialIcons } from '@expo/vector-icons';

/**
 * Sound file mapping for dynamic requires
 * Maps sound filenames to their asset paths
 */
export const SOUND_MAP: Record<string, any> = {
  // Active alarm sounds (MP3 format)
  'samsung.mp3': require('@/assets/sounds/samsung.mp3'),
  'motivational_alarm.mp3': require('@/assets/sounds/motivational_alarm.mp3'),
  'morning_flower.mp3': require('@/assets/sounds/morning_flower.mp3'),
  'iphone_alarm.mp3': require('@/assets/sounds/iphone_alarm.mp3'),
  'annoying_alarm_clock.mp3': require('@/assets/sounds/annoying_alarm_clock.mp3'),
} as const;

/**
 * Melody configuration type
 */
export type MelodyType = {
  name: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  file: string;
};

/**
 * Available alarm melodies/sounds
 */
export const MELODIES: MelodyType[] = [
  {
    name: 'Classic',
    color: '#6366f1',
    icon: 'music-note',
    file: 'samsung.mp3',
  },
  {
    name: 'Motivation',
    color: '#ef4444',
    icon: 'music-note',
    file: 'motivational_alarm.mp3',
  },
  {
    name: 'Morning',
    color: '#06b6d4',
    icon: 'music-note',
    file: 'morning_flower.mp3',
  },
  {
    name: 'iphone',
    color: '#8b5cf6',
    icon: 'music-note',
    file: 'iphone_alarm.mp3',
  },
  {
    name: 'Loud',
    color: '#ff6b35',
    icon: 'music-note',
    file: 'annoying_alarm_clock.mp3',
  },
] as const;
