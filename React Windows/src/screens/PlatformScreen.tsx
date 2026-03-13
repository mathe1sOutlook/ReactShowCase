import React, {useEffect} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius} from '../theme';
import {useAnimatedValue} from '../hooks/useAnimatedValue';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';

// ─── Capability Card ─────────────────────────────────────────────────────────

function CapabilityCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const slideAnim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim, delay]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start()
      }>
      <Animated.View
        style={[
          styles.capCard,
          {
            opacity: slideAnim,
            transform: [{translateY}, {scale: scaleAnim}],
          },
        ]}>
        <View style={[styles.capIconBg, {backgroundColor: color + '18'}]}>
          <Text style={[styles.capIcon, {color}]}>{icon}</Text>
        </View>
        <Text style={styles.capTitle}>{title}</Text>
        <Text style={styles.capDesc}>{description}</Text>
        <View style={[styles.capAccent, {backgroundColor: color}]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── System Capabilities ─────────────────────────────────────────────────────

function SystemCapabilities() {
  const capabilities = [
    {
      icon: '[F]',
      title: 'File System',
      description: 'Full Win32 FS access, read/write files and directories',
      color: Colors.primary,
    },
    {
      icon: '[R]',
      title: 'Registry',
      description: 'Read and write Windows Registry keys and values',
      color: Colors.accent,
    },
    {
      icon: '[N]',
      title: 'Notifications',
      description: 'Native Windows toast notifications and action center',
      color: '#f59e0b',
    },
    {
      icon: '[C]',
      title: 'Clipboard',
      description: 'System clipboard with rich content support',
      color: '#10b981',
    },
    {
      icon: '[S]',
      title: 'System Info',
      description: 'CPU, memory, display info and OS version details',
      color: '#ef4444',
    },
    {
      icon: '[W]',
      title: 'Window Mgmt',
      description: 'Control window size, position, and state',
      color: '#6366f1',
    },
  ];

  return (
    <SectionWrapper
      title="System Capabilities"
      subtitle="Windows-specific features available through native modules">
      <View style={styles.capGrid}>
        {capabilities.map((cap, i) => (
          <CapabilityCard key={cap.title} {...cap} delay={i * 100} />
        ))}
      </View>
    </SectionWrapper>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PlatformScreen() {
  return (
    <ScreenContainer>
      <SystemCapabilities />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  capGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  capCard: {
    width: '31%',
    minWidth: 140,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  capIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  capIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  capTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  capDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  capAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
});
