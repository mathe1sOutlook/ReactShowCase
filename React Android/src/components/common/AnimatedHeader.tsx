import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../../theme';

type AnimatedHeaderProps = {
  title: string;
  onBack: () => void;
};

const HEADER_HEIGHT = 56;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

export default function AnimatedHeader({title, onBack}: AnimatedHeaderProps) {
  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const titleSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleSlideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [titleSlideAnim]);

  const onBackPressIn = () => {
    Animated.spring(backScaleAnim, {
      toValue: 0.85,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const onBackPressOut = () => {
    Animated.spring(backScaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const titleTranslateX = titleSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <View style={styles.header}>
        <Animated.View style={{transform: [{scale: backScaleAnim}]}}>
          <Pressable
            onPress={onBack}
            onPressIn={onBackPressIn}
            onPressOut={onBackPressOut}
            style={styles.backButton}
            hitSlop={{top: 0, bottom: 0, left: 0, right: 0}}>
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>
        </Animated.View>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleSlideAnim,
              transform: [{translateX: titleTranslateX}],
            },
          ]}
          numberOfLines={1}>
          {title}
        </Animated.Text>
      </View>
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgLight,
  },
  statusBarSpacer: {
    height: STATUS_BAR_HEIGHT,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: Colors.primary,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 4,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
