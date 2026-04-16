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
import {Colors, Spacing} from '../theme';
import type {HomeStackParamList, ScreenCategory} from '../navigation/types';
import {showcaseRegistry} from '../navigation/showcaseRegistry';
import {getHomeGridMetrics} from '../utils/layout';
import IconSymbol, {type IconName} from '../components/common/IconSymbol';
import StateBlock from '../components/common/StateBlock';

const CARD_MARGIN = Spacing.md;

type Nav = NativeStackNavigationProp<HomeStackParamList>;

function StatusBadge({
  label,
  tone,
  containerStyle,
  pulse = false,
}: {
  label: string;
  tone: string;
  containerStyle: object;
  pulse?: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!pulse) {
      pulseAnim.setValue(1);
      return;
    }

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
  }, [pulse, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.statusBadge,
        containerStyle,
        {backgroundColor: `${tone}33`, opacity: pulseAnim},
      ]}>
      <Text style={[styles.statusBadgeText, {color: tone}]}>{label}</Text>
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
        onPress={() => navigation.navigate(item.routeKey)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.demoCount} demos, ${item.status}`}
        accessibilityHint={`Open the ${item.title} showcase`}>
        <View style={[styles.cardAccent, {backgroundColor: item.color}]} />
        <View style={[styles.cardGlow, {backgroundColor: item.color}]} />
        {'isNew' in item && item.isNew ? (
          <StatusBadge
            label="NEW"
            tone={Colors.success}
            containerStyle={styles.newBadge}
            pulse
          />
        ) : null}
        {item.status === 'lab' ? (
          <StatusBadge
            label="LAB"
            tone={Colors.warning}
            containerStyle={styles.labBadge}
          />
        ) : null}
        <View
          style={[
            styles.cardIcon,
            {
              borderColor: `${item.color}28`,
              backgroundColor: `${item.color}14`,
            },
          ]}>
          <IconSymbol name={item.icon as IconName} size={22} color={item.color} />
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

  const filteredCategories = showcaseRegistry.filter(cat => {
    if (!searchText.trim()) {
      return true;
    }
    const query = searchText.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.subtitle.toLowerCase().includes(query)
    );
  });
  const readyCategories = filteredCategories.filter(
    cat => cat.status === 'ready',
  );
  const labCategories = filteredCategories.filter(cat => cat.status === 'lab');

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
        {filteredCategories.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                EXPLORE DEMOS
              </Text>
              <Text style={styles.sectionSubtitle}>
                Ready-to-demo Android features curated for the main walkthrough
              </Text>
            </View>
            <View style={styles.grid}>
              {readyCategories.map((cat, i) => (
                <CategoryCard
                  key={cat.routeKey}
                  item={cat}
                  index={i}
                  cardWidth={cardWidth}
                />
              ))}
            </View>
            {labCategories.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle} accessibilityRole="header">
                    LAB PREVIEWS
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Broader experiments kept visible with explicit lab labeling
                  </Text>
                </View>
                <View style={styles.grid}>
                  {labCategories.map((cat, i) => (
                    <CategoryCard
                      key={cat.routeKey}
                      item={cat}
                      index={readyCategories.length + i}
                      cardWidth={cardWidth}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.grid}>
            <StateBlock
              variant="empty"
              title="No demos match this search"
              description="Try a broader term or clear the search field to see the curated Android showcase."
              actionLabel="Clear search"
              onAction={() => setSearchText('')}
              style={styles.emptySearch}
              iconName="search"
            />
          </View>
        )}
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

  // Status badges
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 3,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  labBadge: {
    position: 'absolute',
    top: 8,
    left: 12,
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
