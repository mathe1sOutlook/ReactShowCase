import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../theme';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function Section({title, children}: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 2,
    backgroundColor: Colors.border,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 1,
  },
});
