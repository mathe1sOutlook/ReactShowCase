import React, {useEffect, useMemo, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  SvgProps,
  Text as SvgText,
} from 'react-native-svg';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../theme';
import {buildLinePath, buildLinePoints, polarToCartesian} from '../utils/chartMath';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DRAW_PATH =
  'M 24 126 C 42 86 66 64 92 70 C 118 76 124 116 149 116 C 174 116 178 70 206 66 C 234 62 251 96 279 118 C 306 139 338 136 366 92';

const MORPH_SHAPES = {
  orb: [
    [50, 8],
    [82, 18],
    [94, 50],
    [82, 82],
    [50, 92],
    [18, 82],
    [6, 50],
    [18, 18],
  ],
  diamond: [
    [50, 4],
    [70, 20],
    [96, 50],
    [70, 80],
    [50, 96],
    [30, 80],
    [4, 50],
    [30, 20],
  ],
  star: [
    [50, 2],
    [64, 30],
    [96, 34],
    [72, 56],
    [80, 92],
    [50, 74],
    [20, 92],
    [28, 56],
  ],
} as const;

type Insight = {
  color: string;
  detail: string;
  title: string;
};

type IconProps = SvgProps & {
  color: string;
  size?: number;
};

function pointsToPath(points: ReadonlyArray<readonly [number, number]>) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ') + ' Z';
}

function blendShapes(
  from: ReadonlyArray<readonly [number, number]>,
  to: ReadonlyArray<readonly [number, number]>,
  progress: number,
) {
  return from.map(([x, y], index) => [
    x + (to[index][0] - x) * progress,
    y + (to[index][1] - y) * progress,
  ]) as Array<[number, number]>;
}

function OrbitIcon({color, size = 74, ...props}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 74 74" {...props}>
      <Ellipse
        cx={37}
        cy={37}
        rx={24}
        ry={10}
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      <Ellipse
        cx={37}
        cy={37}
        rx={24}
        ry={10}
        transform="rotate(60 37 37)"
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      <Ellipse
        cx={37}
        cy={37}
        rx={24}
        ry={10}
        transform="rotate(120 37 37)"
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      <Circle cx={37} cy={37} r={6} fill={color} />
    </Svg>
  );
}

function PulseIcon({color, size = 74, ...props}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 74 74" {...props}>
      <Rect
        x={9}
        y={9}
        width={56}
        height={56}
        rx={18}
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      <Path
        d="M 12 39 H 24 L 30 26 L 39 52 L 46 35 L 62 35"
        stroke={color}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NodeIcon({color, size = 74, ...props}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 74 74" {...props}>
      <Polygon
        points="37,8 61,22 61,52 37,66 13,52 13,22"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx={37} cy={8} r={5} fill={color} />
      <Circle cx={61} cy={22} r={5} fill={color} />
      <Circle cx={61} cy={52} r={5} fill={color} />
      <Circle cx={37} cy={66} r={5} fill={color} />
      <Circle cx={13} cy={52} r={5} fill={color} />
      <Circle cx={13} cy={22} r={5} fill={color} />
    </Svg>
  );
}

