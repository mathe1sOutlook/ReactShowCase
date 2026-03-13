import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius, Spacing, Typography, neonShadow} from '../../theme';

// ─── DemoCard wrapper (same pattern as other showcases) ─────────────────────

type DemoCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function DemoCard({eyebrow, title, description, children}: DemoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children}
    </View>
  );
}

// ─── 1. Avatar ──────────────────────────────────────────────────────────────

type AvatarSize = 'sm' | 'md' | 'lg';
type StatusColor = 'online' | 'busy' | 'away' | 'offline';

const AVATAR_SIZES: Record<AvatarSize, number> = {sm: 36, md: 48, lg: 64};
const STATUS_COLORS: Record<StatusColor, string> = {
  online: Colors.success,
  busy: Colors.error,
  away: Colors.warning,
  offline: Colors.textMuted,
};

function Avatar({
  initials,
  icon,
  size = 'md',
  bg = Colors.primary,
  status,
}: {
  initials?: string;
  icon?: string;
  size?: AvatarSize;
  bg?: string;
  status?: StatusColor;
}) {
  const s = AVATAR_SIZES[size];
  const fontSize = s * 0.38;
  const badgeSize = s * 0.28;

  return (
    <View style={{width: s, height: s}}>
      <View
        style={[
          styles.avatarCircle,
          {width: s, height: s, borderRadius: s / 2, backgroundColor: bg + '30'},
        ]}>
        <Text style={{fontSize, color: bg, fontWeight: '700'}}>
          {icon || initials || '?'}
        </Text>
      </View>
      {status && (
        <View
          style={[
            styles.statusBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: STATUS_COLORS[status],
              borderWidth: 2,
              borderColor: Colors.bgCard,
            },
          ]}
        />
      )}
    </View>
  );
}

function AvatarDemo() {
  return (
    <DemoCard
      eyebrow="AVATAR"
      title="User Avatars"
      description="Initials, icons, sizes, and online status badges.">
      <View style={styles.row}>
        <Avatar initials="MC" size="sm" bg={Colors.primary} status="online" />
        <Avatar initials="JD" size="md" bg={Colors.secondary} status="busy" />
        <Avatar icon={'\u{1F9D1}'} size="md" bg={Colors.accent} status="away" />
        <Avatar initials="AB" size="lg" bg={Colors.success} status="offline" />
        <Avatar icon={'\u2B50'} size="lg" bg={Colors.warning} />
      </View>
    </DemoCard>
  );
}

// ─── 2. Badge / Counter ─────────────────────────────────────────────────────

function BadgeDemo() {
  const [count, setCount] = useState(5);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bump = (delta: number) => {
    setCount(c => Math.max(0, c + delta));
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <DemoCard
      eyebrow="BADGE"
      title="Badges & Counters"
      description="Notification dots, numeric counters, and status labels.">
      <View style={styles.row}>
        {/* Dot badge */}
        <View style={styles.badgeHost}>
          <Text style={styles.badgeIcon}>{'\u{1F514}'}</Text>
          <View style={[styles.dotBadge, {backgroundColor: Colors.error}]} />
        </View>

        {/* Numeric badge */}
        <Pressable onPress={() => bump(1)} style={styles.badgeHost}>
          <Text style={styles.badgeIcon}>{'\u{1F4E9}'}</Text>
          <Animated.View
            style={[styles.numericBadge, {transform: [{scale: scaleAnim}]}]}>
            <Text style={styles.numericBadgeText}>{count}</Text>
          </Animated.View>
        </Pressable>

        {/* Label badges */}
        <View style={[styles.labelBadge, {backgroundColor: Colors.success + '25'}]}>
          <Text style={[styles.labelBadgeText, {color: Colors.success}]}>Active</Text>
        </View>
        <View style={[styles.labelBadge, {backgroundColor: Colors.warning + '25'}]}>
          <Text style={[styles.labelBadgeText, {color: Colors.warning}]}>Pending</Text>
        </View>
        <View style={[styles.labelBadge, {backgroundColor: Colors.error + '25'}]}>
          <Text style={[styles.labelBadgeText, {color: Colors.error}]}>Critical</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => bump(-1)} style={styles.miniBtn}>
          <Text style={styles.miniBtnText}>- 1</Text>
        </Pressable>
        <Pressable onPress={() => bump(1)} style={styles.miniBtn}>
          <Text style={styles.miniBtnText}>+ 1</Text>
        </Pressable>
      </View>
    </DemoCard>
  );
}

