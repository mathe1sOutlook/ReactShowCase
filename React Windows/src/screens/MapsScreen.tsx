import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions} from 'react-native';
import Svg, {Circle, Line, Path, Polyline, Rect} from 'react-native-svg';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type MarkerKind = 'office' | 'transit' | 'cafe' | 'park' | 'client';
type ThemeKey = 'night' | 'terrain' | 'satellite' | 'blueprint';
type ZoomLevel = 1 | 2 | 3;

type Marker = {
  id: string;
  name: string;
  address: string;
  district: 'Centro' | 'North' | 'South';
  kind: MarkerKind;
  x: number;
  y: number;
  tone: string;
  aliases: string[];
};

type Fence = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  tone: string;
};

type ThemePalette = {
  surface: string;
  land: string;
  water: string;
  road: string;
  route: string;
  grid: string;
  text: string;
  subtitle: string;
};

type Cluster = {
  id: string;
  district: Marker['district'];
  x: number;
  y: number;
  count: number;
  tone: string;
};

const VIEWBOX = 100;
const USER_ROUTE = [
  {x: 18, y: 74},
  {x: 23, y: 69},
  {x: 29, y: 62},
  {x: 36, y: 58},
  {x: 42, y: 50},
  {x: 49, y: 46},
  {x: 56, y: 43},
  {x: 64, y: 39},
  {x: 73, y: 33},
];

const MARKERS: Marker[] = [
  {
    id: 'hq',
    name: 'Showcase HQ',
    address: 'Paulista Avenue 100',
    district: 'Centro',
    kind: 'office',
    x: 52,
    y: 45,
    tone: Colors.primary,
    aliases: ['hq', 'paulista', 'office'],
  },
  {
    id: 'station',
    name: 'Metro Luz',
    address: 'Luz Station Hub',
    district: 'Centro',
    kind: 'transit',
    x: 38,
    y: 28,
    tone: Colors.warning,
    aliases: ['luz', 'station', 'metro'],
  },
  {
    id: 'cafe',
    name: 'Roaster Lab',
    address: 'Augusta Street 44',
    district: 'Centro',
    kind: 'cafe',
    x: 61,
    y: 51,
    tone: Colors.warning,
    aliases: ['cafe', 'coffee', 'augusta'],
  },
  {
    id: 'north-client',
    name: 'North Client',
    address: 'Cantareira Block 18',
    district: 'North',
    kind: 'client',
    x: 67,
    y: 22,
    tone: Colors.secondary,
    aliases: ['north', 'client', 'cantareira'],
  },
  {
    id: 'north-park',
    name: 'Serra Park',
    address: 'North green belt',
    district: 'North',
    kind: 'park',
    x: 78,
    y: 18,
    tone: Colors.success,
    aliases: ['park', 'north park', 'serra'],
  },
  {
    id: 'south-client',
    name: 'South Studio',
    address: 'Brooklin Towers 12',
    district: 'South',
    kind: 'client',
    x: 27,
    y: 77,
    tone: Colors.accent,
    aliases: ['south', 'studio', 'brooklin'],
  },
  {
    id: 'south-park',
    name: 'Pinheiros Green',
    address: 'Ibirapuera access south',
    district: 'South',
    kind: 'park',
    x: 44,
    y: 72,
    tone: Colors.success,
    aliases: ['green', 'ibirapuera', 'park'],
  },
  {
    id: 'south-cafe',
    name: 'Warehouse Cafe',
    address: 'Vila Olimpia 27',
    district: 'South',
    kind: 'cafe',
    x: 20,
    y: 66,
    tone: Colors.warning,
    aliases: ['warehouse', 'cafe', 'olimpia'],
  },
];

const FENCES: Fence[] = [
  {id: 'fence-core', label: 'HQ zone', x: 52, y: 45, radius: 12, tone: Colors.primary},
  {id: 'fence-north', label: 'North park fence', x: 78, y: 18, radius: 10, tone: Colors.success},
  {id: 'fence-south', label: 'Delivery zone', x: 28, y: 74, radius: 14, tone: Colors.warning},
];

