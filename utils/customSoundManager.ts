import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_SOUNDS_DIR = `${LegacyFileSystem.documentDirectory}custom_sounds/`;
const CUSTOM_SOUNDS_KEY = 'custom_sounds';

export type CustomSound = {
  id: string;
  name: string;
  uri: string;
  addedAt: number;
};

/**
 * Initialize custom sounds directory
 */
export const initCustomSoundsDirectory = async (): Promise<void> => {
  const dirInfo = await LegacyFileSystem.getInfoAsync(CUSTOM_SOUNDS_DIR);
  if (!dirInfo.exists) {
    await LegacyFileSystem.makeDirectoryAsync(CUSTOM_SOUNDS_DIR, {
      intermediates: true,
    });
  }
};

/**
 * Pick an audio file from the device
 */
export const pickCustomSound = async (): Promise<CustomSound | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // Validate file size (max 10MB)
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Validate required fields
    if (!asset.uri || !asset.name) {
      throw new Error('Invalid file selection');
    }

    // Generate unique ID
    const id = `custom_${Date.now()}`;

    // Get file extension
    const extension = asset.name.split('.').pop() || 'mp3';
    const fileName = `${id}.${extension}`;
    const destinationUri = `${CUSTOM_SOUNDS_DIR}${fileName}`;

    // Ensure directory exists
    await initCustomSoundsDirectory();

    // Copy file to app's document directory
    await LegacyFileSystem.copyAsync({
      from: asset.uri,
      to: destinationUri,
    });

    const customSound: CustomSound = {
      id,
      name: asset.name.replace(`.${extension}`, ''),
      uri: destinationUri,
      addedAt: Date.now(),
    };

    // Save to storage
    await saveCustomSound(customSound);

    return customSound;
  } catch (error) {
    console.error('Error picking custom sound:', error);
    throw error;
  }
};

/**
 * Get all custom sounds
 */
export const getCustomSounds = async (): Promise<CustomSound[]> => {
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting custom sounds:', error);
    return [];
  }
};

/**
 * Save a custom sound
 */
const saveCustomSound = async (sound: CustomSound): Promise<void> => {
  try {
    const sounds = await getCustomSounds();
    sounds.push(sound);
    await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(sounds));
  } catch (error) {
    console.error('Error saving custom sound:', error);
    throw error;
  }
};

/**
 * Delete a custom sound
 */
export const deleteCustomSound = async (soundId: string): Promise<void> => {
  try {
    const sounds = await getCustomSounds();
    const sound = sounds.find((s) => s.id === soundId);

    if (sound) {
      // Delete file
      const fileInfo = await LegacyFileSystem.getInfoAsync(sound.uri);
      if (fileInfo.exists) {
        await LegacyFileSystem.deleteAsync(sound.uri);
      }

      // Remove from storage
      const updatedSounds = sounds.filter((s) => s.id !== soundId);
      await AsyncStorage.setItem(
        CUSTOM_SOUNDS_KEY,
        JSON.stringify(updatedSounds)
      );
    }
  } catch (error) {
    console.error('Error deleting custom sound:', error);
    throw error;
  }
};

/**
 * Check if a URI is a custom sound
 */
export const isCustomSound = (uri: string): boolean => {
  return uri.startsWith(CUSTOM_SOUNDS_DIR) || uri.startsWith('custom_');
};

/**
 * Get custom sound URI by ID
 */
export const getCustomSoundUri = async (
  soundId: string
): Promise<string | null> => {
  try {
    const sounds = await getCustomSounds();
    const sound = sounds.find((s) => s.id === soundId);
    return sound?.uri || null;
  } catch (error) {
    console.error('Error getting custom sound URI:', error);
    return null;
  }
};
