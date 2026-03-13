import React from 'react';
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {Colors} from '../../theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenContainer({children, scrollable = true}: ScreenContainerProps) {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
});