// ─── 3. Card Variations ─────────────────────────────────────────────────────

function ExpandableCard() {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [expanded, heightAnim]);

  const bodyHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });
  const bodyOpacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.variationCard}>
      <View style={[styles.variationCardBar, {backgroundColor: Colors.accent}]} />
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.variationRow}>
          <View style={{flex: 1}}>
            <Text style={styles.variationLabel}>Expandable Card</Text>
            <Text style={styles.variationSub}>Tap to {expanded ? 'collapse' : 'expand'}</Text>
          </View>
          <Text style={styles.chevron}>{expanded ? '\u25B2' : '\u25BC'}</Text>
        </View>
      </Pressable>
      <Animated.View style={{height: bodyHeight, opacity: bodyOpacity, overflow: 'hidden'}}>
        <Text style={styles.variationBody}>
          This card reveals additional content when tapped. Useful for FAQs, settings groups, or detail sections that should stay out of the way.
        </Text>
      </Animated.View>
    </View>
  );
}

function CardVariationsDemo() {
  return (
    <DemoCard
      eyebrow="CARDS"
      title="Card Variations"
      description="Simple, with image area, action buttons, and expandable.">
      {/* Simple Card */}
      <View style={styles.variationCard}>
        <Text style={styles.variationLabel}>Simple Card</Text>
        <Text style={styles.variationSub}>
          A minimal container for grouping related content.
        </Text>
      </View>

      {/* Card with image area */}
      <View style={styles.variationCard}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>{'\u{1F5BC}\uFE0F'} Image Area</Text>
        </View>
        <Text style={styles.variationLabel}>Media Card</Text>
        <Text style={styles.variationSub}>Card with a top image region for rich previews.</Text>
      </View>

      {/* Card with actions */}
      <View style={styles.variationCard}>
        <Text style={styles.variationLabel}>Action Card</Text>
        <Text style={styles.variationSub}>Interactive buttons for quick actions.</Text>
        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, {backgroundColor: Colors.primary + '20'}]}>
            <Text style={[styles.actionBtnText, {color: Colors.primary}]}>Share</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, {backgroundColor: Colors.accent + '20'}]}>
            <Text style={[styles.actionBtnText, {color: Colors.accent}]}>Save</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, {backgroundColor: Colors.error + '20'}]}>
            <Text style={[styles.actionBtnText, {color: Colors.error}]}>Delete</Text>
          </Pressable>
        </View>
      </View>

      {/* Expandable */}
      <ExpandableCard />
    </DemoCard>
  );
}

// ─── 4. List Items ──────────────────────────────────────────────────────────

const LIST_ITEMS = [
  {icon: '\u{1F4C1}', title: 'Project Files', subtitle: '24 items \u2022 2.4 GB', color: Colors.primary, action: '\u27A1'},
  {icon: '\u{1F512}', title: 'Security Settings', subtitle: 'Last updated 3h ago', color: Colors.warning, action: '\u2699\uFE0F'},
  {icon: '\u{1F4CA}', title: 'Analytics Report', subtitle: 'Q4 2025 — Ready', color: Colors.success, action: '\u{1F4E5}'},
  {icon: '\u{1F6A8}', title: 'Critical Alert', subtitle: 'Disk usage at 92%', color: Colors.error, action: '\u26A0\uFE0F'},
];

function ListItemDemo() {
  return (
    <DemoCard
      eyebrow="LIST ITEM"
      title="List Items"
      description="Rich list rows with icon, subtitle, and trailing action.">
      <View style={styles.listContainer}>
        {LIST_ITEMS.map((item, idx) => (
          <Pressable key={idx} style={styles.listItem}>
            <View style={[styles.listIcon, {backgroundColor: item.color + '20'}]}>
              <Text style={{fontSize: 18}}>{item.icon}</Text>
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.listAction}>{item.action}</Text>
          </Pressable>
        ))}
      </View>
    </DemoCard>
  );
}

// ─── 5. Accordion ───────────────────────────────────────────────────────────

