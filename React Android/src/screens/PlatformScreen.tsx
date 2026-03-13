import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Hardware Card ──────────────────────────────────────────────────────────

function HardwareCard({
  name,
  emoji,
  status,
  color,
  index,
}: {
  name: string;
  emoji: string;
  status: string;
  color: string;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.hwCard,
        {borderColor: color + '44'},
        {
          opacity: fadeAnim,
          transform: [
            {scale: pulseAnim},
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}>
      <Text style={styles.hwEmoji}>{emoji}</Text>
      <Text style={[styles.hwName, {color}]}>{name}</Text>
      <View style={[styles.hwStatusDot, {backgroundColor: color}]} />
      <Text style={styles.hwStatus}>{status}</Text>
    </Animated.View>
  );
}

// ─── Hardware Section ───────────────────────────────────────────────────────

function HardwareSection() {
  const capabilities = [
    {name: 'Camera', emoji: '\u{1F4F7}', status: 'Available', color: Colors.primary},
    {name: 'Bluetooth', emoji: '\u{1F4E1}', status: 'Ready', color: Colors.secondary},
    {name: 'GPS', emoji: '\u{1F4CD}', status: 'Active', color: Colors.success},
    {name: 'Accel.', emoji: '\u{1F3AF}', status: 'Streaming', color: Colors.accent},
    {name: 'NFC', emoji: '\u{1F4F2}', status: 'Enabled', color: Colors.warning},
    {name: 'Gyro', emoji: '\u{1F504}', status: 'Ready', color: Colors.orange},
    {name: 'Mic', emoji: '\u{1F3A4}', status: 'Available', color: Colors.pink},
    {name: 'Haptics', emoji: '\u{1F4F3}', status: 'Active', color: Colors.error},
  ];

  return (
    <Section title="Hardware Capabilities">
      <View style={styles.hwGrid}>
        {capabilities.map((cap, i) => (
          <HardwareCard key={i} index={i} {...cap} />
        ))}
      </View>
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function PlatformScreen() {
  return (
    <ScreenContainer>
      <HardwareSection />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hwGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  hwCard: {
    width: (SCREEN_WIDTH - 54) / 4,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  hwEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  hwName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hwStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  hwStatus: {
    fontSize: 9,
    color: '#8888aa',
  },
});
