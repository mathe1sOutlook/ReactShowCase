import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Neon, Spacing} from '../theme';
import type {HomeStackParamList, ScreenCategory} from '../navigation/types';
import {getHomeGridMetrics} from '../utils/layout';
import IconSymbol, {type IconName} from '../components/common/IconSymbol';
import StateBlock from '../components/common/StateBlock';

const CARD_MARGIN = Spacing.md;

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORIES: ScreenCategory[] = [
  {
    key: 'Layouts',
    title: 'Layouts',
    subtitle: 'Flexbox, responsive grid, masonry & safe area',
    icon: '\u25A6',
    color: Colors.success,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'Lists',
    title: 'Lists & Scroll',
    subtitle: 'FlatList, sticky sections, snap, parallax & refresh',
    icon: '\u2630',
    color: Colors.primary,
    demoCount: 10,
    isNew: true,
  },
  {
    key: 'Navigation',
    title: 'Navigation',
    subtitle: 'Swipe tabs, drawer, sheet routes & dots',
    icon: '\u21F2',
    color: Colors.accent,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'Animations',
    title: 'Animations',
    subtitle: 'Spring, bounce, fade, shimmer & interactive',
    icon: '\u2728',
    color: Colors.secondary,
    demoCount: 15,
  },
  {
    key: 'Canvas',
    title: 'Canvas 2D',
    subtitle: 'Drawing, text, shapes, export & snap grid',
    icon: '\u{1F3A8}',
    color: Colors.orange,
    demoCount: 10,
  },
  {
    key: 'ThreeD',
    title: '3D Transforms',
    subtitle: 'OBJ parser, sphere shading, lighting & shader surface',
    icon: '\u{1F4A0}',
    color: Colors.accent,
    demoCount: 7,
  },
  {
    key: 'Charts',
    title: 'Charts & Data',
    subtitle: 'Realtime analytics, treemap, funnel, radar & finance views',
    icon: '\u{1F4CA}',
    color: Colors.warning,
    demoCount: 17,
  },
  {
    key: 'Svg',
    title: 'SVG & Vector',
    subtitle: 'Morphing, path draw, animated icons & pure SVG charts',
    icon: '\u25C8',
    color: Colors.primary,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'DataGrid',
    title: 'DataGrid',
    subtitle: 'Frozen columns, filters, edit, export & 10k-row virtualization',
    icon: '\u25A4',
    color: Colors.success,
    demoCount: 26,
    isNew: true,
  },
  {
    key: 'Media',
    title: 'Camera & Photos',
    subtitle: 'Live preview, capture, gallery, zoom, crop and filters',
    icon: '\u{1F4F7}',
    color: Colors.orange,
    demoCount: 10,
    isNew: true,
  },
  {
    key: 'Audio',
    title: 'Audio',
    subtitle: 'Record, visualize waveform, play, seek and manage clips',
    icon: '\u{1F3A4}',
    color: Colors.secondary,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'Video',
    title: 'Video',
    subtitle: 'Player controls, seek, fullscreen, PiP and generated thumbnails',
    icon: '\u{1F3AC}',
    color: Colors.primary,
    demoCount: 5,
    isNew: true,
  },
  {
    key: 'Files',
    title: 'Files & Documents',
    subtitle: 'Picker, PDF reader, search, cache, share and image previews',
    icon: '\u{1F4C1}',
    color: Colors.warning,
    demoCount: 10,
    isNew: true,
  },
  {
    key: 'Platform',
    title: 'Device & System',
    subtitle: 'Sensors, Material You, shortcuts, PiP, channels and runtime APIs',
    icon: '\u{1F4F1}',
    color: Colors.warning,
    demoCount: 38,
    isNew: true,
  },
  {
    key: 'Web',
    title: 'WebView & Browser',
    subtitle: 'Custom URLs, bridge messaging, JS injection and special link handling',
    icon: '\u{1F310}',
    color: Colors.primary,
    demoCount: 7,
    isNew: true,
  },
  {
    key: 'Network',
    title: 'Networking & APIs',
    subtitle: 'REST, GraphQL, WebSocket, cache, retries and transfer progress',
    icon: '\u{1F4E1}',
    color: Colors.success,
    demoCount: 10,
    isNew: true,
  },
  {
    key: 'Storage',
    title: 'Local Storage',
    subtitle: 'AsyncStorage, SQLite-style data, MMKV-style hot store, vault and cache',
    icon: '\u{1F5C3}\uFE0F',
    color: Colors.accent,
    demoCount: 5,
    isNew: true,
  },
  {
    key: 'Maps',
    title: 'Maps & Geospatial',
    subtitle: 'Interactive map, route, geofence, geocoding, clustering and styles',
    icon: '\u{1F5FA}\uFE0F',
    color: Colors.success,
    demoCount: 8,
    isNew: true,
  },
  {
    key: 'Auth',
    title: 'Auth Demo',
    subtitle: 'Login, signup, biometrics, PIN lock, social providers and 2FA',
    icon: '\u{1F512}',
    color: Colors.secondary,
    demoCount: 7,
    isNew: true,
  },
  {
    key: 'Themes',
    title: 'Themes & Appearance',
    subtitle: 'Dark, light, system sync, custom palettes, font scale and contrast',
    icon: '\u25D0',
    color: Colors.primary,
    demoCount: 8,
    isNew: true,
  },
  {
    key: 'Codes',
    title: 'QR & Barcode',
    subtitle: 'Camera-style scanning, QR generation, barcode formats and history',
    icon: '\u29C9',
    color: Colors.warning,
    demoCount: 5,
    isNew: true,
  },
  {
    key: 'Utilities',
    title: 'Advanced Utilities',
    subtitle: 'Calendar, drag-and-drop, markdown, timers, flows and dashboard demos',
    icon: '\u2699',
    color: Colors.success,
    demoCount: 20,
    isNew: true,
  },
  {
    key: 'Particles',
    title: 'Particles',
    subtitle: 'Floating neon particle system',
    icon: '\u{1F30C}',
    color: Colors.orange,
    demoCount: 1,
    isNew: true,
  },
  {
    key: 'Colors',
    title: 'Color Picker',
    subtitle: 'HSL palette with 120+ swatches',
    icon: '\u{1F308}',
    color: Colors.pink,
    demoCount: 1,
    isNew: true,
  },
  {
    key: 'Reanimated',
    title: 'Reanimated',
    subtitle: 'Worklets, shared values & UI thread animations',
    icon: '\u26A1',
    color: Colors.warning,
    demoCount: 7,
    isNew: true,
  },
];