const THEMES: Record<ThemeKey, ThemePalette> = {
  night: {
    surface: '#09111f',
    land: '#10243a',
    water: '#163a5c',
    road: '#365d82',
    route: '#63efff',
    grid: '#1d3853',
    text: '#ecf8ff',
    subtitle: '#9fb5c9',
  },
  terrain: {
    surface: '#131910',
    land: '#2d4730',
    water: '#335f7f',
    road: '#8bb278',
    route: '#ffe76a',
    grid: '#426143',
    text: '#f6ffe8',
    subtitle: '#beccb5',
  },
  satellite: {
    surface: '#0c1216',
    land: '#26362a',
    water: '#21455a',
    road: '#8c8f70',
    route: '#ff935c',
    grid: '#2b4037',
    text: '#f1f6f9',
    subtitle: '#bbc7d1',
  },
  blueprint: {
    surface: '#08172d',
    land: '#0f2b4d',
    water: '#143e63',
    road: '#85c7ff',
    route: '#ff73d2',
    grid: '#1e4d7a',
    text: '#eef8ff',
    subtitle: '#a2c0da',
  },
};

function distance(a: {x: number; y: number}, b: {x: number; y: number}) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function toLat(point: {x: number; y: number}) {
  return (-23.49 - point.y * 0.0012).toFixed(5);
}

function toLng(point: {x: number; y: number}) {
  return (-46.69 + point.x * 0.0013).toFixed(5);
}

function markerScale(zoom: ZoomLevel) {
  return zoom === 1 ? 0.92 : zoom === 2 ? 1 : 1.12;
}

