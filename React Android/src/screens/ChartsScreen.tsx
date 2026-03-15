import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';
import {
  buildAreaPath,
  buildFunnelLayout,
  buildLinePath,
  buildLinePoints,
  buildPolyline,
  buildRadarPoints,
  buildTreemapLayout,
  clampValue,
  polarToCartesian,
  scaleLinear,
  type FunnelStep,
  type TreemapItem,
} from '../utils/chartMath';

type Insight = {
  color: string;
  detail: string;
  title: string;
};

const BAR_DATA = [
  {label: 'Jan', value: 68, color: Colors.primary},
  {label: 'Feb', value: 82, color: Colors.secondary},
  {label: 'Mar', value: 54, color: Colors.accent},
  {label: 'Apr', value: 91, color: Colors.success},
  {label: 'May', value: 76, color: Colors.warning},
  {label: 'Jun', value: 64, color: Colors.orange},
];

const GROUP_SERIES = [
  {
    label: 'Q1',
    values: [
      {label: 'Mobile', value: 62, color: Colors.primary},
      {label: 'Desktop', value: 48, color: Colors.secondary},
      {label: 'Web', value: 34, color: Colors.accent},
    ],
  },
  {
    label: 'Q2',
    values: [
      {label: 'Mobile', value: 74, color: Colors.primary},
      {label: 'Desktop', value: 57, color: Colors.secondary},
      {label: 'Web', value: 39, color: Colors.accent},
    ],
  },
  {
    label: 'Q3',
    values: [
      {label: 'Mobile', value: 81, color: Colors.primary},
      {label: 'Desktop', value: 63, color: Colors.secondary},
      {label: 'Web', value: 46, color: Colors.accent},
    ],
  },
  {
    label: 'Q4',
    values: [
      {label: 'Mobile', value: 86, color: Colors.primary},
      {label: 'Desktop', value: 69, color: Colors.secondary},
      {label: 'Web', value: 52, color: Colors.accent},
    ],
  },
];

const STACK_SERIES = [
  {
    label: 'North',
    values: [
      {label: 'New', value: 24, color: Colors.primary},
      {label: 'Expansion', value: 18, color: Colors.secondary},
      {label: 'Renewal', value: 14, color: Colors.success},
    ],
  },
  {
    label: 'South',
    values: [
      {label: 'New', value: 28, color: Colors.primary},
      {label: 'Expansion', value: 19, color: Colors.secondary},
      {label: 'Renewal', value: 12, color: Colors.success},
    ],
  },
  {
    label: 'West',
    values: [
      {label: 'New', value: 22, color: Colors.primary},
      {label: 'Expansion', value: 21, color: Colors.secondary},
      {label: 'Renewal', value: 17, color: Colors.success},
    ],
  },
  {
    label: 'Central',
    values: [
      {label: 'New', value: 30, color: Colors.primary},
      {label: 'Expansion', value: 23, color: Colors.secondary},
      {label: 'Renewal', value: 18, color: Colors.success},
    ],
  },
];

const RADAR_AXES = [
  {label: 'Speed', value: 88},
  {label: 'UX', value: 92},
  {label: 'Scale', value: 81},
  {label: 'Quality', value: 86},
  {label: 'Insight', value: 79},
];

const SCATTER_POINTS = [
  {label: 'Alpha', x: 14, y: 36, color: Colors.primary},
  {label: 'Beta', x: 32, y: 58, color: Colors.secondary},
  {label: 'Gamma', x: 48, y: 42, color: Colors.success},
  {label: 'Delta', x: 64, y: 76, color: Colors.warning},
  {label: 'Epsilon', x: 78, y: 54, color: Colors.orange},
  {label: 'Zeta', x: 86, y: 82, color: Colors.pink},
];

const BUBBLE_POINTS = [
  {label: 'Retail', x: 18, y: 68, size: 20, color: Colors.primary},
  {label: 'Ops', x: 36, y: 48, size: 16, color: Colors.secondary},
  {label: 'Growth', x: 55, y: 76, size: 26, color: Colors.success},
  {label: 'AI', x: 73, y: 34, size: 18, color: Colors.warning},
  {label: 'Cloud', x: 86, y: 62, size: 24, color: Colors.accent},
];