const ACCORDION_ITEMS = [
  {title: 'What technologies are used?', body: 'React Native 0.84.1 with TypeScript, React Navigation 7, and the Animated API for all motion.'},
  {title: 'Is this production-ready?', body: 'This showcase demonstrates capabilities. Production apps would add testing, error boundaries, and CI/CD.'},
  {title: 'Can I customize the theme?', body: 'Yes! The centralized theme system (colors, typography, spacing) makes global changes trivial.'},
];

function AccordionItem({title, body}: {title: string; body: string}) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 250,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [open, anim]);

  const bodyHeight = anim.interpolate({inputRange: [0, 1], outputRange: [0, 70]});
  const bodyOpacity = anim.interpolate({inputRange: [0, 0.4, 1], outputRange: [0, 0, 1]});
  const rotate = anim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});

  return (
    <View style={styles.accordionItem}>
      <Pressable style={styles.accordionHeader} onPress={() => setOpen(!open)}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Animated.Text style={[styles.accordionChevron, {transform: [{rotate}]}]}>
          {'\u25BC'}
        </Animated.Text>
      </Pressable>
      <Animated.View style={{height: bodyHeight, opacity: bodyOpacity, overflow: 'hidden'}}>
        <Text style={styles.accordionBody}>{body}</Text>
      </Animated.View>
    </View>
  );
}

function AccordionDemo() {
  return (
    <DemoCard
      eyebrow="ACCORDION"
      title="Expandable Sections"
      description="Collapsible FAQ-style content with animated reveal.">
      {ACCORDION_ITEMS.map((item, i) => (
        <AccordionItem key={i} title={item.title} body={item.body} />
      ))}
    </DemoCard>
  );
}

// ─── 6. Timeline ────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  {title: 'Project Kickoff', time: 'Jan 15', color: Colors.success, done: true},
  {title: 'Design Approved', time: 'Feb 02', color: Colors.success, done: true},
  {title: 'Development', time: 'Mar 10', color: Colors.primary, done: true},
  {title: 'QA Testing', time: 'In progress', color: Colors.warning, done: false},
  {title: 'Release', time: 'Pending', color: Colors.textMuted, done: false},
];

function TimelineDemo() {
  return (
    <DemoCard
      eyebrow="TIMELINE"
      title="Vertical Timeline"
      description="Step-by-step progress with status indicators.">
      <View style={styles.timelineContainer}>
        {TIMELINE_STEPS.map((step, i) => (
          <View key={i} style={styles.timelineRow}>
            {/* Vertical line */}
            {i < TIMELINE_STEPS.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  {backgroundColor: step.done ? step.color + '50' : Colors.border},
                ]}
              />
            )}
            {/* Dot */}
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: step.done ? step.color : 'transparent',
                  borderColor: step.color,
                },
              ]}>
              {step.done && <Text style={styles.timelineCheck}>{'\u2713'}</Text>}
            </View>
            {/* Content */}
            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineTitle,
                  !step.done && {color: Colors.textMuted},
                ]}>
                {step.title}
              </Text>
              <Text style={styles.timelineTime}>{step.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </DemoCard>
  );
}

// ─── 7. Stat / KPI Cards ───────────────────────────────────────────────────

const KPI_DATA = [
  {label: 'Users', value: '12.4k', delta: '+18%', deltaColor: Colors.success, icon: '\u{1F465}'},
  {label: 'Revenue', value: '$84k', delta: '+7.2%', deltaColor: Colors.success, icon: '\u{1F4B0}'},
  {label: 'Errors', value: '23', delta: '-42%', deltaColor: Colors.primary, icon: '\u{1F41B}'},
  {label: 'Latency', value: '142ms', delta: '+5ms', deltaColor: Colors.warning, icon: '\u26A1'},
];

