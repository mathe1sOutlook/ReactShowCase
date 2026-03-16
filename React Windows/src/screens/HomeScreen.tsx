import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Spacing, Radius} from '../theme';
import type {HomeStackParamList, ScreenCategory} from '../navigation/types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_MARGIN = Spacing.md;
const NUM_COLS = SCREEN_WIDTH > 800 ? 3 : 2;
const CARD_WIDTH =
  (SCREEN_WIDTH - Spacing.xl * 2 - CARD_MARGIN * (NUM_COLS - 1)) / NUM_COLS;

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORIES: ScreenCategory[] = [
  {
    key: 'Layouts',
    title: 'Layouts',
    subtitle: 'Flexbox, breakpoints, masonry & safe area',
    icon: '\u25A6',
    color: Colors.primary,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'Lists',
    title: 'Lists & Scroll',
    subtitle: 'FlatList, sticky sections, snap, parallax & refresh',
    icon: '\u2630',
    color: Colors.secondary,
    demoCount: 10,
    isNew: true,
  },
  {
    key: 'Navigation',
    title: 'Navigation',
    subtitle: 'Swipe tabs, drawer, sheet routes & dots',
    icon: '\u21F2',
    color: Colors.success,
    demoCount: 6,
    isNew: true,
  },
  {
    key: 'Animations',
    title: 'Animations',
    subtitle: 'Spring, shimmer, pulse & interactive controls',
    icon: '\u2728',
    color: Colors.primary,
    demoCount: 15,
  },
  {
    key: 'Canvas',
    title: 'Canvas 2D',
    subtitle: 'Drawing, text, shapes, export & snap grid',
    icon: '\u{1F3A8}',
    color: '#e74c3c',
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
    color: Colors.success,
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
    color: Colors.warning,
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
    subtitle: 'Sensors, Fluent shell, tray, taskbar, file system and desktop actions',
    icon: '\u{1F5A5}\uFE0F',
    color: '#9b59b6',
    demoCount: 41,
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
    color: Colors.primary,
    demoCount: 7,
    isNew: true,
  },
  {
    key: 'Themes',
    title: 'Themes & Appearance',
    subtitle: 'Dark, light, system sync, custom palettes, font scale and contrast',
    icon: '\u25D0',
    color: Colors.secondary,
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
    key: 'Widgets',
    title: 'Desktop Widgets',
    subtitle: 'Weather, stocks & calendar widgets',
    icon: '\u{1F4CB}',
    color: Colors.warning,
    demoCount: 3,
    isNew: true,
  },
  {
    key: 'WindowControls',
    title: 'Window & Grid',
    subtitle: 'Title bar, controls & responsive grid',
    icon: '\u2B1C',
    color: Colors.primaryDark,
    demoCount: 3,
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

function NewBadge() {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.newBadge, {opacity: pulseAnim}]}>
      <Text style={styles.newBadgeText}>NEW</Text>
    </Animated.View>
  );
}

function CategoryCard({item, index}: {item: ScreenCategory; index: number}) {
  const navigation = useNavigation<Nav>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
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
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}, {scale: pressAnim}],
        },
      ]}>
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate(item.key as never)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <View style={[styles.cardColorBar, {backgroundColor: item.color}]} />
        {item.isNew && <NewBadge />}
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.demoBadge, {backgroundColor: item.color + '15'}]}>
            <Text style={[styles.demoBadgeText, {color: item.color}]}>
              {item.demoCount} demos
            </Text>
          </View>
          <Text style={[styles.cardArrow, {color: item.color}]}>{'\u2192'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function HeroHeader() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    ).start();

    Animated.parallel([
      Animated.timing(titleFade, {toValue: 1, duration: 800, useNativeDriver: true}),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim, titleFade, titleSlide]);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.primary, Colors.primaryDark, Colors.primary],
  });

  return (
    <Animated.View style={[styles.hero, {backgroundColor: bgColor}]}>
      <View style={styles.heroBlob1} />
      <View style={styles.heroBlob2} />
      <Animated.View
        style={[
          styles.heroContent,
          {opacity: titleFade, transform: [{translateY: titleSlide}]},
        ]}>
        <Text style={styles.heroLogo}>{'\u2B22'}</Text>
        <Text style={styles.heroTitle}>React Native</Text>
        <Text style={styles.heroSubtitle}>Windows Desktop ShowCase</Text>
        <View style={styles.heroDivider} />
        <Text style={styles.heroVersion}>
          RN Windows 0.75 {'\u2022'} Fluent Design
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

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
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <HeroHeader />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search demos..."
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable
                onPress={() => setSearchText('')}
                style={styles.clearButton}>
                <Text style={styles.clearButtonText}>{'\u2715'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Demos</Text>
          <Text style={styles.sectionSubtitle}>
            Click any category to see it in action
          </Text>
        </View>
        <View style={styles.grid}>
          {filteredCategories.map((cat, i) => (
            <CategoryCard key={cat.key} item={cat} index={i} />
          ))}
        </View>
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Built with React Native for Windows {'\u2022'} Fluent Design
          </Text>
          <Text style={styles.footerSubText}>
            Click a category to explore the demos
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 60,
  },

  // Hero
  hero: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroBlob1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -50,
  },
  heroBlob2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -30,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroLogo: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
    letterSpacing: 1,
    marginTop: 4,
  },
  heroDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 12,
    borderRadius: 1,
  },
  heroVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
    height: '100%',
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Section
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
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
    paddingHorizontal: Spacing.xl,
    gap: CARD_MARGIN,
  },

  // Card
  cardOuter: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'space-between',
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardColorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  cardIcon: {
    fontSize: 26,
    marginBottom: Spacing.sm,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    fontWeight: '600',
  },
  cardArrow: {
    fontSize: 16,
    fontWeight: '500',
  },

  // NEW Badge
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary + '26',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 3,
  },
  newBadgeText: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.borderMedium,
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
