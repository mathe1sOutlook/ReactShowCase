import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius, Spacing, Typography, neonShadow} from '../../theme';

const FEEDBACK_ITEMS = [
  'Toast / Snackbar',
  'Alert dialog',
  'Confirmation dialog',
  'Bottom sheet',
  'Backdrop modal',
  'Popover',
  'Tooltip',
  'In-app banner',
  'Progress bar',
  'Circular progress',
  'Skeleton shimmer',
  'Pull to refresh',
];

const FEED_ITEMS = [
  {title: 'Release notes synced', detail: '4 items waiting for stakeholder review.'},
  {title: 'Assets validated', detail: '2 upload warnings still need confirmation.'},
  {title: 'Demo snapshots ready', detail: 'Fresh cards are available for the home carousel.'},
];

const PULL_THRESHOLD = 70;
const SHEET_HEIGHT = 344;

type ToastTone = 'success' | 'warning' | 'error' | 'info';
type ToastPosition = 'top' | 'center' | 'bottom';
type OverlayVariant = 'alert' | 'confirm' | 'frosted' | null;
type ButtonVariant = 'primary' | 'secondary';

type DemoCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type ChoiceChipProps = {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
};

type ActionButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress: () => void;
};

type ToneMeta = {
  label: string;
  title: string;
  description: string;
  color: string;
};

