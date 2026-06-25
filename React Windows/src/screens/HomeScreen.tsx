import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Radius, Spacing} from '../theme';
import type {HomeStackParamList} from '../navigation/types';
import {
  showcaseRegistry,
  type ShowcaseScreenMeta,
} from '../navigation/showcaseRegistry';
import {getHomeGridMetrics} from '../utils/layout';
import IconSymbol from '../components/common/IconSymbol';
import StateBlock from '../components/common/StateBlock';

const CARD_MARGIN = Spacing.md;

type Nav = NativeStackNavigationProp<HomeStackParamList>;

function CardBadge({
  label,
  backgroundColor,
  textColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
}) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
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
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.badge, {opacity: pulseAnim, backgroundColor}]}>
      <Text style={[styles.badgeText, {color: textColor}]}>{label}</Text>
    </Animated.View>
  );
}

function CategoryCard({
  item,
  index,
  cardWidth,
}: {
  item: ShowcaseScreenMeta;
  index: number;
  cardWidth: number;
}) {
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
  }, [fadeAnim, index, slideAnim]);

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
          width: cardWidth,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}, {scale: pressAnim}],
        },
      ]}>
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate(item.routeKey)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.demoCount} demos`}
        accessibilityHint={
          item.status === 'lab'
            ? `Open the experimental ${item.title} showcase`
            : `Open the ${item.title} showcase`
        }>
        <View style={[styles.cardColorBar, {backgroundColor: item.color}]} />
        {item.status === 'lab' ? (
          <CardBadge
            label="LAB"
            backgroundColor={Colors.warning + '22'}
            textColor={Colors.warning}
          />
        ) : 'isNew' in item && item.isNew ? (
          <CardBadge
            label="NEW"
            backgroundColor={Colors.primary + '26'}
            textColor={Colors.primary}
          />
        ) : null}
        <View
          style={[
            styles.cardIcon,
            {
              borderColor: `${item.color}24`,
              backgroundColor: `${item.color}12`,
            },
          ]}>
          <IconSymbol name={item.icon} size={22} color={item.color} />
        </View>
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
    const pulseLoop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    );

    pulseLoop.start();

    Animated.parallel([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      pulseLoop.stop();
    };
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
        <View style={styles.heroLogo}>
          <IconSymbol name="spark" size={28} color={Colors.white} />
        </View>
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

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <HeroHeader />

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}>
              <IconSymbol name="search" size={18} color={Colors.textMuted} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search demos..."
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              accessibilityLabel="Search demos"
              accessibilityHint="Filters showcase categories by name or description"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable
                onPress={() => setSearchText('')}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                accessibilityHint="Removes the current search text">
                <IconSymbol name="close" size={15} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Explore Demos
          </Text>
          <Text style={styles.sectionSubtitle}>
            Click any category to see it in action. LAB badges mark flows that
            still need native validation.
          </Text>
        </View>
        <View style={styles.grid}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, index) => (
              <CategoryCard
                key={cat.routeKey}
                item={cat}
                index={index}
                cardWidth={cardWidth}
              />
            ))
          ) : (
            <StateBlock
              variant="empty"
              title="No demos match this search"
              description="Try a broader term or clear the search field to restore the full desktop showcase grid."
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
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    height: '100%',
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: CARD_MARGIN,
  },
  emptySearch: {
    width: '100%',
  },
  cardOuter: {},
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
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '600',
  },
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
