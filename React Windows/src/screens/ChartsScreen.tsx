import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius} from '../theme';
import {useAnimatedValue} from '../hooks/useAnimatedValue';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart() {
  const barAnims = useRef(
    Array.from({length: 7}, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: i * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    Animated.stagger(60, animations).start();
  }, [barAnims]);

  const data = [
    {label: 'Mon', value: 65, color: Colors.primary},
    {label: 'Tue', value: 85, color: Colors.primary},
    {label: 'Wed', value: 45, color: Colors.primaryLight},
    {label: 'Thu', value: 95, color: Colors.primary},
    {label: 'Fri', value: 70, color: Colors.primary},
    {label: 'Sat', value: 35, color: Colors.primaryLight},
    {label: 'Sun', value: 55, color: Colors.primaryLight},
  ];

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Activity</Text>
      <View style={styles.barChartContainer}>
        {/* Y-axis labels */}
        <View style={styles.barChartYAxis}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={styles.barChartYLabel}>
              {v}
            </Text>
          ))}
        </View>
        {/* Bars */}
        <View style={styles.barChartBars}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => (
            <View
              key={v}
              style={[
                styles.barChartGridLine,
                {bottom: `${v}%`},
              ]}
            />
          ))}
          {data.map((item, i) => {
            const barHeight = barAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${item.value}%`],
            });
            return (
              <View key={item.label} style={styles.barChartBarCol}>
                <View style={styles.barChartBarWrapper}>
                  <Animated.View
                    style={[
                      styles.barChartBar,
                      {
                        height: barHeight,
                        backgroundColor: item.color,
                      },
                    ]}>
                    <Text style={styles.barChartBarValue}>{item.value}</Text>
                  </Animated.View>
                </View>
                <Text style={styles.barChartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Pie Chart Segment ───────────────────────────────────────────────────────

function PieChartSegment({
  percentage,
  color,
  label,
  animDelay,
}: {
  percentage: number;
  color: string;
  label: string;
  animDelay: number;
}) {
  const anim = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      delay: animDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, animDelay]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.pieSegment,
        {transform: [{scale}]},
      ]}>
      <View
        style={[
          styles.pieSegmentBar,
          {
            backgroundColor: color,
            width: `${percentage}%`,
          },
        ]}
      />
      <View style={styles.pieSegmentInfo}>
        <View style={[styles.pieLegendDot, {backgroundColor: color}]} />
        <Text style={styles.pieSegmentLabel}>{label}</Text>
        <Text style={styles.pieSegmentValue}>{percentage}%</Text>
      </View>
    </Animated.View>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart() {
  const rotateAnim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const segments = [
    {pct: 35, color: Colors.primary, label: 'React Native'},
    {pct: 25, color: Colors.accent, label: 'Native Modules'},
    {pct: 20, color: '#10b981', label: 'UI Components'},
    {pct: 12, color: '#f59e0b', label: 'Animations'},
    {pct: 8, color: '#ef4444', label: 'Other'},
  ];

  // Build donut as stacked arcs represented by colored borders
  let accumulated = 0;

  return (
    <View style={styles.donutContainer}>
      <Animated.View
        style={[
          styles.donutRing,
          {transform: [{rotate: rotation}]},
        ]}>
        {segments.map((seg, i) => {
          const startAngle = (accumulated / 100) * 360;
          accumulated += seg.pct;
          // Represent each segment as a colored arc segment
          return (
            <View
              key={i}
              style={[
                styles.donutSegment,
                {
                  borderColor: seg.color,
                  transform: [{rotate: `${startAngle}deg`}],
                  borderTopWidth: seg.pct > 20 ? 18 : 14,
                },
              ]}
            />
          );
        })}
      </Animated.View>
      <Animated.View
        style={[
          styles.donutCenter,
          {transform: [{scale: scaleAnim}]},
        ]}>
        <Text style={styles.donutCenterValue}>100%</Text>
        <Text style={styles.donutCenterLabel}>Total</Text>
      </Animated.View>
    </View>
  );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────

function LineChart() {
  const lineAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [lineAnim]);

  const dataPoints = [30, 55, 40, 75, 60, 90, 70, 85, 95, 80];
  const maxVal = 100;
  const chartHeight = 120;
  const chartWidth = SCREEN_WIDTH - 100;
  const stepX = chartWidth / (dataPoints.length - 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Performance Trend</Text>
      <View style={[styles.lineChartContainer, {height: chartHeight + 30}]}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <View
            key={v}
            style={[
              styles.lineChartGrid,
              {bottom: (v / maxVal) * chartHeight + 20},
            ]}
          />
        ))}
        {/* Data points and connectors */}
        {dataPoints.map((val, i) => {
          const x = i * stepX;
          const y = (val / maxVal) * chartHeight;
          const dotOpacity = lineAnim.interpolate({
            inputRange: [
              Math.max(0, (i - 1) / dataPoints.length),
              i / dataPoints.length,
              1,
            ],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });
          const dotScale = lineAnim.interpolate({
            inputRange: [
              Math.max(0, (i - 1) / dataPoints.length),
              i / dataPoints.length,
              1,
            ],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.lineChartDot,
                {
                  left: x + 30,
                  bottom: y + 16,
                  opacity: dotOpacity,
                  transform: [{scale: dotScale}],
                },
              ]}>
              <View style={styles.lineChartDotInner} />
              {/* Vertical line to base */}
              <View
                style={[
                  styles.lineChartStem,
                  {height: y},
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Data Visualization ──────────────────────────────────────────────────────

function DataVisualization() {
  const pieData = [
    {percentage: 35, color: Colors.primary, label: 'Desktop'},
    {percentage: 25, color: Colors.accent, label: 'Mobile'},
    {percentage: 20, color: '#10b981', label: 'Tablet'},
    {percentage: 12, color: '#f59e0b', label: 'Watch'},
    {percentage: 8, color: '#ef4444', label: 'Other'},
  ];

  return (
    <SectionWrapper
      title="Data Visualization"
      subtitle="Charts built entirely with Views and Animated APIs">
      <BarChart />
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Distribution Breakdown</Text>
        <View style={styles.pieChartContainer}>
          <DonutChart />
          <View style={styles.pieSegments}>
            {pieData.map((d, i) => (
              <PieChartSegment
                key={d.label}
                percentage={d.percentage}
                color={d.color}
                label={d.label}
                animDelay={i * 150}
              />
            ))}
          </View>
        </View>
      </View>
      <LineChart />
    </SectionWrapper>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChartsScreen() {
  return (
    <ScreenContainer>
      <DataVisualization />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  // Bar chart
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  barChartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  barChartYLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  barChartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 24,
    position: 'relative',
  },
  barChartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  barChartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  barChartBarWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  barChartBar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    minHeight: 20,
  },
  barChartBarValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  barChartLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },

  // Pie chart / donut
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  donutContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 16,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSegment: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  donutCenterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  donutCenterLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pieSegments: {
    flex: 1,
    gap: 8,
  },
  pieSegment: {
    marginBottom: 2,
  },
  pieSegmentBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  pieSegmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pieLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pieSegmentLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  pieSegmentValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Line chart
  lineChartContainer: {
    position: 'relative',
  },
  lineChartGrid: {
    position: 'absolute',
    left: 30,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  lineChartDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginBottom: -5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineChartDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 2,
  },
  lineChartStem: {
    position: 'absolute',
    top: 10,
    width: 1,
    backgroundColor: Colors.primary + '30',
    left: 4.5,
  },
});
