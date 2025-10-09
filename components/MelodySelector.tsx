import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MELODIES, MelodyType, UI_COLORS } from '@/constants';
import {
  pickCustomSound,
  getCustomSounds,
  deleteCustomSound,
  CustomSound,
} from '@/utils/customSoundManager';

interface MelodySelectorProps {
  selectedMelody: MelodyType | CustomSound;
  onSelectMelody: (melody: MelodyType | CustomSound) => void;
  onPreviewMelody?: (melody: MelodyType | CustomSound) => void;
}

export const MelodySelector: React.FC<MelodySelectorProps> = ({
  selectedMelody,
  onSelectMelody,
  onPreviewMelody,
}) => {
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);

  useEffect(() => {
    loadCustomSounds();
  }, []);

  const loadCustomSounds = async () => {
    try {
      const sounds = await getCustomSounds();
      setCustomSounds(sounds);
    } catch (error) {
      console.error('Error loading custom sounds:', error);
    }
  };

  const handleAddCustomSound = async () => {
    try {
      const sound = await pickCustomSound();
      if (sound) {
        await loadCustomSounds();
        Alert.alert(
          'Success',
          `Custom sound "${sound.name}" added successfully!`
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add custom sound');
    }
  };

  const handleDeleteCustomSound = (sound: CustomSound) => {
    Alert.alert(
      'Delete Custom Sound',
      `Are you sure you want to delete "${sound.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomSound(sound.id);
              await loadCustomSounds();
              Alert.alert('Success', 'Custom sound deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete custom sound');
            }
          },
        },
      ]
    );
  };

  const isSelected = (item: MelodyType | CustomSound) => {
    if ('file' in selectedMelody && 'file' in item) {
      return selectedMelody.file === item.file;
    }
    if ('id' in selectedMelody && 'id' in item) {
      return selectedMelody.id === item.id;
    }
    return false;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Alarm Sound</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.melodiesHorizontalContainer}
      >
        {/* Built-in Melodies */}
        {MELODIES.map((melody) => (
          <TouchableOpacity
            key={melody.name}
            style={styles.melodySquareContainer}
            onPress={() => onSelectMelody(melody)}
            onLongPress={() => onPreviewMelody?.(melody)}
            delayLongPress={200}
          >
            <View
              style={[
                styles.melodySquare,
                { backgroundColor: melody.color },
                isSelected(melody) && styles.melodySquareSelected,
              ]}
            >
              <MaterialIcons name={melody.icon} size={24} color="white" />
            </View>
            <Text style={styles.melodySquareLabel}>{melody.name}</Text>
          </TouchableOpacity>
        ))}

        {/* Custom Sounds */}
        {customSounds.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={styles.melodySquareContainer}
            onPress={() => onSelectMelody(sound)}
            onLongPress={() => handleDeleteCustomSound(sound)}
            delayLongPress={500}
          >
            <View
              style={[
                styles.melodySquare,
                { backgroundColor: '#10b981' },
                isSelected(sound) && styles.melodySquareSelected,
              ]}
            >
              <MaterialIcons name="audiotrack" size={24} color="white" />
              <Text style={styles.customBadge}>🎵</Text>
            </View>
            <Text style={styles.melodySquareLabel} numberOfLines={1}>
              {sound.name.substring(0, 8)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add Custom Sound Button */}
        <TouchableOpacity
          style={styles.melodySquareContainer}
          onPress={handleAddCustomSound}
        >
          <View
            style={[
              styles.melodySquare,
              {
                backgroundColor: UI_COLORS.border.medium,
                borderWidth: 2,
                borderColor: UI_COLORS.primary,
                borderStyle: 'dashed',
              },
            ]}
          >
            <MaterialIcons name="add" size={32} color={UI_COLORS.primary} />
          </View>
          <Text style={styles.melodySquareLabel}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
      <Text style={styles.helpText}>
        Long press built-in sounds to preview • Long press custom sounds to
        delete
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
    marginBottom: 16,
  },
  melodiesHorizontalContainer: {
    paddingHorizontal: 5,
    gap: 12,
  },
  melodySquareContainer: {
    alignItems: 'center',
    width: 70,
  },
  melodySquare: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  melodySquareSelected: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  melodySquareLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: UI_COLORS.text.secondary,
    textAlign: 'center',
  },
  customBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
  },
  helpText: {
    fontSize: 11,
    color: UI_COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