function getScreenIconName(key: ScreenCategory['key']) {
  const icons: Record<ScreenCategory['key'], IconName> = {
    Layouts: 'layout',
    Lists: 'list',
    Navigation: 'navigation',
    Animations: 'spark',
    Canvas: 'canvas',
    ThreeD: 'cube',
    Charts: 'chart',
    Svg: 'vector',
    DataGrid: 'table',
    Media: 'camera',
    Audio: 'audio',
    Video: 'video',
    Files: 'file',
    Platform: 'device',
    Web: 'browser',
    Network: 'network',
    Storage: 'storage',
    Maps: 'map',
    Auth: 'lock',
    Themes: 'theme',
    Codes: 'code',
    Utilities: 'tools',
    Particles: 'particles',
    Colors: 'palette',
    Reanimated: 'bolt',
    Home: 'home',
  };

  return icons[key];
}

function NewBadge() {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.newBadge, {opacity: pulseAnim}]}>
      <Text style={styles.newBadgeText}>NEW</Text>
    </Animated.View>
  );
}

function CategoryCard({
  item,
  index,
  cardWidth,
}: {
  item: ScreenCategory;
  index: number;
  cardWidth: number;
}) {
  const navigation = useNavigation<Nav>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          width: cardWidth,
          opacity: scaleAnim,
          transform: [
            {scale: Animated.multiply(scaleAnim, pressAnim)},
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}>
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate(item.key as never)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.demoCount} demos`}
        accessibilityHint={`Open the ${item.title} showcase`}>
        <View style={[styles.cardAccent, {backgroundColor: item.color}]} />
        <View style={[styles.cardGlow, {backgroundColor: item.color}]} />
        {item.isNew && <NewBadge />}
        <View style={[styles.cardIcon, {borderColor: `${item.color}28`, backgroundColor: `${item.color}14`}]}>
          <IconSymbol
            name={getScreenIconName(item.key)}
            size={22}
            color={item.color}
          />
        </View>
        <Text style={[styles.cardTitle, {color: item.color}]}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.demoBadge, {backgroundColor: item.color + '25'}]}>
            <Text style={[styles.demoBadgeText, {color: item.color}]}>
              {item.demoCount} demos
            </Text>
          </View>
          <Text style={styles.cardArrow}>{'\u2192'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function HeroHeader() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    );

    pulseLoop.start();

    Animated.spring(titleAnim, {
      toValue: 1,
      friction: 5,
      tension: 30,
      useNativeDriver: true,
    }).start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim, titleAnim]);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.primary, Colors.secondary, Colors.primary],
  });

  return (
    <Animated.View style={[styles.hero, {backgroundColor: bgColor}]}>
      <View style={styles.heroOverlay} />
      <Animated.View
        style={[
          styles.heroContent,
          {
            opacity: titleAnim,
            transform: [
              {
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.heroIcon}>
          <IconSymbol name="spark" size={30} color={Colors.white} />
        </View>
        <Text style={styles.heroTitle}>React Native</Text>
        <Text style={styles.heroSubtitle}>Android ShowCase</Text>
        <View style={styles.heroDivider} />
        <Text style={styles.heroVersion}>
          RN 0.84 {'\u2022'} Full Feature Demo
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <View style={styles.searchIcon}>
          <IconSymbol name="search" size={18} color={Colors.textMuted} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search demos..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          selectionColor={Colors.primary}
          accessibilityLabel="Search demos"
          accessibilityHint="Filters showcase categories by name or description"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Removes the current search text">
            <IconSymbol name="close" size={15} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const {width} = useWindowDimensions();
  const {cardWidth} = getHomeGridMetrics(width);

  const filteredCategories = CATEGORIES.filter(cat => {
    if (!searchText.trim()) {
      return true;
    }
    const query = searchText.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.subtitle.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <HeroHeader />
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            EXPLORE DEMOS
          </Text>
          <Text style={styles.sectionSubtitle}>
            Tap any category to see it in action
          </Text>
        </View>
        <View style={styles.grid}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, i) => (
              <CategoryCard
                key={cat.key}
                item={cat}
                index={i}
                cardWidth={cardWidth}
              />
            ))
          ) : (
            <StateBlock
              variant="empty"
              title="No demos match this search"
              description="Try a broader term or clear the search field to see the full showcase grid."
              actionLabel="Clear search"
              onAction={() => setSearchText('')}
              style={styles.emptySearch}
              iconName="search"
            />
          )}
        </View>
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Built with React Native {'\u2022'} Pure Animated API
          </Text>
          <Text style={styles.footerSubText}>
            Tap a category to explore {'\u2022'} Android Optimized
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Hero Header
  hero: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: StatusBar.currentHeight || 40,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 4,
    fontWeight: '300',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroDivider: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 12,
    borderRadius: 1,
  },
  heroVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: CARD_MARGIN,
  },
  emptySearch: {
    width: '100%',
    marginTop: Spacing.sm,
  },

  // Card
  cardOuter: {
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    minHeight: 170,
    justifyContent: 'space-between',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.08,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardArrow: {
    fontSize: 16,
    color: Colors.textMuted,
  },

  // NEW Badge
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success + '33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 3,
  },
  newBadgeText: {
    color: Colors.success,
    fontSize: 8,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
