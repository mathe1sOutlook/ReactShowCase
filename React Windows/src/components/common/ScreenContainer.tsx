import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {Colors} from '../../theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenContainer({children, scrollable = true}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
