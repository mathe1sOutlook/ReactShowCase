import React, {useEffect, useRef, useState} from 'react';
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

// ─── Window Controls Demo ────────────────────────────────────────────────────

function WindowControlsDemo() {
  const [isMaximized, setIsMaximized] = useState(false);
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const handleButtonPress = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    if (index === 1) {
      setIsMaximized(!isMaximized);
    }
  };

  return (
    <SectionWrapper
      title="Window Controls"
      subtitle="Windows 11 style title bar with interactive controls">
      <View style={styles.windowFrame}>
        {/* Title bar */}
        <View style={styles.windowTitleBar}>
          <View style={styles.windowTitleLeft}>
            <View style={styles.windowAppIcon}>
              <Text style={styles.windowAppIconText}>{'{ }'}</Text>
            </View>
            <Text style={styles.windowTitleText}>CFD Windows - Showcase</Text>
          </View>
          <View style={styles.windowControls}>
            {/* Minimize */}
            <Pressable
              onPress={() => handleButtonPress(0)}
              style={styles.windowCtrlBtn}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[0]}]}}>
                <View style={styles.windowMinimizeIcon} />
              </Animated.View>
            </Pressable>
            {/* Maximize/Restore */}
            <Pressable
              onPress={() => handleButtonPress(1)}
              style={styles.windowCtrlBtn}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[1]}]}}>
                {isMaximized ? (
                  <View style={styles.windowRestoreIcon}>
                    <View style={styles.windowRestoreBack} />
                    <View style={styles.windowRestoreFront} />
                  </View>
                ) : (
                  <View style={styles.windowMaximizeIcon} />
                )}
              </Animated.View>
            </Pressable>
            {/* Close */}
            <Pressable
              onPress={() => handleButtonPress(2)}
              style={[styles.windowCtrlBtn, styles.windowCloseBtn]}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[2]}]}}>
                <Text style={styles.windowCloseX}>x</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
        {/* Window content */}
        <View style={styles.windowContent}>
          <View style={styles.windowSidebar}>
            {['Home', 'Settings', 'About', 'Help'].map((item, i) => (
              <View
                key={item}
                style={[
                  styles.windowNavItem,
                  i === 0 && styles.windowNavItemActive,
                ]}>
                <Text
                  style={[
                    styles.windowNavText,
                    i === 0 && styles.windowNavTextActive,
                  ]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.windowMainArea}>
            <Text style={styles.windowMainTitle}>Welcome</Text>
            <Text style={styles.windowMainText}>
              This simulates a Windows 11 application window with native-style
              title bar, navigation sidebar, and content area. All built with
              React Native Views.
            </Text>
            <View style={styles.windowStatusBar}>
              <View style={styles.windowStatusDot} />
              <Text style={styles.windowStatusText}>Connected</Text>
              <Text style={styles.windowStatusRight}>v0.75.20</Text>
            </View>
          </View>
        </View>
      </View>
    </SectionWrapper>
  );
}

// ─── Grid Tile ───────────────────────────────────────────────────────────────

function GridTile({
  color,
  label,
  index,
}: {
  color: string;
  label: string;
  index: number;
}) {
  const anim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 60,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          friction: 5,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }).start()
      }>
      <Animated.View
        style={[
          styles.gridTile,
          {
            backgroundColor: color,
            opacity: anim,
            transform: [{translateY}, {scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.gridTileLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Grid Layout ─────────────────────────────────────────────────────────────

function GridLayout() {
  const tiles = [
    {color: Colors.primary, label: 'A1'},
    {color: '#6366f1', label: 'B2'},
    {color: Colors.accent, label: 'C3'},
    {color: '#10b981', label: 'D4'},
    {color: '#f59e0b', label: 'E5'},
    {color: '#ef4444', label: 'F6'},
    {color: '#ec4899', label: 'G7'},
    {color: '#14b8a6', label: 'H8'},
    {color: '#8b5cf6', label: 'I9'},
    {color: '#06b6d4', label: 'J10'},
    {color: '#84cc16', label: 'K11'},
    {color: '#f97316', label: 'L12'},
    {color: Colors.primaryDark, label: 'M13'},
    {color: '#a855f7', label: 'N14'},
    {color: '#22d3ee', label: 'O15'},
    {color: '#fb923c', label: 'P16'},
    {color: '#4ade80', label: 'Q17'},
    {color: '#f43f5e', label: 'R18'},
  ];

  return (
    <SectionWrapper
      title="Grid Layout"
      subtitle="Responsive tile grid with staggered entrance animations">
      <View style={styles.gridContainer}>
        {tiles.map((tile, i) => (
          <GridTile key={tile.label} {...tile} index={i} />
        ))}
      </View>
    </SectionWrapper>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WindowControlsScreen() {
  return (
    <ScreenContainer>
      <WindowControlsDemo />
      <GridLayout />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Window Controls
  windowFrame: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  windowTitleBar: {
    height: 32,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  windowTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 8,
  },
  windowAppIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowAppIconText: {
    fontSize: 6,
    color: '#ffffff',
    fontWeight: '700',
  },
  windowTitleText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  windowControls: {
    flexDirection: 'row',
    height: '100%',
  },
  windowCtrlBtn: {
    width: 46,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowMinimizeIcon: {
    width: 10,
    height: 1,
    backgroundColor: Colors.textPrimary,
  },
  windowMaximizeIcon: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: 1,
  },
  windowRestoreIcon: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  windowRestoreBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: 1,
  },
  windowRestoreFront: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    backgroundColor: '#f0f0f0',
    borderRadius: 1,
  },
  windowCloseBtn: {
    backgroundColor: 'transparent',
  },
  windowCloseX: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '300',
    lineHeight: 16,
  },
  windowContent: {
    flexDirection: 'row',
    minHeight: 180,
  },
  windowSidebar: {
    width: 140,
    backgroundColor: '#fafafa',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  windowNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  windowNavItemActive: {
    backgroundColor: Colors.primary + '12',
  },
  windowNavText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  windowNavTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  windowMainArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  windowMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  windowMainText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  windowStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  windowStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  windowStatusText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  windowStatusRight: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },

  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridTile: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  gridTileLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
