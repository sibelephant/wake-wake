import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MELODIES, MelodyType, UI_COLORS } from '@/constants';

interface MelodySelectorProps {
  selectedMelody: MelodyType;
  onSelectMelody: (melody: MelodyType) => void;
  onPreviewMelody?: (melody: MelodyType) => void;
}

export const MelodySelector: React.FC<MelodySelectorProps> = ({
  selectedMelody,
  onSelectMelody,
  onPreviewMelody,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.melodiesHorizontalContainer}>
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
                selectedMelody.name === melody.name &&
                  styles.melodySquareSelected,
              ]}
            >
              <MaterialIcons name={melody.icon} size={24} color="white" />
            </View>
            <Text style={styles.melodySquareLabel}>{melody.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  melodiesHorizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  melodySquareContainer: {
    alignItems: 'center',
    flex: 1,
  },
  melodySquare: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  melodySquareSelected: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  melodySquareLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: UI_COLORS.text.secondary,
    textAlign: 'center',
  },
});
