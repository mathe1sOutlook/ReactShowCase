import React, {useEffect, useRef} from 'react';
import {Animated, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {Colors} from '../../theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenContainer({children, scrollable = true}: ScreenContainerProps) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateY, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacity, entryTranslateY]);

  const content = (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: entryOpacity,
          transform: [{translateY: entryTranslateY}],
        },
      ]}>
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.ambientLayer}>
        <View style={styles.ambientPrimary} />
        <View style={styles.ambientSecondary} />
      </View>
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientPrimary: {
    position: 'absolute',
    top: -180,
    right: -60,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(96, 205, 255, 0.12)',
  },
  ambientSecondary: {
    position: 'absolute',
    bottom: -200,
    left: -110,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(135, 100, 184, 0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    flexGrow: 1,
  },
});