function StatCardDemo() {
  const fadeAnims = useRef(KPI_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    KPI_DATA.forEach((_, i) => {
      Animated.timing(fadeAnims[i], {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnims]);

  return (
    <DemoCard
      eyebrow="KPI"
      title="Stat Cards"
      description="Key metrics with delta indicators and staggered entry.">
      <View style={styles.kpiGrid}>
        {KPI_DATA.map((kpi, i) => (
          <Animated.View
            key={i}
            style={[
              styles.kpiCard,
              {
                opacity: fadeAnims[i],
                transform: [
                  {
                    translateY: fadeAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.kpiIcon}>{kpi.icon}</Text>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <View style={[styles.kpiDelta, {backgroundColor: kpi.deltaColor + '20'}]}>
              <Text style={[styles.kpiDeltaText, {color: kpi.deltaColor}]}>
                {kpi.delta}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </DemoCard>
  );
}

// ─── 8. Empty State ─────────────────────────────────────────────────────────

function EmptyStateDemo() {
  return (
    <DemoCard
      eyebrow="EMPTY STATE"
      title="No Data Placeholder"
      description="Friendly illustration and message when a list is empty.">
      <View style={styles.emptyState}>
        <Text style={styles.emptyIllustration}>{'\u{1F4ED}'}</Text>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>
          When you receive new messages, they will appear here.
        </Text>
        <Pressable style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>Compose Message</Text>
        </Pressable>
      </View>
    </DemoCard>
  );
}

// ─── 9. Error State ─────────────────────────────────────────────────────────

function ErrorStateDemo() {
  const [retrying, setRetrying] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleRetry = () => {
    setRetrying(true);
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setRetrying(false));
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <DemoCard
      eyebrow="ERROR STATE"
      title="Something Went Wrong"
      description="Error display with a retry action and spinner feedback.">
      <View style={styles.errorState}>
        <Text style={styles.errorIllustration}>{'\u26A0\uFE0F'}</Text>
        <Text style={styles.errorTitle}>Failed to load data</Text>
        <Text style={styles.errorSubtitle}>
          Please check your connection and try again.
        </Text>
        <Pressable
          style={[styles.retryBtn, retrying && styles.retryBtnDisabled]}
          onPress={handleRetry}
          disabled={retrying}>
          {retrying ? (
            <Animated.Text style={[styles.retrySpinner, {transform: [{rotate: spin}]}]}>
              {'\u21BB'}
            </Animated.Text>
          ) : (
            <Text style={styles.retryBtnText}>Retry</Text>
          )}
        </Pressable>
      </View>
    </DemoCard>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function DataDisplayShowcase() {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionBadge}>1.5</Text>
        <Text style={styles.sectionTitle}>Data Display</Text>
      </View>
      <AvatarDemo />
      <BadgeDemo />
      <CardVariationsDemo />
      <ListItemDemo />
      <AccordionDemo />
      <TimelineDemo />
      <StatCardDemo />
      <EmptyStateDemo />
      <ErrorStateDemo />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {gap: Spacing.lg},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionBadge: {
    backgroundColor: Colors.accent + '25',
    color: Colors.accent,
    ...Typography.label,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },

  // DemoCard
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {...Typography.label, color: Colors.primary},
  cardTitle: {...Typography.h3, color: Colors.textPrimary},
  cardDescription: {...Typography.bodySmall, color: Colors.textSecondary},

  // Layout helpers
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
  },

  // Avatar
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  // Badge
  badgeHost: {position: 'relative', padding: 4},
  badgeIcon: {fontSize: 28},
  dotBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  numericBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  numericBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  labelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  labelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Card Variations
  variationCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  variationCardBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  variationSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  variationBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  imagePlaceholder: {
    height: 80,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  imagePlaceholderText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // List Items
  listContainer: {gap: Spacing.sm},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {flex: 1},
  listTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  listSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  listAction: {fontSize: 16},

  // Accordion
  accordionItem: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  accordionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 14,
  },
  accordionChevron: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  accordionBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    lineHeight: 18,
  },

  // Timeline
  timelineContainer: {gap: 0},
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: Spacing.lg,
    paddingLeft: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 24,
    bottom: 0,
    width: 2,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  timelineCheck: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  timelineContent: {flex: 1},
  timelineTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  timelineTime: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
  },
  kpiIcon: {fontSize: 22},
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  kpiLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  kpiDelta: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 2,
  },
  kpiDeltaText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIllustration: {fontSize: 48},
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyAction: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  emptyActionText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Error State
  errorState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  errorIllustration: {fontSize: 48},
  errorTitle: {
    ...Typography.h4,
    color: Colors.error,
  },
  errorSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  retryBtn: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  retryBtnDisabled: {opacity: 0.6},
  retryBtnText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
  retrySpinner: {
    color: Colors.error,
    fontSize: 18,
  },
});