const CANDLE_DATA = [
  {label: 'Mon', open: 42, close: 54, high: 60, low: 36},
  {label: 'Tue', open: 54, close: 50, high: 61, low: 45},
  {label: 'Wed', open: 50, close: 63, high: 68, low: 48},
  {label: 'Thu', open: 63, close: 58, high: 71, low: 53},
  {label: 'Fri', open: 58, close: 72, high: 78, low: 56},
  {label: 'Sat', open: 72, close: 69, high: 80, low: 64},
  {label: 'Sun', open: 69, close: 77, high: 84, low: 67},
];

const HEATMAP = [
  [18, 32, 47, 55, 66, 72, 81],
  [12, 26, 36, 48, 62, 70, 76],
  [8, 18, 30, 44, 56, 66, 71],
  [16, 28, 42, 52, 68, 74, 88],
  [22, 34, 46, 58, 63, 79, 93],
];

const TREEMAP_ITEMS: TreemapItem[] = [
  {label: 'Platform', value: 32, color: Colors.primary},
  {label: 'Analytics', value: 24, color: Colors.secondary},
  {label: 'Automation', value: 18, color: Colors.success},
  {label: 'Growth', value: 15, color: Colors.warning},
  {label: 'Support', value: 11, color: Colors.accent},
];

const FUNNEL_STEPS: FunnelStep[] = [
  {label: 'Awareness', value: 100, color: Colors.primary},
  {label: 'Qualified', value: 74, color: Colors.secondary},
  {label: 'Trials', value: 48, color: Colors.success},
  {label: 'Negotiation', value: 30, color: Colors.warning},
  {label: 'Closed', value: 18, color: Colors.accent},
];

function buildArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function ChartCard({
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

function ChartSurface({
  children,
  height,
}: {
  children: (width: number) => React.ReactNode;
  height: number;
}) {
  const [width, setWidth] = useState(0);

  return (
    <View
      style={[styles.chartSurface, {height}]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? children(width) : null}
    </View>
  );
}

function SummaryCard({
  liveSeries,
  selectedInsight,
}: {
  liveSeries: number[];
  selectedInsight: Insight | null;
}) {
  const sparklineHeight = 58;
  const currentValue = liveSeries[liveSeries.length - 1];
  const previousValue = liveSeries[liveSeries.length - 2];
  const delta = currentValue - previousValue;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>Realtime dashboard</Text>
        <Text style={styles.summaryValue}>{currentValue}%</Text>
        <Text style={styles.summaryDelta}>
          {delta >= 0 ? '+' : ''}
          {delta}% in the last interval
        </Text>
        <Text style={styles.summaryText}>
          Touch any chart mark to inspect the exact value.
        </Text>
      </View>
      <View style={styles.summarySparkline}>
        <ChartSurface height={sparklineHeight}>
          {width => {
            const points = buildLinePoints(liveSeries, width, sparklineHeight, 6);
            return (
              <Svg width={width} height={sparklineHeight}>
                <Path
                  d={buildAreaPath(points, sparklineHeight - 6)}
                  fill={Colors.primary}
                  fillOpacity={0.12}
                />
                <Path
                  d={buildLinePath(points)}
                  fill="none"
                  stroke={Colors.primary}
                  strokeWidth={2.5}
                />
                <Circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r={4}
                  fill={Colors.secondary}
                />
              </Svg>
            );
          }}
        </ChartSurface>
      </View>
      <View style={styles.selectionCard}>
        <Text style={styles.selectionLabel}>Selected insight</Text>
        <Text
          style={[
            styles.selectionTitle,
            selectedInsight && {color: selectedInsight.color},
          ]}>
          {selectedInsight?.title ?? 'Tap a chart element'}
        </Text>
        <Text style={styles.selectionText}>
          {selectedInsight?.detail ??
            'Bars, points, cells and funnel stages are interactive.'}
        </Text>
      </View>
    </View>
  );
}

function BarsCard({
  onSelect,
}: {
  onSelect: (insight: Insight) => void;
}) {
  return (
    <ChartCard
      title="Bars and Comparisons"
      subtitle="Vertical, stacked and grouped bars rendered responsively with touch targets.">
      <ChartSurface height={190}>
        {width => {
          const height = 190;
          const paddingLeft = 28;
          const paddingRight = 12;
          const paddingTop = 12;
          const paddingBottom = 28;
          const plotWidth = width - paddingLeft - paddingRight;
          const plotHeight = height - paddingTop - paddingBottom;
          const maxValue = 100;
          const step = plotWidth / BAR_DATA.length;
          const barWidth = step * 0.58;

          return (
            <Svg width={width} height={height}>
              {[0, 25, 50, 75, 100].map(value => {
                const y =
                  paddingTop + plotHeight - (value / maxValue) * plotHeight;
                return (
                  <React.Fragment key={`vertical-grid-${value}`}>
                    <Line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke={Colors.border}
                      strokeOpacity={0.35}
                    />
                    <SvgText
                      x={paddingLeft - 6}
                      y={y + 4}
                      fill={Colors.textMuted}
                      fontSize="9"
                      textAnchor="end">
                      {value}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {BAR_DATA.map((item, index) => {
                const barHeight = (item.value / maxValue) * plotHeight;
                const x = paddingLeft + index * step + (step - barWidth) / 2;
                const y = paddingTop + plotHeight - barHeight;
                return (
                  <React.Fragment key={item.label}>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={8}
                      fill={item.color}
                      onPress={() =>
                        onSelect({
                          color: item.color,
                          title: `Revenue ${item.label}`,
                          detail: `${item.value}% completion in the monthly vertical bar chart.`,
                        })
                      }
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill={item.color}
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle">
                      {item.value}
                    </SvgText>
                    <SvgText
                      x={x + barWidth / 2}
                      y={height - 8}
                      fill={Colors.textSecondary}
                      fontSize="9"
                      textAnchor="middle">
                      {item.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={190}>
        {width => {
          const height = 190;
          const paddingLeft = 28;
          const paddingRight = 14;
          const paddingTop = 14;
          const paddingBottom = 28;
          const plotWidth = width - paddingLeft - paddingRight;
          const plotHeight = height - paddingTop - paddingBottom;
          const maxValue = 80;
          const groups = STACK_SERIES.length;
          const step = plotWidth / groups;
          const barWidth = step * 0.46;

          return (
            <Svg width={width} height={height}>
              {[0, 20, 40, 60, 80].map(value => {
                const y =
                  paddingTop + plotHeight - (value / maxValue) * plotHeight;
                return (
                  <Line
                    key={`stack-grid-${value}`}
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={Colors.border}
                    strokeOpacity={0.35}
                  />
                );
              })}
              {STACK_SERIES.map((group, index) => {
                const x = paddingLeft + index * step + (step - barWidth) / 2;
                let cumulative = 0;
                return (
                  <React.Fragment key={group.label}>
                    {group.values.map(segment => {
                      const segmentHeight =
                        (segment.value / maxValue) * plotHeight;
                      cumulative += segment.value;
                      const top =
                        paddingTop +
                        plotHeight -
                        (cumulative / maxValue) * plotHeight;
                      return (
                        <Rect
                          key={`${group.label}-${segment.label}`}
                          x={x}
                          y={top}
                          width={barWidth}
                          height={segmentHeight}
                          fill={segment.color}
                          onPress={() =>
                            onSelect({
                              color: segment.color,
                              title: `${group.label} ${segment.label}`,
                              detail: `${segment.value} points stacked in the regional revenue mix.`,
                            })
                          }
                        />
                      );
                    })}
                    <SvgText
                      x={x + barWidth / 2}
                      y={height - 8}
                      fill={Colors.textSecondary}
                      fontSize="9"
                      textAnchor="middle">
                      {group.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={196}>
        {width => {
          const height = 196;
          const paddingLeft = 28;
          const paddingRight = 12;
          const paddingTop = 14;
          const paddingBottom = 30;
          const plotWidth = width - paddingLeft - paddingRight;
          const plotHeight = height - paddingTop - paddingBottom;
          const maxValue = 100;
          const groupStep = plotWidth / GROUP_SERIES.length;
          const innerGap = 5;
          const groupWidth = groupStep * 0.74;
          const barWidth = (groupWidth - innerGap * 2) / 3;

          return (
            <Svg width={width} height={height}>
              {[0, 25, 50, 75, 100].map(value => {
                const y =
                  paddingTop + plotHeight - (value / maxValue) * plotHeight;
                return (
                  <Line
                    key={`group-grid-${value}`}
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={Colors.border}
                    strokeOpacity={0.35}
                  />
                );
              })}
              {GROUP_SERIES.map((group, groupIndex) => {
                const groupStart =
                  paddingLeft + groupIndex * groupStep + (groupStep - groupWidth) / 2;

                return (
                  <React.Fragment key={group.label}>
                    {group.values.map((item, itemIndex) => {
                      const x = groupStart + itemIndex * (barWidth + innerGap);
                      const barHeight = (item.value / maxValue) * plotHeight;
                      const y = paddingTop + plotHeight - barHeight;
                      return (
                        <Rect
                          key={`${group.label}-${item.label}`}
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx={6}
                          fill={item.color}
                          onPress={() =>
                            onSelect({
                              color: item.color,
                              title: `${group.label} ${item.label}`,
                              detail: `${item.value}% in the grouped channel comparison.`,
                            })
                          }
                        />
                      );
                    })}
                    <SvgText
                      x={groupStart + groupWidth / 2}
                      y={height - 8}
                      fill={Colors.textSecondary}
                      fontSize="9"
                      textAnchor="middle">
                      {group.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>
    </ChartCard>
  );
}

function TrendsCard({
  liveSeries,
  onSelect,
}: {
  liveSeries: number[];
  onSelect: (insight: Insight) => void;
}) {
  return (
    <ChartCard
      title="Realtime Trends"
      subtitle="Live line updates, filled area chart, interactive points and inline sparklines.">
      <View style={styles.kpiRow}>
        {[
          {label: 'Latency', value: `${100 - liveSeries[liveSeries.length - 1]}ms`, color: Colors.warning},
          {label: 'Throughput', value: `${liveSeries[liveSeries.length - 1]}%`, color: Colors.primary},
          {label: 'Conversion', value: `${Math.round(liveSeries.slice(-4).reduce((sum, item) => sum + item, 0) / 4)}%`, color: Colors.success},
        ].map(item => (
          <View key={item.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <Text style={[styles.kpiValue, {color: item.color}]}>{item.value}</Text>
          </View>
        ))}
      </View>
      <ChartSurface height={228}>
        {width => {
          const height = 228;
          const padding = 18;
          const points = buildLinePoints(liveSeries, width, height, padding);
          const baseline = height - padding;
          const latest = points[points.length - 1];

          return (
            <Svg width={width} height={height}>
              {[0, 25, 50, 75, 100].map(value => {
                const y = scaleLinear(value, 0, 100, baseline, padding);
                return (
                  <Line
                    key={`trend-grid-${value}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke={Colors.border}
                    strokeOpacity={0.3}
                  />
                );
              })}
              <Path
                d={buildAreaPath(points, baseline)}
                fill={Colors.primary}
                fillOpacity={0.14}
              />
              <Path
                d={buildLinePath(points)}
                fill="none"
                stroke={Colors.secondary}
                strokeWidth={3}
              />
              {points.map((point, index) => (
                <React.Fragment key={`trend-point-${index}`}>
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={index === points.length - 1 ? 5 : 4}
                    fill={index === points.length - 1 ? Colors.secondary : Colors.primary}
                    onPress={() =>
                      onSelect({
                        color: Colors.secondary,
                        title: `Realtime tick ${index + 1}`,
                        detail: `${liveSeries[index]}% in the responsive area chart.`,
                      })
                    }
                  />
                  <Line
                    x1={point.x}
                    y1={point.y}
                    x2={point.x}
                    y2={baseline}
                    stroke={Colors.primary}
                    strokeOpacity={0.12}
                  />
                </React.Fragment>
              ))}
              <SvgText
                x={latest.x}
                y={latest.y - 10}
                fill={Colors.secondary}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle">
                {liveSeries[liveSeries.length - 1]}%
              </SvgText>
            </Svg>
          );
        }}
      </ChartSurface>
    </ChartCard>
  );
}

function ExplorationCard({
  onSelect,
}: {
  onSelect: (insight: Insight) => void;
}) {
  return (
    <ChartCard
      title="Exploration Views"
      subtitle="Radar, scatter and bubble charts for multi-dimensional comparisons.">
      <ChartSurface height={250}>
        {width => {
          const height = 250;
          const radius = Math.min(width * 0.28, 78);
          const centerX = width / 2;
          const centerY = height / 2;
          const values = RADAR_AXES.map(axis => axis.value);
          const radarPoints = buildRadarPoints(values, 100, centerX, centerY, radius);

          return (
            <Svg width={width} height={height}>
              {[0.25, 0.5, 0.75, 1].map(level => {
                const points = buildRadarPoints(
                  RADAR_AXES.map(() => level * 100),
                  100,
                  centerX,
                  centerY,
                  radius,
                );
                return (
                  <Polygon
                    key={`radar-grid-${level}`}
                    points={buildPolyline(points)}
                    fill="none"
                    stroke={Colors.border}
                    strokeOpacity={0.35}
                  />
                );
              })}
              {RADAR_AXES.map((axis, index) => {
                const edge = polarToCartesian(
                  centerX,
                  centerY,
                  radius + 18,
                  (360 / RADAR_AXES.length) * index,
                );
                return (
                  <React.Fragment key={axis.label}>
                    <Line
                      x1={centerX}
                      y1={centerY}
                      x2={edge.x}
                      y2={edge.y}
                      stroke={Colors.border}
                      strokeOpacity={0.35}
                    />
                    <SvgText
                      x={edge.x}
                      y={edge.y}
                      fill={Colors.textSecondary}
                      fontSize="10"
                      textAnchor="middle">
                      {axis.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              <Polygon
                points={buildPolyline(radarPoints)}
                fill={Colors.primary}
                fillOpacity={0.2}
                stroke={Colors.primary}
                strokeWidth={2}
              />
              {radarPoints.map((point, index) => (
                <Circle
                  key={`radar-point-${RADAR_AXES[index].label}`}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={Colors.secondary}
                  onPress={() =>
                    onSelect({
                      color: Colors.secondary,
                      title: `Radar ${RADAR_AXES[index].label}`,
                      detail: `${RADAR_AXES[index].value}/100 on the spider chart.`,
                    })
                  }
                />
              ))}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={210}>
        {width => {
          const height = 210;
          const padding = 28;
          return (
            <Svg width={width} height={height}>
              <Line
                x1={padding}
                y1={height - padding}
                x2={width - 12}
                y2={height - padding}
                stroke={Colors.border}
              />
              <Line
                x1={padding}
                y1={height - padding}
                x2={padding}
                y2={16}
                stroke={Colors.border}
              />
              {SCATTER_POINTS.map(point => {
                const x = scaleLinear(point.x, 0, 100, padding, width - 18);
                const y = scaleLinear(point.y, 0, 100, height - padding, 20);
                return (
                  <Circle
                    key={point.label}
                    cx={x}
                    cy={y}
                    r={5}
                    fill={point.color}
                    onPress={() =>
                      onSelect({
                        color: point.color,
                        title: point.label,
                        detail: `Scatter position x:${point.x} y:${point.y}.`,
                      })
                    }
                  />
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={210}>
        {width => {
          const height = 210;
          const padding = 28;
          return (
            <Svg width={width} height={height}>
              <Line
                x1={padding}
                y1={height - padding}
                x2={width - 12}
                y2={height - padding}
                stroke={Colors.border}
              />
              <Line
                x1={padding}
                y1={height - padding}
                x2={padding}
                y2={16}
                stroke={Colors.border}
              />
              {BUBBLE_POINTS.map(point => {
                const x = scaleLinear(point.x, 0, 100, padding, width - 18);
                const y = scaleLinear(point.y, 0, 100, height - padding, 20);
                return (
                  <Circle
                    key={point.label}
                    cx={x}
                    cy={y}
                    r={point.size}
                    fill={point.color}
                    fillOpacity={0.28}
                    stroke={point.color}
                    strokeWidth={2}
                    onPress={() =>
                      onSelect({
                        color: point.color,
                        title: `${point.label} bubble`,
                        detail: `x:${point.x} y:${point.y} radius:${point.size}.`,
                      })
                    }
                  />
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>
    </ChartCard>
  );
}

function FinanceCard({
  gaugeValue,
  onSelect,
}: {
  gaugeValue: number;
  onSelect: (insight: Insight) => void;
}) {
  return (
    <ChartCard
      title="Financial Signals"
      subtitle="Candlestick patterns and a live gauge/speedometer for system health.">
      <ChartSurface height={220}>
        {width => {
          const height = 220;
          const padding = 18;
          const plotHeight = height - 42;
          const step = (width - padding * 2) / CANDLE_DATA.length;
          const bodyWidth = step * 0.44;
          const maxValue = 90;
          const minValue = 30;

          return (
            <Svg width={width} height={height}>
              {[30, 45, 60, 75, 90].map(value => {
                const y = scaleLinear(value, minValue, maxValue, plotHeight, padding);
                return (
                  <Line
                    key={`candle-grid-${value}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke={Colors.border}
                    strokeOpacity={0.3}
                  />
                );
              })}
              {CANDLE_DATA.map((candle, index) => {
                const x = padding + index * step + step / 2;
                const highY = scaleLinear(candle.high, minValue, maxValue, plotHeight, padding);
                const lowY = scaleLinear(candle.low, minValue, maxValue, plotHeight, padding);
                const openY = scaleLinear(candle.open, minValue, maxValue, plotHeight, padding);
                const closeY = scaleLinear(candle.close, minValue, maxValue, plotHeight, padding);
                const top = Math.min(openY, closeY);
                const bodyHeight = Math.max(4, Math.abs(closeY - openY));
                const color = candle.close >= candle.open ? Colors.success : Colors.error;

                return (
                  <React.Fragment key={candle.label}>
                    <Line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={color}
                      strokeWidth={2}
                    />
                    <Rect
                      x={x - bodyWidth / 2}
                      y={top}
                      width={bodyWidth}
                      height={bodyHeight}
                      rx={4}
                      fill={color}
                      onPress={() =>
                        onSelect({
                          color,
                          title: `${candle.label} candlestick`,
                          detail: `O:${candle.open} H:${candle.high} L:${candle.low} C:${candle.close}.`,
                        })
                      }
                    />
                    <SvgText
                      x={x}
                      y={height - 10}
                      fill={Colors.textSecondary}
                      fontSize="9"
                      textAnchor="middle">
                      {candle.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={170}>
        {width => {
          const height = 170;
          const centerX = width / 2;
          const centerY = height - 18;
          const radius = Math.min(width * 0.32, 78);
          const angle = scaleLinear(gaugeValue, 0, 100, -120, 120);
          const needle = polarToCartesian(centerX, centerY, radius - 12, angle);
          const segments = [
            {start: -120, end: -40, color: Colors.error},
            {start: -40, end: 40, color: Colors.warning},
            {start: 40, end: 120, color: Colors.success},
          ];

          return (
            <Svg width={width} height={height}>
              {segments.map(segment => (
                <Path
                  key={`${segment.start}-${segment.end}`}
                  d={buildArcPath(centerX, centerY, radius, segment.start, segment.end)}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={18}
                  strokeLinecap="round"
                  onPress={() =>
                    onSelect({
                      color: segment.color,
                      title: 'Gauge band',
                      detail: `${segment.start}deg to ${segment.end}deg range on the speedometer.`,
                    })
                  }
                />
              ))}
              <Path
                d={buildArcPath(centerX, centerY, radius, -120, angle)}
                fill="none"
                stroke={Colors.primary}
                strokeWidth={7}
                strokeLinecap="round"
              />
              <Line
                x1={centerX}
                y1={centerY}
                x2={needle.x}
                y2={needle.y}
                stroke={Colors.primary}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Circle cx={centerX} cy={centerY} r={8} fill={Colors.primary} />
              <SvgText
                x={centerX}
                y={centerY - 44}
                fill={Colors.textPrimary}
                fontSize="22"
                fontWeight="700"
                textAnchor="middle">
                {gaugeValue}
              </SvgText>
              <SvgText
                x={centerX}
                y={centerY - 22}
                fill={Colors.textSecondary}
                fontSize="11"
                textAnchor="middle">
                Health score
              </SvgText>
            </Svg>
          );
        }}
      </ChartSurface>
    </ChartCard>
  );
}

function MatrixCard({
  onSelect,
}: {
  onSelect: (insight: Insight) => void;
}) {
  return (
    <ChartCard
      title="Matrices and Flow"
      subtitle="Heatmap, treemap and funnel charts for allocation and conversion analysis.">
      <ChartSurface height={206}>
        {width => {
          const height = 206;
          const padding = 14;
          const rows = HEATMAP.length;
          const columns = HEATMAP[0].length;
          const cellWidth = (width - padding * 2) / columns;
          const cellHeight = (height - padding * 2) / rows;

          return (
            <Svg width={width} height={height}>
              {HEATMAP.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const x = padding + columnIndex * cellWidth;
                  const y = padding + rowIndex * cellHeight;
                  const opacity = scaleLinear(value, 0, 100, 0.16, 0.95);
                  return (
                    <Rect
                      key={`${rowIndex}-${columnIndex}`}
                      x={x}
                      y={y}
                      width={cellWidth - 4}
                      height={cellHeight - 4}
                      rx={8}
                      fill={Colors.primary}
                      fillOpacity={opacity}
                      onPress={() =>
                        onSelect({
                          color: Colors.primary,
                          title: `Heatmap ${rowIndex + 1}/${columnIndex + 1}`,
                          detail: `${value}% intensity for this time-slot cell.`,
                        })
                      }
                    />
                  );
                }),
              )}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={196}>
        {width => {
          const height = 196;
          const layout = buildTreemapLayout(TREEMAP_ITEMS, width, height, width > height);
          return (
            <Svg width={width} height={height}>
              {layout.map(item => (
                <React.Fragment key={item.label}>
                  <Rect
                    x={item.x}
                    y={item.y}
                    width={Math.max(0, item.width - 4)}
                    height={Math.max(0, item.height - 4)}
                    rx={12}
                    fill={item.color}
                    fillOpacity={0.82}
                    onPress={() =>
                      onSelect({
                        color: item.color,
                        title: `${item.label} treemap`,
                        detail: `${item.value}% share in the allocation map.`,
                      })
                    }
                  />
                  <SvgText
                    x={item.x + 12}
                    y={item.y + 22}
                    fill={Colors.white}
                    fontSize="11"
                    fontWeight="700">
                    {item.label}
                  </SvgText>
                  <SvgText
                    x={item.x + 12}
                    y={item.y + 38}
                    fill={Colors.white}
                    fontSize="10">
                    {item.value}%
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          );
        }}
      </ChartSurface>

      <ChartSurface height={248}>
        {width => {
          const height = 248;
          const segments = buildFunnelLayout(FUNNEL_STEPS, width, height, 10);
          return (
            <Svg width={width} height={height}>
              {segments.map(segment => (
                <React.Fragment key={segment.label}>
                  <Polygon
                    points={segment.points}
                    fill={segment.color}
                    fillOpacity={0.86}
                    onPress={() =>
                      onSelect({
                        color: segment.color,
                        title: `${segment.label} funnel`,
                        detail: `${segment.value}% retained at this conversion stage.`,
                      })
                    }
                  />
                  <SvgText
                    x={width / 2}
                    y={segment.centerY + 4}
                    fill={Colors.white}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle">
                    {segment.label} {segment.value}%
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          );
        }}
      </ChartSurface>
    </ChartCard>
  );
}

function ChartsDashboard() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [liveSeries, setLiveSeries] = useState([
    52, 55, 58, 61, 64, 67, 70, 68, 72, 76, 74, 79,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSeries(previous => {
        const last = previous[previous.length - 1];
        const drift = Math.sin(Date.now() / 900) * 6;
        const jitter = Math.round((Math.random() - 0.5) * 8);
        const next = clampValue(Math.round(last + drift * 0.35 + jitter), 38, 96);
        return [...previous.slice(1), next];
      });
    }, 1300);

    return () => clearInterval(interval);
  }, []);

  const gaugeValue = Math.round(
    liveSeries.slice(-4).reduce((sum, value) => sum + value, 0) / 4,
  );

  return (
    <Section title="Data Visualization Lab">
      <Text style={styles.sectionIntro}>
        Responsive SVG charts with realtime updates, touch inspection, matrix
        views and finance-style analytics.
      </Text>
      <SummaryCard liveSeries={liveSeries} selectedInsight={selectedInsight} />
      <BarsCard onSelect={setSelectedInsight} />
      <TrendsCard liveSeries={liveSeries} onSelect={setSelectedInsight} />
      <ExplorationCard onSelect={setSelectedInsight} />
      <FinanceCard gaugeValue={gaugeValue} onSelect={setSelectedInsight} />
      <MatrixCard onSelect={setSelectedInsight} />
    </Section>
  );
}

export default function ChartsScreen() {
  return (
    <ScreenContainer>
      <ChartsDashboard />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionIntro: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chartSurface: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCardAlt,
    overflow: 'hidden',
  },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryCopy: {
    gap: 2,
  },
  summaryLabel: {
    ...Typography.label,
    color: Colors.primary,
  },
  summaryValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  summaryDelta: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  summarySparkline: {
    height: 58,
  },
  selectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: 4,
  },
  selectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  selectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  selectionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
    minWidth: 88,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: 4,
  },
  kpiLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  kpiValue: {
    ...Typography.h4,
  },
});
