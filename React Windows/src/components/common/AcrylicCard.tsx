import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Colors, Radius} from '../../theme';

type AcrylicCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AcrylicCard({children, style}: AcrylicCardProps) {
  return (
    <View style={[styles.acrylicCard, style]}>
      <View style={styles.acrylicOverlay} />
      <View style={styles.acrylicContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  acrylicCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.acrylicBg,
    borderWidth: 1,
    borderColor: Colors.acrylicBorder,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  acrylicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.acrylicOverlay,
  },
  acrylicContent: {
    padding: 20,
    position: 'relative',
  },
});
