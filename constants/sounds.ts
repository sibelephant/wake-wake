import { MaterialIcons } from '@expo/vector-icons';

/**
 * Sound file mapping for dynamic requires
 * Maps sound filenames to their asset paths
 */
export const SOUND_MAP: Record<string, any> = {
  'alarm.wav': require('@/assets/sounds/alarm.wav'),
  'gentle.wav': require('@/assets/sounds/gentle.wav'),
  'energetic.wav': require('@/assets/sounds/energetic.wav'),
  'nature.wav': require('@/assets/sounds/nature.wav'),
  'digital.wav': require('@/assets/sounds/digital.wav'),
  // Fallback for old MP3 format
  'alarm.mp3': require('@/assets/sounds/alarm.mp3'),
} as const;

/**
 * Melody configuration type
 */
export type MelodyType = {
  name: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  file: string;
  description: string;
};

/**
 * Available alarm melodies/sounds
 */
export const MELODIES: MelodyType[] = [
  {
    name: 'Classic',
    color: '#6366f1',
    icon: 'music-note',
    file: 'alarm.wav',
    description: 'Classic alarm sound',
  },
  {
    name: 'Wind',
    color: '#ef4444',
    icon: 'music-note',
    file: 'gentle.wav',
    description: 'Soft wake-up tone',
  },
  {
    name: 'Ocean',
    color: '#06b6d4',
    icon: 'music-note',
    file: 'energetic.wav',
    description: 'High energy alarm',
  },
  {
    name: 'Rain',
    color: '#8b5cf6',
    icon: 'music-note',
    file: 'nature.wav',
    description: 'Natural sounds',
  },
  {
    name: 'Birds',
    color: '#ff6b35',
    icon: 'music-note',
    file: 'digital.wav',
    description: 'Digital beeps',
  },
] as const;
