import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { MelodyType, SOUND_MAP } from '@/constants';

/**
 * Custom hook for handling alarm sound playback
 */
export const useAlarmSound = () => {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const previewSoundRef = useRef<Audio.Sound | null>(null);

  const playPreviewSound = async (melody: MelodyType) => {
    try {
      // Stop any currently playing preview
      if (previewSoundRef.current) {
        await previewSoundRef.current.stopAsync();
        await previewSoundRef.current.unloadAsync();
        previewSoundRef.current = null;
      }

      // If clicking the same melody, just stop (toggle off)
      if (playingPreview === melody.name) {
        setPlayingPreview(null);
        return;
      }

      // Play the preview sound
      setPlayingPreview(melody.name);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const soundSource = SOUND_MAP[melody.file];
      if (!soundSource) {
        console.error(`Sound file not found: ${melody.file}`);
        setPlayingPreview(null);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        isLooping: false,
        volume: 0.5,
      });

      previewSoundRef.current = sound;
      await sound.playAsync();

      // Auto-stop after 3 seconds
      setTimeout(async () => {
        if (previewSoundRef.current) {
          await previewSoundRef.current.stopAsync();
          await previewSoundRef.current.unloadAsync();
          previewSoundRef.current = null;
          setPlayingPreview(null);
        }
      }, 3000);
    } catch (error) {
      console.error('Error playing preview:', error);
      setPlayingPreview(null);
    }
  };

  const stopSound = async () => {
    if (previewSoundRef.current) {
      await previewSoundRef.current.stopAsync();
      await previewSoundRef.current.unloadAsync();
      previewSoundRef.current = null;
      setPlayingPreview(null);
    }
  };

  return {
    playingPreview,
    playPreviewSound,
    stopSound,
  };
};
