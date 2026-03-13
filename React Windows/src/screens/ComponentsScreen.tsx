import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Radius} from '../theme';
import {ScreenContainer} from '../components/common/ScreenContainer';

const UPCOMING = [
  {icon: '\u{1F518}', label: 'Buttons & Controls'},
  {icon: '\u{270D}\uFE0F', label: 'Forms & Inputs'},
  {icon: '\u{1F4CB}', label: 'DataGrid'},
  {icon: '\u{1F514}', label: 'Toasts & Modals'},
  {icon: '\u{1F4C5}', label: 'Calendar & Pickers'},
  {icon: '\u{1F4F7}', label: 'Camera & Media'},
  {icon: '\u{1F4C4}', label: 'PDF Viewer'},
  {icon: '\u{1F310}', label: 'WebView'},
  {icon: '\u{1F50D}', label: 'QR & Barcode Scanner'},
  {icon: '\u{1F5A8}\uFE0F', label: 'Print Support'},
];

export default function ComponentsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScreenContainer>
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <Text style={styles.title}>UI Components</Text>
        <Text style={styles.subtitle}>
          Coming soon {'\u2014'} these demos will be added in upcoming phases
        </Text>

        <View style={styles.list}>
          {UPCOMING.map(item => (
            <View key={item.label} style={styles.listItem}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SOON</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 1,
  },
});