function toneSurface(color: string, alpha = '18') {
  return `${color}${alpha}`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getToneMeta(tone: ToastTone): ToneMeta {
  switch (tone) {
    case 'success':
      return {
        label: 'Success',
        title: 'Changes published',
        description: 'The latest component adjustments are ready for demo.',
        color: Colors.success,
      };
    case 'warning':
      return {
        label: 'Warning',
        title: 'Review required',
        description: 'A dependency or layout edge case still needs confirmation.',
        color: Colors.warning,
      };
    case 'error':
      return {
        label: 'Error',
        title: 'Sync failed',
        description: 'The operation stopped before all assets were uploaded.',
        color: Colors.error,
      };
    case 'info':
    default:
      return {
        label: 'Info',
        title: 'Preview updated',
        description: 'A fresh build is ready for client review and walkthrough.',
        color: Colors.primary,
      };
  }
}

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

function ChoiceChip({label, active, color = Colors.primary, onPress}: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        active && {borderColor: color, backgroundColor: toneSurface(color)},
      ]}>
      <Text style={[styles.choiceChipText, active && {color, fontWeight: '700'}]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({label, variant = 'primary', onPress}: ActionButtonProps) {
  const secondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Runs this feedback demo action"
      style={({pressed}) => [
        styles.actionButton,
        secondary && styles.actionButtonSecondary,
        pressed && styles.actionButtonPressed,
      ]}>
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryCard() {
  return (
    <DemoCard
      eyebrow="Phase 1.4 live"
      title="Feedback, overlays, and loading states"
      description="This section adds the feedback layer that the earlier phases were missing. Toasts, dialogs, sheets, banners, popovers, progress states, shimmer, and pull gestures now have working demos with core React Native APIs.">
      <View style={styles.statGrid}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>checklist items delivered</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>new dependencies added</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>1.4</Text>
          <Text style={styles.statLabel}>phase completed</Text>
        </View>
      </View>

      <View style={styles.checklistWrap}>
        {FEEDBACK_ITEMS.map(item => (
          <View key={item} style={styles.checklistChip}>
            <Text style={styles.checklistChipText}>{item}</Text>
          </View>
        ))}
      </View>
    </DemoCard>
  );
}

type TransientFeedbackCardProps = {
  selectedTone: ToastTone;
  selectedPosition: ToastPosition;
  bannerVisible: boolean;
  toast: {tone: ToastTone; position: ToastPosition} | null;
  toastAnimation: Animated.Value;
  onSelectTone: (tone: ToastTone) => void;
  onSelectPosition: (position: ToastPosition) => void;
  onTriggerToast: (position: ToastPosition) => void;
  onToggleBanner: () => void;
  onDismissBanner: () => void;
};

function TransientFeedbackCard({
  selectedTone,
  selectedPosition,
  bannerVisible,
  toast,
  toastAnimation,
  onSelectTone,
  onSelectPosition,
  onTriggerToast,
  onToggleBanner,
  onDismissBanner,
}: TransientFeedbackCardProps) {
  const activeTone = getToneMeta(selectedTone);
  const toastTone = getToneMeta(toast?.tone ?? selectedTone);

  return (
    <DemoCard
      eyebrow="Transient feedback"
      title="Toast, snackbar, and in-app banner"
      description="Choose a tone, vary the position, and trigger transient messages over a mocked content surface. The banner stays inline, while the toast behaves like a floating overlay and the snackbar pins to the bottom.">
      <View style={styles.choiceWrap}>
        {(['success', 'warning', 'error', 'info'] as ToastTone[]).map(tone => {
          const toneMeta = getToneMeta(tone);
          return (
            <ChoiceChip
              key={tone}
              active={selectedTone === tone}
              color={toneMeta.color}
              label={toneMeta.label}
              onPress={() => onSelectTone(tone)}
            />
          );
        })}
      </View>

      <View style={styles.choiceWrap}>
        {(['top', 'center', 'bottom'] as ToastPosition[]).map(position => (
          <ChoiceChip
            key={position}
            active={selectedPosition === position}
            color={activeTone.color}
            label={position}
            onPress={() => onSelectPosition(position)}
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <ActionButton label="Show toast" onPress={() => onTriggerToast(selectedPosition)} />
        <ActionButton
          label="Show snackbar"
          variant="secondary"
          onPress={() => onTriggerToast('bottom')}
        />
        <ActionButton
          label={bannerVisible ? 'Hide banner' : 'Show banner'}
          variant="secondary"
          onPress={onToggleBanner}
        />
      </View>

      <View style={styles.previewStage}>
        {bannerVisible ? (
          <View
            style={[
              styles.bannerCard,
              {borderColor: activeTone.color, backgroundColor: toneSurface(activeTone.color)},
            ]}>
            <View style={styles.bannerCopy}>
              <Text style={[styles.bannerTitle, {color: activeTone.color}]}>{activeTone.title}</Text>
              <Text style={styles.bannerText}>{activeTone.description}</Text>
            </View>
            <Pressable onPress={onDismissBanner} style={styles.dismissPill}>
              <Text style={styles.dismissPillText}>Dismiss</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.stageGrid}>
          <View style={styles.stageMetric}>
            <Text style={styles.stageMetricValue}>8</Text>
            <Text style={styles.stageMetricLabel}>active demos</Text>
          </View>
          <View style={styles.stageMetric}>
            <Text style={styles.stageMetricValue}>3</Text>
            <Text style={styles.stageMetricLabel}>pending reviews</Text>
          </View>
        </View>

        {toast ? (
          <Animated.View
            style={[
              styles.toastCard,
              toast.position === 'top' && {top: bannerVisible ? 84 : 18},
              toast.position === 'center' && {top: 92},
              toast.position === 'bottom' && {bottom: 18},
              {
                borderColor: toastTone.color,
                backgroundColor: toneSurface(toastTone.color, '14'),
                opacity: toastAnimation,
                transform: [
                  {
                    translateY: toastAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [toast.position === 'bottom' ? 26 : -14, 0],
                    }),
                  },
                  {
                    scale: toastAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.toastHeader}>
              <Text style={[styles.toastBadge, {color: toastTone.color}]}>
                {toast.position === 'bottom' ? 'Snackbar' : 'Toast'}
              </Text>
              <Text style={styles.toastMeta}>{toastTone.label}</Text>
            </View>
            <Text style={styles.toastTitle}>{toastTone.title}</Text>
            <Text style={styles.toastText}>{toastTone.description}</Text>
          </Animated.View>
        ) : null}
      </View>
    </DemoCard>
  );
}

type OverlayLabCardProps = {
  confirmState: 'idle' | 'approved' | 'cancelled';
  popoverVisible: boolean;
  tooltipVisible: boolean;
  onOpenAlert: () => void;
  onOpenConfirm: () => void;
  onOpenFrosted: () => void;
  onTogglePopover: () => void;
  onToggleTooltip: () => void;
  onShowTooltip: () => void;
  onHideTooltip: () => void;
};

function OverlayLabCard({
  confirmState,
  popoverVisible,
  tooltipVisible,
  onOpenAlert,
  onOpenConfirm,
  onOpenFrosted,
  onTogglePopover,
  onToggleTooltip,
  onShowTooltip,
  onHideTooltip,
}: OverlayLabCardProps) {
  const confirmTone =
    confirmState === 'approved'
      ? getToneMeta('success')
      : confirmState === 'cancelled'
        ? getToneMeta('warning')
        : getToneMeta('info');

  return (
    <DemoCard
      eyebrow="Overlay system"
      title="Dialogs, backdrop modal, popover, and tooltip"
      description="The dialog layer uses a single custom modal system with different content modes. Inline overlays complete the set with a contextual popover and a tooltip that responds to press or hover.">
      <View style={styles.actionRow}>
        <ActionButton label="Alert dialog" onPress={onOpenAlert} />
        <ActionButton label="Confirm dialog" variant="secondary" onPress={onOpenConfirm} />
        <ActionButton label="Backdrop modal" variant="secondary" onPress={onOpenFrosted} />
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            {
              borderColor: confirmTone.color,
              backgroundColor: toneSurface(confirmTone.color),
            },
          ]}>
          <Text style={[styles.statusBadgeText, {color: confirmTone.color}]}>
            {confirmState === 'idle'
              ? 'No confirmation yet'
              : confirmState === 'approved'
                ? 'Last decision: approved'
                : 'Last decision: cancelled'}
          </Text>
        </View>
      </View>

      <View style={styles.overlayLab}>
        <View style={styles.labRow}>
          <Pressable
            onHoverIn={onShowTooltip}
            onHoverOut={onHideTooltip}
            onPress={onToggleTooltip}
            style={styles.labButton}>
            <Text style={styles.labButtonTitle}>Tooltip target</Text>
            <Text style={styles.labButtonText}>Hover or press to reveal helper copy.</Text>
          </Pressable>

          <Pressable onPress={onTogglePopover} style={styles.labButton}>
            <Text style={styles.labButtonTitle}>Open popover</Text>
            <Text style={styles.labButtonText}>Context actions stay tied to the trigger.</Text>
          </Pressable>
        </View>

        {tooltipVisible ? (
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              Use this for brief hints when a control needs extra context.
            </Text>
          </View>
        ) : null}

        {popoverVisible ? (
          <View style={styles.popoverCard}>
            <Text style={styles.popoverTitle}>Context menu</Text>
            <Text style={styles.popoverBody}>
              Duplicate, pin, or share the selected showcase card without leaving the current flow.
            </Text>
            <View style={styles.popoverActions}>
              <ChoiceChip
                active
                color={Colors.secondary}
                label="Pin"
                onPress={onTogglePopover}
              />
              <ChoiceChip
                active={false}
                color={Colors.primary}
                label="Share"
                onPress={onTogglePopover}
              />
            </View>
          </View>
        ) : null}
      </View>
    </DemoCard>
  );
}

type ProgressCardProps = {
  progressValue: number;
  uploading: boolean;
  showSkeleton: boolean;
  onOpenSheet: () => void;
  onRunUpload: () => void;
  onToggleSkeleton: () => void;
  indeterminateTranslate: Animated.AnimatedInterpolation<string | number>;
  shimmerTranslate: Animated.AnimatedInterpolation<string | number>;
};

function ProgressCard({
  progressValue,
  uploading,
  showSkeleton,
  onOpenSheet,
  onRunUpload,
  onToggleSkeleton,
  indeterminateTranslate,
  shimmerTranslate,
}: ProgressCardProps) {
  return (
    <DemoCard
      eyebrow="Progress states"
      title="Bottom sheet, progress indicators, and skeleton shimmer"
      description="Loading flows need multiple levels of feedback. This section combines a draggable bottom sheet, determined and indeterminate progress bars, circular activity, and shimmer placeholders before the final content is rendered.">
      <View style={styles.actionRow}>
        <ActionButton label="Open sheet" onPress={onOpenSheet} />
        <ActionButton
          label={uploading ? 'Uploading...' : 'Run upload'}
          variant="secondary"
          onPress={onRunUpload}
        />
        <ActionButton
          label={showSkeleton ? 'Show content' : 'Show skeleton'}
          variant="secondary"
          onPress={onToggleSkeleton}
        />
      </View>

      <View style={styles.progressPanel}>
        <View style={styles.progressHeader}>
          <View style={styles.progressCopy}>
            <Text style={styles.sectionTitle}>Determinate progress</Text>
            <Text style={styles.sectionDescription}>
              Upload progress exposes exact completion values and keeps the CTA busy until the work
              is done.
            </Text>
          </View>
          <Text style={styles.valueBadge}>{Math.round(progressValue * 100)}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progressValue * 100)}%`,
              },
            ]}
          />
        </View>

        <View style={styles.progressHeader}>
          <View style={styles.progressCopy}>
            <Text style={styles.sectionTitle}>Indeterminate progress</Text>
            <Text style={styles.sectionDescription}>
              Use when the operation is real but the exact duration is not yet known.
            </Text>
          </View>
          <Text style={styles.valueBadge}>Live</Text>
        </View>

        <View style={styles.indeterminateTrack}>
          <Animated.View
            style={[
              styles.indeterminateBar,
              {
                transform: [{translateX: indeterminateTranslate}],
              },
            ]}
          />
        </View>

        <View style={styles.indicatorRow}>
          <View style={styles.circularBadge}>
            <Text style={styles.circularValue}>{Math.round(progressValue * 100)}%</Text>
            <Text style={styles.circularLabel}>circular progress</Text>
          </View>
          <View style={styles.activityWrap}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <ActivityIndicator color={Colors.secondary} size="small" />
            <Text style={styles.activityText}>ActivityIndicator states</Text>
          </View>
        </View>
      </View>

      <View style={styles.loadingPanel}>
        <View style={styles.progressHeader}>
          <View style={styles.progressCopy}>
            <Text style={styles.sectionTitle}>Skeleton loading / shimmer</Text>
            <Text style={styles.sectionDescription}>
              Shimmer placeholders keep layout stable while content is still being fetched or
              transformed.
            </Text>
          </View>
          <Text style={styles.valueBadge}>{showSkeleton ? 'Loading' : 'Ready'}</Text>
        </View>

        {showSkeleton ? (
          <View style={styles.skeletonStack}>
            {[72, 54, 88].map((height, index) => (
              <View key={`skeleton-${index}`} style={[styles.skeletonBlock, {height}]}>
                <Animated.View
                  style={[
                    styles.shimmerStrip,
                    {
                      transform: [{translateX: shimmerTranslate}],
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.loadedCard}>
            <Text style={styles.loadedTitle}>Feedback layer ready</Text>
            <Text style={styles.loadedText}>
              The showcase now has transient messages, layered overlays, progress surfaces, and
              refresh patterns wired together.
            </Text>
          </View>
        )}
      </View>
    </DemoCard>
  );
}

type PullToRefreshCardProps = {
  refreshing: boolean;
  pullReady: boolean;
  lastRefreshLabel: string;
  pullIndicatorOpacity: Animated.AnimatedInterpolation<string | number>;
  pullIndicatorTranslate: Animated.AnimatedInterpolation<string | number>;
  pullContentTranslate: Animated.AnimatedInterpolation<string | number>;
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
};

function PullToRefreshCard({
  refreshing,
  pullReady,
  lastRefreshLabel,
  pullIndicatorOpacity,
  pullIndicatorTranslate,
  pullContentTranslate,
  panHandlers,
}: PullToRefreshCardProps) {
  return (
    <DemoCard
      eyebrow="Gesture feedback"
      title="Pull to refresh indicator"
      description="Drag the panel down to trigger a refresh cycle without leaving the current screen. The indicator appears before the content settles back into place with updated status text.">
      <View style={styles.pullShell} {...panHandlers}>
        <Animated.View
          style={[
            styles.pullIndicator,
            {
              opacity: pullIndicatorOpacity,
              transform: [{translateY: pullIndicatorTranslate}],
            },
          ]}>
          {refreshing ? <ActivityIndicator color={Colors.primary} size="small" /> : null}
          <View style={styles.pullIndicatorCopy}>
            <Text style={styles.pullIndicatorTitle}>
              {refreshing
                ? 'Refreshing content'
                : pullReady
                  ? 'Release to refresh'
                  : 'Pull down to refresh'}
            </Text>
            <Text style={styles.pullIndicatorText}>Last update: {lastRefreshLabel}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.pullContent,
            {
              transform: [{translateY: pullContentTranslate}],
            },
          ]}>
          {FEED_ITEMS.map(item => (
            <View key={item.title} style={styles.pullItem}>
              <View style={styles.pullItemCopy}>
                <Text style={styles.pullItemTitle}>{item.title}</Text>
                <Text style={styles.pullItemText}>{item.detail}</Text>
              </View>
              <View style={styles.pullPill}>
                <Text style={styles.pullPillText}>LIVE</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </DemoCard>
  );
}

type OverlayModalProps = {
  overlayVariant: OverlayVariant;
  onClose: () => void;
  onConfirmCancel: () => void;
  onConfirmApprove: () => void;
};

function OverlayModal({
  overlayVariant,
  onClose,
  onConfirmCancel,
  onConfirmApprove,
}: OverlayModalProps) {
  return (
    <Modal
      transparent
      visible={overlayVariant !== null}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        {overlayVariant === 'frosted' ? (
          <>
            <View style={styles.backdropOrbPrimary} />
            <View style={styles.backdropOrbSecondary} />
          </>
        ) : null}

        <View
          style={[
            styles.dialogCard,
            overlayVariant === 'frosted' && styles.frostedDialogCard,
          ]}>
          <Text style={styles.dialogEyebrow}>
            {overlayVariant === 'alert'
              ? 'Alert dialog'
              : overlayVariant === 'confirm'
                ? 'Confirmation dialog'
                : 'Backdrop blur modal'}
          </Text>
          <Text style={styles.dialogTitle}>
            {overlayVariant === 'alert'
              ? 'Heads up before continuing'
              : overlayVariant === 'confirm'
                ? 'Publish this showcase update?'
                : 'Frosted modal presentation'}
          </Text>
          <Text style={styles.dialogText}>
            {overlayVariant === 'alert'
              ? 'Use the alert variant for blocking notices, validation summaries, or one-step acknowledgements.'
              : overlayVariant === 'confirm'
                ? 'Confirmation dialogs should be explicit about the action and the resulting state change.'
                : 'This modal uses layered transparency, accent orbs, and a brighter card to simulate a blurred backdrop without extra libraries.'}
          </Text>

          <View style={styles.dialogActions}>
            {overlayVariant === 'confirm' ? (
              <>
                <ActionButton label="Cancel" variant="secondary" onPress={onConfirmCancel} />
                <ActionButton label="Confirm" onPress={onConfirmApprove} />
              </>
            ) : (
              <ActionButton label="Close" onPress={onClose} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

type SheetModalProps = {
  visible: boolean;
  translateY: Animated.Value;
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
  onClose: () => void;
  onTriggerToast: () => void;
};

function SheetModal({
  visible,
  translateY,
  panHandlers,
  onClose,
  onTriggerToast,
}: SheetModalProps) {
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <Animated.View style={[styles.sheetCard, {transform: [{translateY}]}]}>
          <View style={styles.sheetHandleWrap} {...panHandlers}>
            <View style={styles.sheetHandle} />
          </View>

          <Text style={styles.sheetTitle}>Draggable bottom sheet</Text>
          <Text style={styles.sheetText}>
            Drag the handle down to dismiss, or tap the backdrop. This pattern works well for
            focused secondary tasks and action menus.
          </Text>

          <View style={styles.sheetGrid}>
            <View style={styles.sheetPill}>
              <Text style={styles.sheetPillValue}>3</Text>
              <Text style={styles.sheetPillLabel}>actions queued</Text>
            </View>
            <View style={styles.sheetPill}>
              <Text style={styles.sheetPillValue}>1.4</Text>
              <Text style={styles.sheetPillLabel}>feedback phase</Text>
            </View>
            <View style={styles.sheetPill}>
              <Text style={styles.sheetPillValue}>Core RN</Text>
              <Text style={styles.sheetPillLabel}>no extra packages</Text>
            </View>
          </View>

          <View style={styles.sheetActionRow}>
            <ActionButton label="Dismiss" variant="secondary" onPress={onClose} />
            <ActionButton label="Trigger info toast" onPress={onTriggerToast} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function FeedbackShowcase() {
  const [selectedTone, setSelectedTone] = useState<ToastTone>('success');
  const [selectedPosition, setSelectedPosition] = useState<ToastPosition>('top');
  const [toast, setToast] = useState<{tone: ToastTone; position: ToastPosition} | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [overlayVariant, setOverlayVariant] = useState<OverlayVariant>(null);
  const [confirmState, setConfirmState] = useState<'idle' | 'approved' | 'cancelled'>('idle');
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [progressValue, setProgressValue] = useState(0.42);
  const [uploading, setUploading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullReady, setPullReady] = useState(false);
  const [lastRefreshLabel, setLastRefreshLabel] = useState('2 minutes ago');

  const toastAnimation = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = useRef(new Animated.Value(0)).current;
  const pullDistance = useRef(new Animated.Value(0)).current;
  const pullDistanceRef = useRef(0);
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pullIndicatorOpacity = pullDistance.interpolate({
    inputRange: [0, 22, 90],
    outputRange: [0, 0.72, 1],
  });
  const pullIndicatorTranslate = pullDistance.interpolate({
    inputRange: [0, 90],
    outputRange: [-26, 16],
  });
  const pullContentTranslate = pullDistance.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 60],
  });
  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 260],
  });
  const indeterminateTranslate = indeterminateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 280],
  });

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1350,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const indeterminateLoop = Animated.loop(
      Animated.timing(indeterminateAnimation, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    shimmerAnimation.setValue(0);
    indeterminateAnimation.setValue(0);
    shimmerLoop.start();
    indeterminateLoop.start();

    return () => {
      shimmerLoop.stop();
      indeterminateLoop.stop();
    };
  }, [indeterminateAnimation, shimmerAnimation]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastAnimation.setValue(0);
    Animated.spring(toastAnimation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();

    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnimation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setToast(null);
        }
      });
    }, 2200);

    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, [toast, toastAnimation]);

  useEffect(() => {
    if (!uploading) {
      if (uploadTimer.current) {
        clearInterval(uploadTimer.current);
        uploadTimer.current = null;
      }
      return;
    }

    uploadTimer.current = setInterval(() => {
      setProgressValue(current => {
        const nextValue = Math.min(1, current + 0.08);

        if (nextValue >= 1) {
          if (uploadTimer.current) {
            clearInterval(uploadTimer.current);
            uploadTimer.current = null;
          }
          setUploading(false);
          setToast({tone: 'success', position: 'bottom'});
        }

        return nextValue;
      });
    }, 150);

    return () => {
      if (uploadTimer.current) {
        clearInterval(uploadTimer.current);
        uploadTimer.current = null;
      }
    };
  }, [uploading]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
      if (uploadTimer.current) {
        clearInterval(uploadTimer.current);
      }
    };
  }, []);

  function closeOverlay() {
    setOverlayVariant(null);
  }

  function openSheet() {
    sheetTranslateY.setValue(SHEET_HEIGHT);
    setSheetVisible(true);
    setTimeout(() => {
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }).start();
    }, 0);
  }

  function closeSheet() {
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        setSheetVisible(false);
      }
    });
  }

  function triggerToast(position: ToastPosition) {
    setToast({
      tone: selectedTone,
      position,
    });
  }

  function startUpload() {
    if (uploading) {
      return;
    }

    setProgressValue(0.04);
    setUploading(true);
  }

  function triggerRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setPullReady(false);
    Animated.spring(pullDistance, {
      toValue: 56,
      useNativeDriver: true,
      friction: 8,
      tension: 70,
    }).start();

    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      setRefreshing(false);
      setShowSkeleton(false);
      setProgressValue(current => Math.min(1, current + 0.12));
      setLastRefreshLabel('Just now');
      pullDistanceRef.current = 0;

      Animated.spring(pullDistance, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 70,
      }).start();
    }, 1200);
  }

  const pullPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (refreshing) {
          return;
        }

        const nextDistance = clampNumber(gestureState.dy * 0.55, 0, 92);
        pullDistanceRef.current = nextDistance;
        setPullReady(nextDistance >= PULL_THRESHOLD);
        pullDistance.setValue(nextDistance);
      },
      onPanResponderRelease: () => {
        if (refreshing) {
          return;
        }

        if (pullDistanceRef.current >= PULL_THRESHOLD) {
          triggerRefresh();
          return;
        }

        pullDistanceRef.current = 0;
        setPullReady(false);
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 70,
        }).start();
      },
      onPanResponderTerminate: () => {
        if (refreshing) {
          return;
        }

        pullDistanceRef.current = 0;
        setPullReady(false);
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 70,
        }).start();
      },
    }),
  ).current;

  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        sheetTranslateY.setValue(clampNumber(gestureState.dy, 0, SHEET_HEIGHT));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.2) {
          closeSheet();
          return;
        }

        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.stack}>
      <SummaryCard />
      <TransientFeedbackCard
        selectedTone={selectedTone}
        selectedPosition={selectedPosition}
        bannerVisible={bannerVisible}
        toast={toast}
        toastAnimation={toastAnimation}
        onSelectTone={setSelectedTone}
        onSelectPosition={setSelectedPosition}
        onTriggerToast={triggerToast}
        onToggleBanner={() => setBannerVisible(current => !current)}
        onDismissBanner={() => setBannerVisible(false)}
      />
      <OverlayLabCard
        confirmState={confirmState}
        popoverVisible={popoverVisible}
        tooltipVisible={tooltipVisible}
        onOpenAlert={() => setOverlayVariant('alert')}
        onOpenConfirm={() => setOverlayVariant('confirm')}
        onOpenFrosted={() => setOverlayVariant('frosted')}
        onTogglePopover={() => setPopoverVisible(current => !current)}
        onToggleTooltip={() => setTooltipVisible(current => !current)}
        onShowTooltip={() => setTooltipVisible(true)}
        onHideTooltip={() => setTooltipVisible(false)}
      />
      <ProgressCard
        progressValue={progressValue}
        uploading={uploading}
        showSkeleton={showSkeleton}
        onOpenSheet={openSheet}
        onRunUpload={startUpload}
        onToggleSkeleton={() => setShowSkeleton(current => !current)}
        indeterminateTranslate={indeterminateTranslate}
        shimmerTranslate={shimmerTranslate}
      />
      <PullToRefreshCard
        refreshing={refreshing}
        pullReady={pullReady}
        lastRefreshLabel={lastRefreshLabel}
        pullIndicatorOpacity={pullIndicatorOpacity}
        pullIndicatorTranslate={pullIndicatorTranslate}
        pullContentTranslate={pullContentTranslate}
        panHandlers={pullPanResponder.panHandlers}
      />
      <OverlayModal
        overlayVariant={overlayVariant}
        onClose={closeOverlay}
        onConfirmCancel={() => {
          setConfirmState('cancelled');
          closeOverlay();
        }}
        onConfirmApprove={() => {
          setConfirmState('approved');
          closeOverlay();
        }}
      />
      <SheetModal
        visible={sheetVisible}
        translateY={sheetTranslateY}
        panHandlers={sheetPanResponder.panHandlers}
        onClose={closeSheet}
        onTriggerToast={() => {
          closeSheet();
          setSelectedTone('info');
          setToast({tone: 'info', position: 'bottom'});
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.warning,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statPill: {
    flexGrow: 1,
    minWidth: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checklistWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  checklistChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  checklistChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  choiceChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
  },
  actionButtonPressed: {
    opacity: 0.82,
    transform: [{scale: 0.98}],
  },
  actionButtonText: {
    ...Typography.bodySmall,
    color: Colors.bg,
    fontWeight: '800',
  },
  actionButtonTextSecondary: {
    color: Colors.textPrimary,
  },
  previewStage: {
    minHeight: 244,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    overflow: 'hidden',
    gap: Spacing.md,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  bannerCopy: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...Typography.h4,
  },
  bannerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  dismissPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCardAlt,
  },
  dismissPillText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stageMetric: {
    flex: 1,
    minWidth: 110,
    minHeight: 78,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  stageMetricValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  stageMetricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  toastCard: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    backgroundColor: Colors.bgCardAlt,
    ...neonShadow(Colors.primary, 10),
  },
  toastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  toastBadge: {
    ...Typography.caption,
    fontWeight: '700',
  },
  toastMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  toastTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  toastText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  overlayLab: {
    minHeight: 220,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    position: 'relative',
    gap: Spacing.md,
  },
  labRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  labButton: {
    flex: 1,
    minWidth: 150,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  labButtonTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  labButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tooltipBubble: {
    position: 'absolute',
    top: 90,
    left: Spacing.md,
    maxWidth: 220,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.bgCardAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...neonShadow(Colors.primary, 8),
  },
  tooltipText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  popoverCard: {
    position: 'absolute',
    right: Spacing.md,
    top: 98,
    width: 250,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...neonShadow(Colors.secondary, 10),
  },
  popoverTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  popoverBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  popoverActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  progressPanel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  progressCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  valueBadge: {
    ...Typography.caption,
    color: Colors.primary,
    backgroundColor: toneSurface(Colors.primary),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    ...neonShadow(Colors.primary, 8),
  },
  indeterminateTrack: {
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    overflow: 'hidden',
  },
  indeterminateBar: {
    width: '40%',
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
  },
  indicatorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  circularBadge: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 8,
    borderColor: toneSurface(Colors.primary, '48'),
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  circularValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  circularLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activityWrap: {
    flex: 1,
    minWidth: 170,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  activityText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  loadingPanel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  skeletonStack: {
    gap: Spacing.sm,
  },
  skeletonBlock: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    overflow: 'hidden',
  },
  shimmerStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '42%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  loadedCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '50',
    backgroundColor: toneSurface(Colors.success, '12'),
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  loadedTitle: {
    ...Typography.h4,
    color: Colors.success,
  },
  loadedText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  pullShell: {
    minHeight: 278,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  pullIndicator: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pullIndicatorCopy: {
    alignItems: 'center',
    gap: 2,
  },
  pullIndicatorTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  pullIndicatorText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  pullContent: {
    gap: Spacing.sm,
    marginTop: 36,
  },
  pullItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
  },
  pullItemCopy: {
    flex: 1,
    gap: 2,
  },
  pullItemTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  pullItemText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  pullPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: toneSurface(Colors.primary),
  },
  pullPillText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  backdropOrbPrimary: {
    position: 'absolute',
    top: '20%',
    left: '12%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: toneSurface(Colors.primary, '22'),
  },
  backdropOrbSecondary: {
    position: 'absolute',
    bottom: '18%',
    right: '14%',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: toneSurface(Colors.secondary, '20'),
  },
  dialogCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  frostedDialogCard: {
    backgroundColor: 'rgba(22,22,56,0.86)',
  },
  dialogEyebrow: {
    ...Typography.label,
    color: Colors.primary,
  },
  dialogTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  dialogText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  dialogActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayLight,
  },
  sheetCard: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  sheetHandle: {
    width: 54,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sheetText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetPill: {
    flexGrow: 1,
    minWidth: 100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 2,
  },
  sheetPillValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sheetPillLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sheetActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
