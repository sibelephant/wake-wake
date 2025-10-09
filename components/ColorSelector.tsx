import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ALARM_COLORS, UI_COLORS } from '@/constants';

interface ColorSelectorProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Color</Text>
      <View style={styles.colorsContainer}>
        {ALARM_COLORS.map((color, index) => (
          <TouchableOpacity
            key={`${color}-${index}`}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.colorButtonActive,
            ]}
            onPress={() => onSelectColor(color)}
          >
            {selectedColor === color && (
              <Text style={styles.colorCheckMark}>✓</Text>
            )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
    marginBottom: 12,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorButtonActive: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  colorCheckMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