export default function MapsScreen() {
  const {width} = useWindowDimensions();
  const fullWidth = width - Spacing.lg * 2;
  const cardWidth = width >= 1080 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const mapHeight = width >= 1180 ? 420 : width >= 760 ? 360 : 310;
  const [theme, setTheme] = useState<ThemeKey>('night');
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [search, setSearch] = useState('Paulista');
  const [selectedMarkerId, setSelectedMarkerId] = useState('hq');
  const [userStep, setUserStep] = useState(0);
  const [status, setStatus] = useState('Map ready. Search an address or tap a marker.');

  useEffect(() => {
    const timer = setInterval(() => {
      setUserStep(previous => (previous + 1) % USER_ROUTE.length);
    }, 1300);
    return () => clearInterval(timer);
  }, []);

  const palette = THEMES[theme];
  const selectedMarker = MARKERS.find(marker => marker.id === selectedMarkerId) ?? MARKERS[0];
  const userPoint = USER_ROUTE[userStep] ?? USER_ROUTE[0];
  const activeFences = FENCES.filter(fence => distance(fence, userPoint) <= fence.radius);
  const searchResults = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return MARKERS.slice(0, 5);
    }
    return MARKERS.filter(marker =>
      [marker.name, marker.address, marker.district, ...marker.aliases]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    ).slice(0, 5);
  }, [search]);

  const clusters = useMemo<Cluster[]>(() => {
    const grouped = MARKERS.reduce<Record<string, Marker[]>>((acc, marker) => {
      acc[marker.district] = [...(acc[marker.district] ?? []), marker];
      return acc;
    }, {});

    return Object.entries(grouped).map(([district, points]) => ({
      id: district.toLowerCase(),
      district: district as Marker['district'],
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
      count: points.length,
      tone: points[0]?.tone ?? Colors.primary,
    }));
  }, []);

  const clusterMode = zoom === 1;
  const nearestMarker = useMemo(() => {
    return [...MARKERS].sort((left, right) => distance(left, userPoint) - distance(right, userPoint))[0];
  }, [userPoint]);

  const locateAddress = (query = search) => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      setStatus('Enter a street, district or marker alias.');
      return;
    }

    const found = MARKERS.find(marker =>
      [marker.name, marker.address, marker.district, ...marker.aliases]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );

    if (!found) {
      setStatus(`No geocoding hit for "${query}". Try Paulista, Luz or Brooklin.`);
      return;
    }

    setSelectedMarkerId(found.id);
    setZoom(2);
    setStatus(`Geocoded ${found.name} at ${found.address}.`);
  };

  const focusCluster = (district: Marker['district']) => {
    const firstMarker = MARKERS.find(marker => marker.district === district);
    if (!firstMarker) {
      return;
    }
    setSelectedMarkerId(firstMarker.id);
    setZoom(2);
    setStatus(`${district} cluster expanded to individual markers.`);
  };

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 8.1</Text>
          <Text style={styles.title}>Maps</Text>
          <Text style={styles.body}>
            Interactive city mapping with custom markers, polyline routing, geofences, live user
            location, geocoding, clustering and style switching.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>8 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{clusterMode ? 'Cluster mode' : 'Marker mode'}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{theme}</Text></View>
          </View>
          <Text style={styles.note}>{status}</Text>
        </View>

        <View style={[styles.mapCard, {width: fullWidth}]}>
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderCopy}>
              <Text style={styles.cardTitle}>Interactive Map Canvas</Text>
              <Text style={styles.cardSubtitle}>
                Custom markers, route line, clustering and live tracking rendered with SVG.
              </Text>
            </View>
            <View style={styles.wrap}>
              {([1, 2, 3] as ZoomLevel[]).map(level => (
                <Pressable
                  key={level}
                  style={[styles.smallAction, zoom === level && styles.smallActionActive]}
                  onPress={() => setZoom(level)}>
                  <Text style={zoom === level ? styles.smallActionTextActive : styles.smallActionText}>
                    Zoom {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.wrap}>
            {(Object.keys(THEMES) as ThemeKey[]).map(key => (
              <Pressable
                key={key}
                style={[styles.smallAction, theme === key && styles.smallActionActive]}
                onPress={() => setTheme(key)}>
                <Text style={theme === key ? styles.smallActionTextActive : styles.smallActionText}>{key}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search address or district"
              placeholderTextColor={Colors.textSecondary}
              onSubmitEditing={() => locateAddress()}
            />
            <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={() => locateAddress()}>
              <Text style={styles.smallActionTextActive}>Locate</Text>
            </Pressable>
          </View>

          <View style={[styles.mapViewport, {height: mapHeight, backgroundColor: palette.surface}]}>
            <Svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} width="100%" height="100%">
              <Rect x="0" y="0" width="100" height="100" rx="6" fill={palette.land} />
              <Path d="M0 24 C18 14 30 15 45 21 S72 36 100 28 L100 0 L0 0 Z" fill={palette.water} opacity="0.92" />
              <Path d="M0 100 L0 66 C22 60 34 56 49 58 S80 70 100 64 L100 100 Z" fill={palette.water} opacity="0.68" />
              {[16, 32, 48, 64, 80].map(step => (
                <React.Fragment key={step}>
                  <Line x1={step} y1="0" x2={step} y2="100" stroke={palette.grid} strokeWidth="0.5" opacity="0.45" />
                  <Line x1="0" y1={step} x2="100" y2={step} stroke={palette.grid} strokeWidth="0.5" opacity="0.45" />
                </React.Fragment>
              ))}
              <Line x1="8" y1="78" x2="90" y2="22" stroke={palette.road} strokeWidth="2.6" opacity="0.72" />
              <Line x1="18" y1="12" x2="82" y2="90" stroke={palette.road} strokeWidth="1.8" opacity="0.62" />
              <Line x1="10" y1="48" x2="88" y2="48" stroke={palette.road} strokeWidth="1.4" opacity="0.5" />
              <Polyline
                points={USER_ROUTE.map(point => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke={palette.route}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {FENCES.map(fence => (
                <Circle
                  key={fence.id}
                  cx={fence.x}
                  cy={fence.y}
                  r={fence.radius}
                  stroke={fence.tone}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  fill={fence.tone}
                  fillOpacity={activeFences.some(active => active.id === fence.id) ? 0.2 : 0.08}
                />
              ))}
            </Svg>

            <View style={styles.overlay}>
              {clusterMode
                ? clusters.map(cluster => (
                    <Pressable
                      key={cluster.id}
                      style={[
                        styles.clusterPin,
                        {
                          left: `${cluster.x}%`,
                          top: `${cluster.y}%`,
                          backgroundColor: cluster.tone,
                        },
                      ]}
                      onPress={() => focusCluster(cluster.district)}>
                      <Text style={styles.clusterText}>{cluster.count}</Text>
                    </Pressable>
                  ))
                : MARKERS.map(marker => (
                    <Pressable
                      key={marker.id}
                      style={[
                        styles.markerPin,
                        {
                          left: `${marker.x}%`,
                          top: `${marker.y}%`,
                          transform: [{scale: markerScale(zoom)}],
                        },
                      ]}
                      onPress={() => {
                        setSelectedMarkerId(marker.id);
                        setStatus(`Focused ${marker.name} in ${marker.district}.`);
                      }}>
                      <View
                        style={[
                          styles.markerCore,
                          styles[`marker_${marker.kind}`],
                          selectedMarkerId === marker.id && styles.markerSelected,
                          {borderColor: marker.tone, backgroundColor: marker.tone + '26'},
                        ]}
                      />
                    </Pressable>
                  ))}
              <View
                style={[
                  styles.userDot,
                  {
                    left: `${userPoint.x}%`,
                    top: `${userPoint.y}%`,
                    borderColor: palette.route,
                  },
                ]}
              />
              <View
                style={[
                  styles.focusRing,
                  {
                    left: `${selectedMarker.x}%`,
                    top: `${selectedMarker.y}%`,
                    borderColor: selectedMarker.tone,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>Selected</Text>
              <Text style={styles.metricValue}>{selectedMarker.name}</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>User</Text>
              <Text style={styles.metricValue}>{toLat(userPoint)}, {toLng(userPoint)}</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>Geofences</Text>
              <Text style={styles.metricValue}>{activeFences.length ? activeFences.map(fence => fence.label).join(', ') : 'None'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Search & Geocoding</Text>
            <Text style={styles.cardSubtitle}>
              Address search resolves local coordinates and focuses the map on matching markers.
            </Text>
            {searchResults.map(result => (
              <Pressable
                key={result.id}
                style={[styles.row, selectedMarkerId === result.id && styles.rowSelected]}
                onPress={() => {
                  setSelectedMarkerId(result.id);
                  setZoom(2);
                  setStatus(`Geocoded ${result.name} from search results.`);
                }}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{result.name}</Text>
                  <Text style={styles.rowText}>{result.address}</Text>
                </View>
                <Text style={styles.rowMeta}>{result.district}</Text>
              </Pressable>
            ))}
            <CodeCard label="Selected coordinates" value={`${toLat(selectedMarker)}, ${toLng(selectedMarker)}`} />
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Live Tracking & Geofencing</Text>
            <Text style={styles.cardSubtitle}>
              The user marker advances along the route and checks the active fences every tick.
            </Text>
            <View style={styles.metricRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Nearest marker</Text>
                <Text style={styles.metricValue}>{nearestMarker.name}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>ETA</Text>
                <Text style={styles.metricValue}>{Math.max(1, USER_ROUTE.length - userStep)} min</Text>
              </View>
            </View>
            {FENCES.map(fence => (
              <View key={fence.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{fence.label}</Text>
                  <Text style={styles.rowText}>Radius {fence.radius.toFixed(0)} map units</Text>
                </View>
                <Text style={[styles.rowMeta, {color: activeFences.some(active => active.id === fence.id) ? fence.tone : palette.subtitle}]}>
                  {activeFences.some(active => active.id === fence.id) ? 'Inside' : 'Outside'}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Clusters & Styles</Text>
            <Text style={styles.cardSubtitle}>
              Zoom level 1 groups markers by district. Style presets retint land, water and roads.
            </Text>
            {clusters.map(cluster => (
              <View key={cluster.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{cluster.district}</Text>
                  <Text style={styles.rowText}>{cluster.count} markers clustered</Text>
                </View>
                <Text style={styles.rowMeta}>{clusterMode ? 'Clustered' : 'Expanded'}</Text>
              </View>
            ))}
            <CodeCard
              label="Theme palette"
              value={JSON.stringify({theme, route: palette.route, road: palette.road, water: palette.water}, null, 2)}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function CodeCard({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.codeCard}>
      <Text style={styles.codeLabel}>{label}</Text>
      <Text style={styles.codeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  mapCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  mapHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  sectionHead: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  smallAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  smallActionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  smallActionTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.bg,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  mapViewport: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  markerPin: {
    position: 'absolute',
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCore: {
    width: 18,
    height: 18,
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  marker_office: {
    borderRadius: 6,
  },
  marker_transit: {
    borderRadius: 2,
    transform: [{rotate: '45deg'}],
  },
  marker_cafe: {
    borderRadius: 9,
  },
  marker_park: {
    borderRadius: 9,
    width: 22,
    height: 14,
  },
  marker_client: {
    borderRadius: 4,
    width: 20,
    height: 20,
  },
  markerSelected: {
    borderWidth: 3,
    shadowColor: Colors.white,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  clusterText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.bg,
  },
  userDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: Colors.white,
    borderWidth: 4,
  },
  focusRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    borderWidth: 2,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricChip: {
    minWidth: 96,
    flexGrow: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowSelected: {
    borderColor: Colors.primary,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  rowText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  rowMeta: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  codeCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#08111f',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
});
