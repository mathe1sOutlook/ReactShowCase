import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius} from '../theme';
import {useAnimatedValue} from '../hooks/useAnimatedValue';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {AcrylicCard} from '../components/common/AcrylicCard';

// ─── Weather Widget ──────────────────────────────────────────────────────────

function WeatherWidget() {
  const tempAnim = useAnimatedValue(0);
  useEffect(() => {
    const tempLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tempAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tempAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    tempLoop.start();

    return () => {
      tempLoop.stop();
    };
  }, [tempAnim]);

  const sunRotate = tempAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Animated.Text
          style={[
            styles.widgetIcon,
            {transform: [{rotate: sunRotate}]},
          ]}>
          {'*'}
        </Animated.Text>
        <Text style={styles.widgetLabel}>Weather</Text>
      </View>
      <Text style={styles.widgetTemp}>22 C</Text>
      <Text style={styles.widgetDesc}>Partly Cloudy</Text>
      <View style={styles.widgetRow}>
        <View style={styles.widgetMiniStat}>
          <Text style={styles.widgetMiniLabel}>Humidity</Text>
          <Text style={styles.widgetMiniValue}>65%</Text>
        </View>
        <View style={styles.widgetMiniStat}>
          <Text style={styles.widgetMiniLabel}>Wind</Text>
          <Text style={styles.widgetMiniValue}>12 km/h</Text>
        </View>
      </View>
    </AcrylicCard>
  );
}

// ─── Stocks Widget ───────────────────────────────────────────────────────────

function StocksWidget() {
  const barAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: i * 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    Animated.stagger(100, animations).start();
  }, [barAnims]);

  const stockData = [
    {name: 'MSFT', value: 72, change: '+2.4%', up: true},
    {name: 'AAPL', value: 55, change: '+1.1%', up: true},
    {name: 'GOOG', value: 88, change: '-0.3%', up: false},
    {name: 'AMZN', value: 65, change: '+3.2%', up: true},
  ];

  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetIconText}>$</Text>
        <Text style={styles.widgetLabel}>Markets</Text>
      </View>
      {stockData.map((stock, i) => {
        const barWidth = barAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, stock.value * 1.5],
        });
        return (
          <View key={stock.name} style={styles.stockRow}>
            <Text style={styles.stockName}>{stock.name}</Text>
            <View style={styles.stockBarBg}>
              <Animated.View
                style={[
                  styles.stockBar,
                  {
                    width: barWidth,
                    backgroundColor: stock.up ? '#10b981' : '#ef4444',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.stockChange,
                {color: stock.up ? '#10b981' : '#ef4444'},
              ]}>
              {stock.change}
            </Text>
          </View>
        );
      })}
    </AcrylicCard>
  );
}

// ─── Calendar Widget ─────────────────────────────────────────────────────────

function CalendarWidget() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = 13;
  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetIconText}>#</Text>
        <Text style={styles.widgetLabel}>March 2026</Text>
      </View>
      <View style={styles.calendarGrid}>
        {days.map((d, i) => (
          <Text key={`h-${i}`} style={styles.calendarDayHeader}>
            {d}
          </Text>
        ))}
        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
          <View
            key={day}
            style={[
              styles.calendarDay,
              day === today && styles.calendarDayToday,
            ]}>
            <Text
              style={[
                styles.calendarDayText,
                day === today && styles.calendarDayTextToday,
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    </AcrylicCard>
  );
}

// ─── Desktop Widgets ─────────────────────────────────────────────────────────

function DesktopWidgets() {
  return (
    <SectionWrapper
      title="Desktop Widgets"
      subtitle="Windows 11 acrylic-style cards with frosted glass effect">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.widgetScroll}>
        <WeatherWidget />
        <StocksWidget />
        <CalendarWidget />
      </ScrollView>
    </SectionWrapper>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WidgetsScreen() {
  return (
    <ScreenContainer>
      <DesktopWidgets />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  widgetScroll: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  widgetCard: {
    width: 220,
    marginRight: 12,
    minHeight: 200,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetIcon: {
    fontSize: 22,
    marginRight: 8,
    color: '#f59e0b',
  },
  widgetIconText: {
    fontSize: 18,
    marginRight: 8,
    color: Colors.primary,
    fontWeight: '700',
  },
  widgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  widgetTemp: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  widgetDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  widgetMiniStat: {},
  widgetMiniLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  widgetMiniValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Stocks widget
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockName: {
    width: 44,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stockBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  stockBar: {
    height: '100%',
    borderRadius: 3,
  },
  stockChange: {
    fontSize: 11,
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },

  // Calendar widget
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  calendarDayToday: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  calendarDayText: {
    fontSize: 10,
    color: Colors.textPrimary,
  },
  calendarDayTextToday: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
