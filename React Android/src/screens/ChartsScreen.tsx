import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Bar Chart ──────────────────────────────────────────────────────────────

function BarChart() {
  const barData = [
    {label: 'Jan', value: 65, color: Colors.primary},
    {label: 'Feb', value: 85, color: Colors.secondary},
    {label: 'Mar', value: 45, color: Colors.accent},
    {label: 'Apr', value: 95, color: Colors.success},
    {label: 'May', value: 70, color: Colors.warning},
    {label: 'Jun', value: 55, color: Colors.orange},
    {label: 'Jul', value: 80, color: Colors.pink},
  ];

  const barAnims = useRef(barData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      80,
      barAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, []);

  const maxVal = Math.max(...barData.map(d => d.value));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>Bar Chart - Monthly Data</Text>
      <View style={styles.barChartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={styles.yAxisText}>
              {v}
            </Text>
          ))}
        </View>
        {/* Bars */}
        <View style={styles.barsContainer}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <View
              key={`grid-${i}`}
              style={[styles.chartGridLine, {bottom: `${i * 25}%`}]}
            />
          ))}
          {barData.map((d, i) => (
            <View key={i} style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    backgroundColor: d.color,
                    height: barAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${(d.value / maxVal) * 100}%`],
                    }),
                  },
                ]}>
                <Text style={styles.barValue}>{d.value}</Text>
              </Animated.View>
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Line Chart ─────────────────────────────────────────────────────────────

function LineChart() {
  const lineData = [30, 60, 45, 80, 55, 90, 70, 85, 50, 75];
  const dotAnims = useRef(lineData.map(() => new Animated.Value(0))).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.stagger(
      100,
      dotAnims.map(a =>
        Animated.spring(a, {toValue: 1, tension: 80, friction: 6, useNativeDriver: true}),
      ),
    ).start();
  }, []);

  const chartWidth = SCREEN_WIDTH - 100;
  const chartHeight = 150;
  const maxVal = 100;
  const stepX = chartWidth / (lineData.length - 1);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>Line Chart - Performance Metrics</Text>
      <View style={[styles.lineChartArea, {height: chartHeight + 30}]}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={`lgrid-${i}`}
            style={[
              styles.chartGridLine,
              {
                bottom: (i * chartHeight) / 4,
                position: 'absolute',
                left: 30,
                right: 0,
              },
            ]}
          />
        ))}

        {/* Line segments */}
        {lineData.map((val, i) => {
          if (i === 0) return null;
          const prevVal = lineData[i - 1];
          const x1 = 30 + (i - 1) * stepX;
          const y1 = chartHeight - (prevVal / maxVal) * chartHeight;
          const x2 = 30 + i * stepX;
          const y2 = chartHeight - (val / maxVal) * chartHeight;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <Animated.View
              key={`line-${i}`}
              style={{
                position: 'absolute',
                left: x1,
                top: y1,
                width: dist,
                height: 2,
                backgroundColor: Colors.primary,
                borderRadius: 1,
                transform: [{rotate: `${angle}deg`}],
                transformOrigin: '0% 50%',
                opacity: lineAnim,
              }}
            />
          );
        })}

        {/* Dots */}
        {lineData.map((val, i) => {
          const x = 30 + i * stepX;
          const y = chartHeight - (val / maxVal) * chartHeight;
          return (
            <Animated.View
              key={`dot-${i}`}
              style={{
                position: 'absolute',
                left: x - 5,
                top: y - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: Colors.primary,
                borderWidth: 2,
                borderColor: Colors.bgCard,
                opacity: dotAnims[i],
                transform: [
                  {
                    scale: dotAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            />
          );
        })}

        {/* Area fill behind line */}
        {lineData.map((val, i) => {
          if (i === 0) return null;
          const prevVal = lineData[i - 1];
          const x1 = 30 + (i - 1) * stepX;
          const y1 = chartHeight - (prevVal / maxVal) * chartHeight;
          const x2 = 30 + i * stepX;
          const y2 = chartHeight - (val / maxVal) * chartHeight;

          return (
            <Animated.View
              key={`area-${i}`}
              style={{
                position: 'absolute',
                left: x1,
                top: Math.min(y1, y2),
                width: stepX,
                height: chartHeight - Math.min(y1, y2),
                backgroundColor: Colors.primary + '08',
                opacity: lineAnim,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Charts Section ─────────────────────────────────────────────────────────

function ChartsSection() {
  return (
    <Section title="Data Visualization">
      <BarChart />
      <View style={{height: 24}} />
      <LineChart />
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ChartsScreen() {
  return (
    <ScreenContainer>
      <ChartsSection />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  barChartArea: {
    flexDirection: 'row',
    height: 180,
  },
  yAxisLabels: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  yAxisText: {
    fontSize: 9,
    color: '#8888aa',
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 20,
    position: 'relative',
  },
  chartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border + '44',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  barLabel: {
    fontSize: 9,
    color: '#8888aa',
    marginTop: 4,
  },
  lineChartArea: {
    position: 'relative',
    marginLeft: 0,
  },
});