function VectorChartIcon({color, size = 74, ...props}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 74 74" {...props}>
      <Rect x={10} y={10} width={54} height={54} rx={14} fill="none" stroke={color} strokeWidth={3} />
      <Path
        d="M 16 48 L 27 34 L 38 40 L 50 24 L 58 30"
        stroke={color}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={16} cy={48} r={3} fill={color} />
      <Circle cx={27} cy={34} r={3} fill={color} />
      <Circle cx={38} cy={40} r={3} fill={color} />
      <Circle cx={50} cy={24} r={3} fill={color} />
      <Circle cx={58} cy={30} r={3} fill={color} />
    </Svg>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

function Surface({
  children,
  height,
}: {
  children: (width: number) => React.ReactNode;
  height: number;
}) {
  const [width, setWidth] = useState(0);

  return (
    <View
      style={[styles.surface, {height}]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? children(width) : null}
    </View>
  );
}

function BasicsCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  return (
    <Card
      title="Basic SVG Primitives"
      subtitle="Rects, circles, lines, polygons, gradients and vector text rendered directly in SVG.">
      <Surface height={210}>
        {width => (
          <Svg width={width} height={210}>
            <Defs>
              <LinearGradient id="basicGlow" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} />
                <Stop offset="100%" stopColor={Colors.secondary} />
              </LinearGradient>
            </Defs>
            <Rect
              x={18}
              y={18}
              width={width - 36}
              height={174}
              rx={24}
              fill={Colors.bgCardAlt}
              stroke={Colors.border}
              strokeOpacity={0.6}
            />
            <Rect
              x={32}
              y={32}
              width={68}
              height={68}
              rx={16}
              fill="url(#basicGlow)"
              onPress={() =>
                onSelect({
                  color: Colors.primary,
                  title: 'Rounded rectangle',
                  detail: 'Basic SVG rendering with gradient fill and rounded corners.',
                })
              }
            />
            <Circle
              cx={154}
              cy={68}
              r={32}
              fill={Colors.success}
              fillOpacity={0.85}
              onPress={() =>
                onSelect({
                  color: Colors.success,
                  title: 'Circle primitive',
                  detail: 'Vector circle with touch target and layered opacity.',
                })
              }
            />
            <Polygon
              points={`${width - 104},96 ${width - 68},34 ${width - 32},96`}
              fill={Colors.warning}
              onPress={() =>
                onSelect({
                  color: Colors.warning,
                  title: 'Polygon primitive',
                  detail: 'Triangle polygon built from raw points.',
                })
              }
            />
            <Line
              x1={34}
              y1={150}
              x2={width - 34}
              y2={150}
              stroke={Colors.border}
              strokeWidth={2}
              strokeDasharray="4 6"
            />
            <Path
              d="M 40 128 C 76 164 122 104 156 138 C 188 170 232 110 274 140"
              stroke={Colors.secondary}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <SvgText x={40} y={184} fill={Colors.textPrimary} fontSize="18" fontWeight="700">
              Pure SVG surface
            </SvgText>
            <SvgText x={40} y={202} fill={Colors.textSecondary} fontSize="10">
              Shapes, text and gradients stay crisp in any scale.
            </SvgText>
          </Svg>
        )}
      </Surface>
    </Card>
  );
}

function AnimatedCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  const progress = useMemo(() => new Animated.Value(0), []);
  const pulse = useMemo(() => new Animated.Value(0), []);
  const [wavePhase, setWavePhase] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    const interval = setInterval(() => {
      setWavePhase(previous => previous + 0.35);
    }, 60);

    return () => clearInterval(interval);
  }, [progress, pulse]);

  const ringOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [270, 40],
  });

  return (
    <Card
      title="Animated SVG"
      subtitle="Stroke progress, pulsing geometry and procedural wave paths updated in realtime.">
      <View style={styles.animatedRow}>
        <View style={styles.animatedCell}>
          <Text style={styles.miniLabel}>Progress ring</Text>
          <Svg width={120} height={120}>
            <Circle cx={60} cy={60} r={43} stroke={Colors.border} strokeWidth={10} fill="none" />
            <AnimatedCircle
              cx={60}
              cy={60}
              r={43}
              stroke={Colors.primary}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              rotation="-90"
              origin="60, 60"
              strokeDasharray="270"
              strokeDashoffset={ringOffset as unknown as number}
              onPress={() =>
                onSelect({
                  color: Colors.primary,
                  title: 'Animated ring',
                  detail: 'SVG circle animated via strokeDashoffset.',
                })
              }
            />
          </Svg>
        </View>
        <View style={styles.animatedCell}>
          <Text style={styles.miniLabel}>Pulse cluster</Text>
          <Svg width={120} height={120}>
            {[0, 1, 2].map(index => {
              const radius = pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [16 + index * 12, 28 + index * 16],
              });
              const opacity = pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5 - index * 0.12, 0.06],
              });
              return (
                <AnimatedCircle
                  key={`pulse-${index}`}
                  cx={60}
                  cy={60}
                  r={radius as unknown as number}
                  fill={Colors.secondary}
                  fillOpacity={opacity as unknown as number}
                />
              );
            })}
            <Circle cx={60} cy={60} r={14} fill={Colors.secondary} />
          </Svg>
        </View>
      </View>
      <Surface height={132}>
        {width => {
          const points = Array.from({length: 24}, (_, index) => {
            const x = 18 + index * ((width - 36) / 23);
            const y =
              68 +
              Math.sin(index * 0.55 + wavePhase) * 18 +
              Math.cos(index * 0.35 + wavePhase * 0.8) * 10;
            return {x, y};
          });
          return (
            <Svg width={width} height={132}>
              <Path
                d={buildLinePath(points)}
                stroke={Colors.success}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                onPress={() =>
                  onSelect({
                    color: Colors.success,
                    title: 'Procedural wave',
                    detail: 'Animated SVG path rebuilt from sampled waveform points.',
                  })
                }
              />
            </Svg>
          );
        }}
      </Surface>
    </Card>
  );
}

function IconsCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  const icons = [
    {label: 'Orbit', color: Colors.primary, component: OrbitIcon},
    {label: 'Pulse', color: Colors.secondary, component: PulseIcon},
    {label: 'Nodes', color: Colors.success, component: NodeIcon},
    {label: 'Charts', color: Colors.warning, component: VectorChartIcon},
  ];

  return (
    <Card
      title="Custom SVG Icons"
      subtitle="A tiny icon set built from raw paths and shapes instead of a font or external package.">
      <View style={styles.iconGrid}>
        {icons.map(item => {
          const Icon = item.component;
          return (
            <Pressable
              key={item.label}
              style={styles.iconCard}
              onPress={() =>
                onSelect({
                  color: item.color,
                  title: `${item.label} icon`,
                  detail: 'Custom vector icon built entirely from SVG primitives.',
                })
              }>
              <Icon color={item.color} />
              <Text style={styles.iconLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

function PathDrawingCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  const draw = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(draw, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.delay(350),
        Animated.timing(draw, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [draw]);

  const strokeOffset = draw.interpolate({
    inputRange: [0, 1],
    outputRange: [380, 0],
  });

  return (
    <Card
      title="Path Drawing"
      subtitle="Stroke dash animation progressively reveals the path as if it were being hand-drawn.">
      <Surface height={172}>
        {width => (
          <Svg width={width} height={172}>
            <Path
              d={DRAW_PATH}
              stroke={Colors.border}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <AnimatedPath
              d={DRAW_PATH}
              stroke={Colors.primary}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="380"
              strokeDashoffset={strokeOffset as unknown as number}
              onPress={() =>
                onSelect({
                  color: Colors.primary,
                  title: 'Path animation',
                  detail: 'Animated SVG stroke reveal using dash offset.',
                })
              }
            />
          </Svg>
        )}
      </Surface>
    </Card>
  );
}

function MorphCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  const morph = useMemo(() => new Animated.Value(0), []);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listenerId = morph.addListener(({value}) => {
      setProgress(value);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(morph, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(morph, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    return () => morph.removeListener(listenerId);
  }, [morph]);

  const morphPath = pointsToPath(
    blendShapes(MORPH_SHAPES.orb, MORPH_SHAPES.star, progress),
  );

  return (
    <Card
      title="SVG Morphing"
      subtitle="A path transitions between compatible point sets to morph one vector silhouette into another.">
      <View style={styles.morphRow}>
        <Svg width={120} height={120} viewBox="0 0 100 100">
          <Path
            d={morphPath}
            fill={Colors.secondary}
            fillOpacity={0.2}
            stroke={Colors.secondary}
            strokeWidth={3}
            onPress={() =>
              onSelect({
                color: Colors.secondary,
                title: 'Morph transition',
                detail: 'Point-by-point interpolation between SVG shapes.',
              })
            }
          />
        </Svg>
        <View style={styles.morphCopy}>
          <Text style={styles.morphLabel}>Progress</Text>
          <Text style={styles.morphValue}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.morphText}>
            The screen interpolates matching control points to avoid jumps during the transition.
          </Text>
        </View>
      </View>
    </Card>
  );
}

function PureSvgChartsCard({onSelect}: {onSelect: (insight: Insight) => void}) {
  const values = [18, 24, 22, 31, 28, 34, 32];

  return (
    <Card
      title="Pure SVG Charts"
      subtitle="Mini bar, line and radial views built only with SVG paths and shapes.">
      <View style={styles.vectorChartGrid}>
        <Surface height={144}>
          {width => {
            const height = 144;
            const barWidth = (width - 44) / values.length;
            return (
              <Svg width={width} height={height}>
                {values.map((value, index) => {
                  const x = 20 + index * barWidth;
                  const barHeight = value * 2.5;
                  const y = height - 18 - barHeight;
                  return (
                    <Rect
                      key={`pure-bar-${index}`}
                      x={x}
                      y={y}
                      width={barWidth - 8}
                      height={barHeight}
                      rx={8}
                      fill={Colors.primary}
                      onPress={() =>
                        onSelect({
                          color: Colors.primary,
                          title: `SVG bar ${index + 1}`,
                          detail: `${value} units drawn as a pure SVG bar.`,
                        })
                      }
                    />
                  );
                })}
              </Svg>
            );
          }}
        </Surface>
        <Surface height={144}>
          {width => {
            const points = buildLinePoints(values, width, 144, 18);
            return (
              <Svg width={width} height={144}>
                <Path
                  d={buildLinePath(points)}
                  stroke={Colors.success}
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, index) => (
                  <Circle
                    key={`pure-line-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={Colors.success}
                    onPress={() =>
                      onSelect({
                        color: Colors.success,
                        title: `SVG line point ${index + 1}`,
                        detail: `${values[index]} units on a polyline chart.`,
                      })
                    }
                  />
                ))}
              </Svg>
            );
          }}
        </Surface>
        <Surface height={144}>
          {width => {
            const centerX = width / 2;
            const centerY = 72;
            const radius = 46;
            const end = polarToCartesian(centerX, centerY, radius, 180);
            const start = polarToCartesian(centerX, centerY, radius, -180);
            return (
              <Svg width={width} height={144}>
                <Path
                  d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`}
                  stroke={Colors.border}
                  strokeWidth={12}
                  fill="none"
                />
                <Path
                  d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${polarToCartesian(centerX, centerY, radius, 54).x} ${polarToCartesian(centerX, centerY, radius, 54).y}`}
                  stroke={Colors.warning}
                  strokeWidth={12}
                  fill="none"
                  strokeLinecap="round"
                  onPress={() =>
                    onSelect({
                      color: Colors.warning,
                      title: 'SVG radial chart',
                      detail: 'Semi-circular radial chart built from SVG arc paths.',
                    })
                  }
                />
                <SvgText x={centerX} y={76} fill={Colors.textPrimary} fontSize="22" fontWeight="700" textAnchor="middle">
                  78%
                </SvgText>
              </Svg>
            );
          }}
        </Surface>
      </View>
    </Card>
  );
}

function SvgLab() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  return (
    <SectionWrapper
      title="SVG & Vector Lab"
      subtitle="Dedicated vector playground for raw SVG rendering, animation, icon systems, path drawing, morphing and chart primitives.">
      <View style={styles.selectionCard}>
        <Text style={styles.selectionLabel}>Selected vector demo</Text>
        <Text
          style={[
            styles.selectionTitle,
            selectedInsight && {color: selectedInsight.color},
          ]}>
          {selectedInsight?.title ?? 'Tap any vector element'}
        </Text>
        <Text style={styles.selectionText}>
          {selectedInsight?.detail ??
            'Every card below exposes touchable SVG elements so the user can inspect what is being rendered.'}
        </Text>
      </View>

      <BasicsCard onSelect={setSelectedInsight} />
      <AnimatedCard onSelect={setSelectedInsight} />
      <IconsCard onSelect={setSelectedInsight} />
      <PathDrawingCard onSelect={setSelectedInsight} />
      <MorphCard onSelect={setSelectedInsight} />
      <PureSvgChartsCard onSelect={setSelectedInsight} />
    </SectionWrapper>
  );
}

export default function SvgScreen() {
  return (
    <ScreenContainer>
      <SvgLab />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  selectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: 4,
    marginBottom: Spacing.md,
    ...fluentShadow('sm'),
  },
  selectionLabel: {
    ...Typography.label,
    color: Colors.primary,
  },
  selectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  selectionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    ...fluentShadow('sm'),
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  surface: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCardAlt,
    overflow: 'hidden',
  },
  animatedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  animatedCell: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  miniLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconCard: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  iconLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  morphRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
  },
  morphCopy: {
    flex: 1,
    minWidth: 140,
    gap: 4,
  },
  morphLabel: {
    ...Typography.label,
    color: Colors.secondary,
  },
  morphValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  morphText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  vectorChartGrid: {
    gap: Spacing.sm,
  },
});
