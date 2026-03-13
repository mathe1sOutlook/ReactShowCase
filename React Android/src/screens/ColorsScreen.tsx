import React, {useRef, useMemo, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

// ─── Color Picker ───────────────────────────────────────────────────────────

function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState(Colors.primary);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const palette = useMemo(() => {
    const colors: string[] = [];
    // Generate a grid of hues
    for (let h = 0; h < 360; h += 15) {
      for (let s = 100; s >= 40; s -= 30) {
        for (let l = 60; l >= 30; l -= 15) {
          colors.push(`hsl(${h}, ${s}%, ${l}%)`);
        }
      }
    }
    return colors;
  }, []);

  const selectColor = (color: string) => {
    setSelectedColor(color);
    Animated.sequence([
      Animated.spring(scaleAnim, {toValue: 1.2, tension: 300, friction: 5, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, tension: 300, friction: 5, useNativeDriver: true}),
    ]).start();
  };

  return (
    <Section title="Color Picker">
      <Text style={styles.hintText}>Tap to pick a color</Text>

      {/* Selected color preview */}
      <Animated.View
        style={[
          styles.colorPreview,
          {
            backgroundColor: selectedColor,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.colorPreviewText}>{selectedColor}</Text>
      </Animated.View>

      {/* Color grid */}
      <View style={styles.colorGrid}>
        {palette.slice(0, 120).map((color, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => selectColor(color)}
            style={[
              styles.colorSwatch,
              {backgroundColor: color},
              selectedColor === color && styles.colorSwatchActive,
            ]}
          />
        ))}
      </View>
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ColorsScreen() {
  return (
    <ScreenContainer>
      <ColorPicker />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hintText: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  colorPreview: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  colorPreviewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: Colors.white,
    transform: [{scale: 1.3}],
    zIndex: 1,
  },
});
