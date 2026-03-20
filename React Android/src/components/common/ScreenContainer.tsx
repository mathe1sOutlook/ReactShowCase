import React, {useEffect, useRef} from 'react';
import {Animated, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {Colors} from '../../theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenContainer({children, scrollable = true}: ScreenContainerProps) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateY, {
        toValue: 0,
        duration: 260,
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
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View pointerEvents="none" style={styles.ambientLayer}>
        <View style={styles.ambientPrimary} />
        <View style={styles.ambientSecondary} />
      </View>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientPrimary: {
    position: 'absolute',
    top: -140,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${Colors.primary}12`,
  },
  ambientSecondary: {
    position: 'absolute',
    bottom: -170,
    left: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${Colors.secondary}10`,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  content: {
    flexGrow: 1,
  },
});
