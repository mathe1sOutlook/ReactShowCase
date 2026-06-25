import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Colors} from '../../theme';

interface AnimatedHeaderProps {
  title: string;
  onBack: () => void;
  breadcrumb?: string[];
}

export default function AnimatedHeader({
  title,
  onBack,
  breadcrumb,
}: AnimatedHeaderProps) {
  const backScale = useRef(new Animated.Value(1)).current;
  const titleTranslateX = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [title, titleOpacity, titleTranslateX]);

  const handleBackPressIn = () => {
    Animated.spring(backScale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(backScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const breadcrumbItems = breadcrumb || ['Home', title];

  return (
    <View style={styles.container}>
      {/* Main header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          activeOpacity={0.7}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen">
          <Animated.Text
            style={[styles.backArrow, {transform: [{scale: backScale}]}]}>
            ←
          </Animated.Text>
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{translateX: titleTranslateX}],
              opacity: titleOpacity,
            },
          ]}
          accessibilityRole="header"
          numberOfLines={1}>
          {title}
        </Animated.Text>
      </View>

      {/* Breadcrumb trail */}
      <View style={styles.breadcrumbRow}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isHome = index === 0 && item === 'Home';

          return (
            <View key={index} style={styles.breadcrumbSegment}>
              {index > 0 && (
                <Text style={styles.breadcrumbSeparator}> {'>'} </Text>
              )}
              {isHome && !isLast ? (
                <TouchableOpacity
                  onPress={onBack}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel="Back to home"
                  accessibilityHint="Navigates to the previous screen in the breadcrumb">
                  <Text style={[styles.breadcrumbText, styles.breadcrumbLink]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={[
                    styles.breadcrumbText,
                    isLast && styles.breadcrumbCurrent,
                  ]}>
                  {item}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 0,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginRight: 8,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginLeft: 44,
  },
  breadcrumbSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  breadcrumbLink: {
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  breadcrumbSeparator: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  breadcrumbCurrent: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
