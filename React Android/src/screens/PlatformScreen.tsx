import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AccessibilityInfo,
  AppState,
  Keyboard,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';
import {
  ANDROID_BOTTOM_TABS,
  ANDROID_CHANNELS,
  ANDROID_FAB_ACTIONS,
  ANDROID_LAUNCH_STATES,
  ANDROID_PALETTES,
  ANDROID_SERVICE_TASKS,
  ANDROID_SHORTCUTS,
  ANDROID_SWIPE_ITEMS,
  BASE_LAT,
  BASE_LNG,
  DEVICES,
  GRID_MARKS,
  HAPTICS,
  cardinal,
  clamp,
  stamp,
  tryCopyToClipboard,
  type AndroidShortcut,
  type AndroidSwipeItem,
  type Device,
  type NotificationItem,
  type PermissionKey,
  type RoutePoint,
  type Tag,
  type Vec3,
} from './platform/model';
import {PlatformCard as Card, PlatformMeter as Meter} from './platform/sections';
import type {HomeStackParamList} from '../navigation/types';
import {
  createShowcaseDeepLink,
  createShowcaseExternalRouteUrl,
  createShowcaseReferenceUrl,
  getShowcasePlatformLabel,
  supportsShowcaseHttpsLinks,
} from '../utils/platformShowcase';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function PlatformScreen() {
  const navigation = useNavigation<Nav>();
  const {width, height, fontScale} = useWindowDimensions();
  const systemScheme = useColorScheme();
  const fullWidth = width - Spacing.lg * 2;
  const cardWidth = width >= 840 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const orientation = width > height ? 'Landscape' : 'Portrait';
  const platformLabel = getShowcasePlatformLabel();
  const isIOS = Platform.OS === 'ios';
  const filesDeepLink = createShowcaseDeepLink('files');
  const networkDeepLink = createShowcaseDeepLink('network');
  const externalFilesUrl = createShowcaseExternalRouteUrl('files');
  const externalNetworkUrl = createShowcaseExternalRouteUrl('network');
  const supportsHttpsLinks = supportsShowcaseHttpsLinks();
  const quickActionChoices = isIOS
    ? ['Compose', 'Scan', 'Share']
    : [...ANDROID_FAB_ACTIONS];
  const bottomTabs = isIOS
    ? ['Today', 'Search', 'Files', 'Profile']
    : [...ANDROID_BOTTOM_TABS];
  const splashModes = [...ANDROID_LAUNCH_STATES];
  const notificationGroups = isIOS
    ? [
        {
          id: 'updates',
          label: 'Updates',
          importance: 'Scheduled summary',
          tone: Colors.primary,
        },
        {
          id: 'messages',
          label: 'Messages',
          importance: 'Time Sensitive',
          tone: Colors.secondary,
        },
        {
          id: 'sync',
          label: 'Background refresh',
          importance: 'Passive',
          tone: Colors.success,
        },
      ]
    : ANDROID_CHANNELS;
  const backgroundTaskLabels = isIOS
    ? ['App refresh', 'Widget timeline', 'Upload queue']
    : [...ANDROID_SERVICE_TASKS];
  const platformSectionTitle = isIOS ? 'iOS Platform' : 'Android Platform';
  const platformSectionCopy = isIOS
    ? 'Semantic colors, quick actions, Picture-in-Picture and native iPhone runtime surfaces in one device lab.'
    : 'Material You, edge-to-edge layouts, launcher shortcuts, PiP and notification plumbing.';
  const designSystemTitle = isIOS ? 'Human Interface' : 'Material You';
  const designSystemSubtitle = isIOS
    ? 'Semantic colors, edge-safe layout and an iOS chrome preview.'
    : 'Material 3 tokens, dynamic colors and an edge-to-edge chrome preview.';
  const designSystemCopy = isIOS
    ? 'System tint, translucent surfaces and semantic roles keep the iPhone shell cohesive.'
    : 'Wallpaper extraction seeds the accent, tonal surfaces and controls for Android.';
  const shellCardTitle = isIOS ? 'Quick Actions & Tab Bar' : 'FAB Menu & Bottom App Bar';
  const shellCardSubtitle = isIOS
    ? 'Primary actions stay close to the tab bar with a compact command tray.'
    : 'Primary actions stay anchored to a Material bottom app bar.';
  const shellKicker = isIOS ? 'Tab bar' : 'Bottom app bar';
  const shellCardCopy = isIOS
    ? 'Core navigation stays docked while a compact command tray expands over the tab bar.'
    : 'Core navigation stays docked while the floating button expands into a compact action sheet.';
  const swipeActionsNote = isIOS
    ? 'Tap a row to reveal iOS-style trailing actions.'
    : 'Tap a row to reveal Android-style swipe actions on the trailing edge.';
  const shortcutsCardTitle = isIOS ? 'Quick Actions & PiP' : 'App Shortcuts & PiP';
  const shortcutsCardSubtitle = isIOS
    ? 'Home screen quick actions plus compact video playback.'
    : 'Long-press launcher routes plus compact video playback.';
  const splashCardSubtitle = isIOS
    ? 'Launch screen handoff, icon plate and startup timing.'
    : 'Android 12 launch icon mask, keep condition and handoff timing.';
  const splashCardCopy = isIOS
    ? 'Icon plate, brand background and handoff animation stay in sync with the startup mode.'
    : 'Icon mask, brand background and exit animation stay in sync with the startup mode.';
  const systemActionsCopy = isIOS
    ? 'Clipboard, sharing, app-scheme links, notifications and permissions.'
    : 'Clipboard, sharing, deep links, notifications and permissions.';
  const hapticsCardTitle = isIOS ? 'Haptics preview' : 'Vibration / Haptics';
  const hapticsCardSubtitle = isIOS
    ? 'Single iPhone vibration fallback with labeled presets.'
    : 'Preset pulse patterns.';
  const linksNote = supportsHttpsLinks
    ? `App and HTTPS routes: ${filesDeepLink} | ${networkDeepLink} | ${externalFilesUrl} | ${externalNetworkUrl}`
    : `App schemes only in this iOS build: ${filesDeepLink} | ${networkDeepLink}`;
  const notificationsCardTitle = isIOS
    ? 'Notification Categories & Background Refresh'
    : 'Notification Channels & Foreground Service';
  const notificationsCardSubtitle = isIOS
    ? 'Per-category routing plus background refresh state.'
    : 'Per-channel routing plus an always-on service indicator.';
  const notificationsMeterLabel = isIOS
    ? 'Background refresh'
    : 'Foreground service';
  const notificationsNextLabel = isIOS ? 'Next refresh' : 'Next task';

  const [tracking, setTracking] = useState(true);
  const [accel, setAccel] = useState<Vec3>({x: 0.18, y: -0.42, z: 0.96});
  const [gyro, setGyro] = useState<Vec3>({x: 28, y: -14, z: 102});
  const [heading, setHeading] = useState(18);
  const [lux, setLux] = useState(420);
  const [near, setNear] = useState(false);
  const [pressure, setPressure] = useState(1009.6);
  const [location, setLocation] = useState({
    lat: BASE_LAT,
    lng: BASE_LNG,
    speed: 18.4,
    accuracy: 3.4,
    altitude: 761,
  });
  const [route, setRoute] = useState<RoutePoint[]>([
    {x: 14, y: 58},
    {x: 21, y: 56},
    {x: 30, y: 53},
    {x: 37, y: 50},
    {x: 45, y: 48},
    {x: 53, y: 45},
    {x: 63, y: 42},
    {x: 71, y: 39},
  ]);
  const [lastHaptic, setLastHaptic] = useState('Tap preset armed');
  const [bluetoothScanning, setBluetoothScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>(
    DEVICES.map((device, index) => ({...device, strength: 78 - index * 12, connected: index === 0})),
  );
  const [nfcScanning, setNfcScanning] = useState(false);
  const [tags, setTags] = useState<Tag[]>([
    {id: 'TAG-27C4', type: 'MIFARE Ultralight', payload: 'https://showcase.cfd.dev/tour', seenAt: '09:12:08'},
    {
      id: 'TAG-18F0',
      type: 'NTAG215',
      payload: `device-profile:${Platform.OS}-lab`,
      seenAt: '09:08:44',
    },
  ]);
  const [bioState, setBioState] = useState<'idle' | 'success' | 'denied'>('idle');
  const [bioMode, setBioMode] = useState<'Fingerprint' | 'Face ID'>(
    Platform.OS === 'android' ? 'Fingerprint' : 'Face ID',
  );
  const [clipboardText, setClipboardText] = useState(filesDeepLink);
  const [clipboardCache, setClipboardCache] = useState(filesDeepLink);
  const [systemMessage, setSystemMessage] = useState('System resources ready.');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'local-1',
      kind: 'Local',
      title: 'Offline cache ready',
      body: 'Files and routes are available without reconnecting.',
      time: '09:30:12',
    },
    {
      id: 'push-1',
      kind: 'Push',
      title: 'Build queue healthy',
      body: 'CI finished the latest preview pipeline.',
      time: '09:28:03',
    },
  ]);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    camera: true,
    location: true,
    notifications: false,
  });
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [online, setOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<'Wi-Fi' | '5G' | 'Ethernet'>('Wi-Fi');
  const [appStateLabel, setAppStateLabel] = useState(AppState.currentState);
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [locale, setLocale] = useState<'en-US' | 'pt-BR' | 'es-ES'>('en-US');
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardText, setKeyboardText] = useState('');
  const [splashStep, setSplashStep] = useState(0);
  const [androidPaletteIndex, setAndroidPaletteIndex] = useState(0);
  const [edgeToEdge, setEdgeToEdge] = useState(true);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [fabAction, setFabAction] = useState<string>(quickActionChoices[0]);
  const [bottomTab, setBottomTab] = useState<string>(bottomTabs[0]);
  const [swipedItem, setSwipedItem] = useState<string | null>('build-queue');
  const [shortcutLog, setShortcutLog] = useState(
    isIOS
      ? 'Home screen quick actions are ready for long press.'
      : 'Launcher shortcuts are ready for long press.',
  );
  const [pipMode, setPipMode] = useState<'Inline' | 'PiP'>('Inline');
  const [launchMode, setLaunchMode] = useState<string>(splashModes[0]);
  const [channelState, setChannelState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        notificationGroups.map((group, index) => [group.id, index < 2]),
      ) as Record<string, boolean>,
  );
  const [foregroundActive, setForegroundActive] = useState(true);
  const [foregroundProgress, setForegroundProgress] = useState(68);
  const [foregroundTaskIndex, setForegroundTaskIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const effectiveTheme =
    themeMode === 'system' ? systemScheme ?? (Platform.OS === 'android' ? 'dark' : 'light') : themeMode;
  const androidPalette = ANDROID_PALETTES[androidPaletteIndex];
  const foregroundTask =
    backgroundTaskLabels[foregroundTaskIndex] ?? backgroundTaskLabels[0];
  const notificationsToggleLabel = isIOS
    ? foregroundActive
      ? 'Refresh on'
      : 'Refresh off'
    : foregroundActive
      ? 'Service on'
      : 'Service off';
  const localizedCopy = {
    'en-US': {
      title: 'System resources online',
      body: 'Clipboard, deep links, notifications and accessibility are active.',
    },
    'pt-BR': {
      title: 'Recursos do sistema online',
      body: 'Clipboard, links, notificacoes e acessibilidade estao ativas.',
    },
    'es-ES': {
      title: 'Recursos del sistema activos',
      body: 'Portapapeles, enlaces, notificaciones y accesibilidad estan listas.',
    },
  }[locale];

  useEffect(() => () => timersRef.current.forEach(timeout => clearTimeout(timeout)), []);

  useEffect(() => {
    if (!foregroundActive) {
      return;
    }

    const id = setInterval(() => {
      setForegroundProgress(previous => (previous >= 100 ? 24 : previous + 8));
    }, 1200);

    return () => clearInterval(id);
  }, [foregroundActive]);

  useEffect(() => {
    const appSub = AppState.addEventListener('change', next => setAppStateLabel(next));
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    AccessibilityInfo.isScreenReaderEnabled()
      .then(setScreenReaderEnabled)
      .catch(() => {});

    if (AccessibilityInfo.isReduceMotionEnabled) {
      AccessibilityInfo.isReduceMotionEnabled()
        .then(setReduceMotionEnabled)
        .catch(() => {});
    }

    const timer = setInterval(() => {
      setBatteryLevel(previous => (previous <= 18 ? 96 : previous - 1));
      setOnline(previous => {
        const next = previous ? Math.random() > 0.14 : Math.random() > 0.42;
        setConnectionType(
          next
            ? previous
              ? connectionType === 'Wi-Fi'
                ? '5G'
                : connectionType === '5G'
                  ? 'Ethernet'
                  : 'Wi-Fi'
              : 'Wi-Fi'
            : 'Ethernet',
        );
        return next;
      });
      setSplashStep(previous => (previous + 1) % 3);
    }, 5200);

    return () => {
      appSub.remove();
      showSub.remove();
      hideSub.remove();
      clearInterval(timer);
    };
  }, [connectionType]);

  useEffect(() => {
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const t = step / 3;
      setAccel({
        x: Number((Math.sin(t) * 0.92).toFixed(2)),
        y: Number((Math.cos(t * 0.82) * 0.76).toFixed(2)),
        z: Number((0.86 + Math.sin(t * 0.48) * 0.19).toFixed(2)),
      });
      setGyro({
        x: Number((Math.sin(t * 0.76) * 145).toFixed(0)),
        y: Number((Math.cos(t * 0.64) * 92).toFixed(0)),
        z: Number((((t * 52) % 360) + 360).toFixed(0)),
      });
      setHeading(Math.round((t * 28) % 360));
      setLux(Math.round(380 + Math.sin(t * 0.62) * 260 + Math.abs(Math.cos(t * 0.2)) * 220));
      setNear(Math.sin(t * 0.92) > 0.5);
      setPressure(Number((1012 + Math.sin(t * 0.34) * 6.4).toFixed(1)));
      setBioMode(Platform.OS === 'android' && Math.sin(t * 0.2) > 0 ? 'Fingerprint' : 'Face ID');
      if (tracking) {
        setLocation({
          lat: Number((BASE_LAT + Math.sin(t * 0.22) * 0.0017).toFixed(5)),
          lng: Number((BASE_LNG + Math.cos(t * 0.24) * 0.0014).toFixed(5)),
          speed: Number((17 + Math.abs(Math.sin(t * 0.86)) * 34).toFixed(1)),
          accuracy: Number((2.6 + Math.abs(Math.cos(t * 0.51)) * 2.8).toFixed(1)),
          altitude: Math.round(760 + Math.sin(t * 0.4) * 14),
        });
        setRoute(previous => [
          ...previous.slice(-11),
          {x: clamp(12 + ((step * 6.8) % 76), 10, 88), y: clamp(50 + Math.sin(t * 0.82) * 24, 16, 84)},
        ]);
      }
    }, 850);
    return () => clearInterval(id);
  }, [tracking]);

  const currentPoint = route[route.length - 1] ?? {x: 50, y: 50};
  const lightPercent = clamp(Math.round((lux / 1200) * 100), 0, 100);
  const pressurePercent = clamp(Math.round(((pressure - 980) / 60) * 100), 0, 100);
  const altitudeFromPressure = Math.round(44330 * (1 - Math.pow(pressure / 1013.25, 0.1903)));
  const batteryPercent = clamp(batteryLevel, 0, 100);
  const permissionCount = Object.values(permissions).filter(Boolean).length;
  const enabledChannelCount = Object.values(channelState).filter(Boolean).length;
  const engineLabel = (globalThis as {HermesInternal?: object}).HermesInternal ? 'Hermes' : 'JavaScriptCore';

  const triggerHaptic = (pattern: number | readonly number[], label: string) => {
    const timestamp = stamp(new Date());
    setLastHaptic(
      isIOS
        ? `${label} fallback fired at ${timestamp}. iOS uses a single system vibration.`
        : `${label} pulse sent at ${timestamp}`,
    );
    if (isIOS) {
      Vibration.vibrate();
      return;
    }

    if (Platform.OS === 'android') {
      Vibration.vibrate(typeof pattern === 'number' ? pattern : Array.from(pattern));
    }
  };

  const scanNfc = () => {
    setNfcScanning(true);
    setTags(previous => [
      {
        id: `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
        type: Math.random() > 0.5 ? 'MIFARE Classic' : 'NTAG213',
        payload: Math.random() > 0.5 ? 'https://showcase.cfd.dev/hardware' : 'access-level:trusted-demo',
        seenAt: stamp(new Date()),
      },
      ...previous,
    ].slice(0, 4));
    const timeout = setTimeout(() => setNfcScanning(false), 650);
    timersRef.current.push(timeout);
  };

  const scanBluetooth = () => {
    setBluetoothScanning(true);
    const timeout = setTimeout(() => {
      setDevices(
        DEVICES.map((device, index) => {
          const strength = clamp(35 + Math.round(Math.abs(Math.sin(Date.now() / 350 + index)) * 60), 22, 98);
          return {...device, strength, connected: strength > 74};
        }).sort((left, right) => right.strength - left.strength),
      );
      setBluetoothScanning(false);
    }, 850);
    timersRef.current.push(timeout);
  };

  const copyClipboard = async () => {
    const copied = await tryCopyToClipboard(clipboardText);
    setClipboardCache(clipboardText);
    setSystemMessage(
      copied
        ? 'Preview buffer updated and clipboard synced when available.'
        : 'Preview buffer updated locally because the clipboard API is unavailable.',
    );
  };

  const pasteClipboard = () => {
    setKeyboardText(clipboardCache);
    setSystemMessage('Pasted the latest preview buffer into the keyboard field.');
  };

  const sharePayload = async (kind: 'text' | 'url' | 'image') => {
    const payload =
      kind === 'text'
        ? {message: 'React ShowCase system resources are ready for QA handoff.'}
        : kind === 'url'
          ? {message: 'Open the device lab route', url: externalNetworkUrl}
          : {message: 'Image payload preview: https://showcase.cfd.dev/assets/device-lab.png'};
    await Share.share(payload);
    setSystemMessage(`Share sheet opened for ${kind}.`);
  };

  const openDeepLink = (target: 'files' | 'network') => {
    const routeName = target === 'files' ? 'Files' : 'Network';
    const url = createShowcaseDeepLink(target);
    const referenceUrl = createShowcaseReferenceUrl(target);

    navigation.navigate(routeName);
    setSystemMessage(
      supportsHttpsLinks
        ? `Internal route preview opened for ${routeName}. Reference URLs: ${url} and ${referenceUrl}`
        : `Internal route preview opened for ${routeName}. App scheme: ${url}. Universal links are not configured in this iOS build.`,
    );
  };

  const pushNotification = (kind: 'Local' | 'Push') => {
    if (kind === 'Push' && !pushEnabled) {
      setSystemMessage('Enable push notifications before sending a remote payload.');
      return;
    }
    setNotifications(previous => [
      {
        id: `${kind.toLowerCase()}-${Date.now()}`,
        kind,
        title: kind === 'Local' ? 'Reminder scheduled' : 'Remote update received',
        body:
          kind === 'Local'
            ? 'Permissions and battery checks can run offline.'
            : 'The backend published a new deployment status payload.',
        time: stamp(new Date()),
      },
      ...previous,
    ].slice(0, 4));
    setSystemMessage(`${kind} notification queued.`);
  };

  const requestPermission = (key: PermissionKey) => {
    setPermissions(previous => ({...previous, [key]: !previous[key]}));
  };

  const cyclePalette = () => {
    const nextIndex = (androidPaletteIndex + 1) % ANDROID_PALETTES.length;
    setAndroidPaletteIndex(nextIndex);
    setSystemMessage(`Design palette synced to ${ANDROID_PALETTES[nextIndex].name}.`);
  };

  const toggleEdgeMode = () => {
    setEdgeToEdge(previous => {
      const next = !previous;
      setSystemMessage(next ? 'Edge-to-edge content enabled.' : 'Opaque system bars restored.');
      return next;
    });
  };

  const selectFabAction = (action: string) => {
    setFabAction(action);
    setFabExpanded(false);
    setSystemMessage(
      `${isIOS ? 'Command tray' : 'Bottom app bar'} action queued: ${action}.`,
    );
  };

  const toggleSwipeRow = (id: string) => {
    setSwipedItem(previous => {
      const next = previous === id ? null : id;
      setSystemMessage(next ? `Swipe actions revealed for ${id}.` : 'Swipe actions hidden.');
      return next;
    });
  };

  const runSwipeAction = (item: AndroidSwipeItem, action: 'Archive' | 'Pin' | 'Mute') => {
    setSwipedItem(null);
    setSystemMessage(`${action} applied to ${item.title.toLowerCase()}.`);
  };

  const triggerShortcut = (shortcut: AndroidShortcut) => {
    setShortcutLog(`${shortcut.label} routed to ${shortcut.route}`);
    setSystemMessage(`${isIOS ? 'Quick action' : 'Launcher shortcut'} invoked: ${shortcut.label}.`);
  };

  const togglePip = () => {
    setPipMode(previous => {
      const next = previous === 'Inline' ? 'PiP' : 'Inline';
      setSystemMessage(
        next === 'PiP'
          ? 'Picture-in-Picture preview docked over the app.'
          : 'Player restored from PiP to inline mode.',
      );
      return next;
    });
  };

  const toggleChannel = (id: string) => {
    setChannelState(previous => {
      const next = {...previous, [id]: !previous[id]};
      setSystemMessage(
        next[id]
          ? `${id} ${isIOS ? 'category' : 'channel'} enabled.`
          : `${id} ${isIOS ? 'category' : 'channel'} muted.`,
      );
      return next;
    });
  };

  const toggleForegroundService = () => {
    setForegroundActive(previous => {
      const next = !previous;
      setSystemMessage(
        isIOS
          ? next
            ? 'Background refresh indicator published.'
            : 'Background refresh paused.'
          : next
            ? 'Foreground service indicator published.'
            : 'Foreground service paused.',
      );
      return next;
    });
  };

  const cycleForegroundTask = () => {
    const nextIndex = (foregroundTaskIndex + 1) % backgroundTaskLabels.length;
    setForegroundTaskIndex(nextIndex);
    setSystemMessage(
      `${isIOS ? 'Background refresh' : 'Foreground service'} moved to ${backgroundTaskLabels[
        nextIndex
      ].toLowerCase()}.`,
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 6</Text>
          <Text style={styles.title}>Device & System</Text>
          <Text style={styles.body}>
            Sensors, system APIs, app lifecycle and {platformLabel}-first platform surfaces in one
            device lab.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>38 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Live telemetry</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{androidPalette.name}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{effectiveTheme} preview</Text></View>
          </View>
          <Text style={styles.note}>{systemMessage}</Text>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Location & Motion</Text>
          <Text style={styles.sectionText}>GPS with map, accelerometer and gyroscope streaming.</Text>
        </View>
        <View style={styles.grid}>
          <Card
            title="GPS / Geolocation"
            subtitle="Mock route, accuracy, speed and altitude."
            tone={Colors.primary}
            width={fullWidth}
            actionLabel={tracking ? 'Pause' : 'Resume'}
            onAction={() => setTracking(previous => !previous)}>
            <View style={styles.map}>
              {GRID_MARKS.map(mark => (
                <React.Fragment key={mark}>
                  <View style={[styles.vLine, {left: `${mark}%`}]} />
                  <View style={[styles.hLine, {top: `${mark}%`}]} />
                </React.Fragment>
              ))}
              {route.map((point, index) => (
                <View key={`${point.x}-${point.y}-${index}`} style={[styles.dot, {left: `${point.x}%`, top: `${point.y}%`, opacity: 0.35 + index / route.length}]} />
              ))}
              <View style={[styles.current, {left: `${currentPoint.x}%`, top: `${currentPoint.y}%`}]} />
              <View style={styles.legend}><Text style={styles.legendText}>{tracking ? 'Tracking active' : 'Tracking paused'}</Text></View>
            </View>
            <View style={styles.chips}>
              {[
                ['Lat', location.lat.toFixed(5), Colors.primary],
                ['Lng', location.lng.toFixed(5), Colors.secondary],
                ['Speed', `${location.speed.toFixed(1)} km/h`, Colors.success],
                ['Accuracy', `${location.accuracy.toFixed(1)} m`, Colors.warning],
                ['Altitude', `${location.altitude} m`, Colors.accent],
              ].map(([label, value, tone]) => (
                <View key={label} style={[styles.chip, {borderColor: String(tone) + '33'}]}>
                  <Text style={styles.chipLabel}>{label}</Text>
                  <Text style={[styles.chipValue, {color: String(tone)}]}>{value}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card title="Accelerometer" subtitle="Three-axis gravity feed." tone={Colors.success} width={cardWidth}>
            <Meter label="X axis" value={`${accel.x > 0 ? '+' : ''}${accel.x.toFixed(2)} g`} progress={(Math.abs(accel.x) / 1.2) * 100} tone={Colors.primary} />
            <Meter label="Y axis" value={`${accel.y > 0 ? '+' : ''}${accel.y.toFixed(2)} g`} progress={(Math.abs(accel.y) / 1.2) * 100} tone={Colors.secondary} />
            <Meter label="Z axis" value={`${accel.z > 0 ? '+' : ''}${accel.z.toFixed(2)} g`} progress={(Math.abs(accel.z) / 1.2) * 100} tone={Colors.success} />
            <Text style={styles.note}>
              Peak force {(Math.max(Math.abs(accel.x), Math.abs(accel.y), Math.abs(accel.z)) * 9.81).toFixed(1)} m/s^2
            </Text>
          </Card>

          <Card title="Gyroscope" subtitle="Pitch, roll and yaw rotation." tone={Colors.secondary} width={cardWidth}>
            <View style={styles.ring}>
              <View style={styles.crossV} />
              <View style={styles.crossH} />
              <View style={[styles.plate, {transform: [{rotate: `${gyro.z}deg`}]}]}><View style={styles.plateNeedle} /></View>
            </View>
            <Meter label="Pitch" value={`${gyro.x > 0 ? '+' : ''}${gyro.x.toFixed(0)} deg/s`} progress={(Math.abs(gyro.x) / 150) * 100} tone={Colors.primary} />
            <Meter label="Roll" value={`${gyro.y > 0 ? '+' : ''}${gyro.y.toFixed(0)} deg/s`} progress={(Math.abs(gyro.y) / 100) * 100} tone={Colors.warning} />
            <Meter label="Yaw" value={`${gyro.z.toFixed(0)} deg`} progress={(gyro.z / 360) * 100} tone={Colors.secondary} />
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Direction & Environment</Text>
          <Text style={styles.sectionText}>Compass, ambient light, proximity and barometer.</Text>
        </View>
        <View style={styles.grid}>
          <Card title="Compass / Magnetometer" subtitle="Heading and cardinal direction." tone={Colors.warning} width={cardWidth}>
            <View style={styles.compassWrap}>
              <View style={styles.compass}>
                <Text style={[styles.compassLabel, styles.north]}>N</Text>
                <Text style={[styles.compassLabel, styles.east]}>E</Text>
                <Text style={[styles.compassLabel, styles.south]}>S</Text>
                <Text style={[styles.compassLabel, styles.west]}>W</Text>
                <View style={[styles.needleWrap, {transform: [{rotate: `${heading}deg`}]}]}>
                  <View style={styles.needleHead} />
                  <View style={styles.needleTail} />
                </View>
                <View style={styles.hub} />
              </View>
              <Text style={styles.compassValue}>{heading} deg</Text>
              <Text style={styles.note}>{cardinal(heading)} heading</Text>
            </View>
          </Card>
          <Card title="Ambient Light" subtitle="Lux meter with adaptive preview." tone={Colors.primary} width={cardWidth}>
            <View style={[styles.preview, {backgroundColor: `rgba(255, 240, 180, ${clamp(lux / 1200, 0.18, 0.95)})`}]}><Text style={styles.previewText}>{lux} lux</Text></View>
            <Meter label="Exposure" value={`${lightPercent}%`} progress={lightPercent} tone={Colors.warning} />
            <Text style={styles.note}>Brightness shifts between indoor and outdoor profiles.</Text>
          </Card>
          <Card title="Proximity" subtitle="Near / far state for call gestures." tone={Colors.error} width={cardWidth}>
            <View style={styles.row}>
              <View style={[styles.orb, {backgroundColor: near ? Colors.error + '22' : Colors.success + '18', borderColor: near ? Colors.error : Colors.success}]}><View style={[styles.orbCore, {backgroundColor: near ? Colors.error : Colors.success}]} /></View>
              <View style={styles.rowCopy}>
                <Text style={styles.bigValue}>{near ? 'Near' : 'Far'}</Text>
                <Text style={styles.note}>{near ? 'Sensor blocked. Screen dim and touch guard can trigger.' : 'Sensor clear. Motion interactions remain active.'}</Text>
              </View>
            </View>
          </Card>
          <Card title="Barometer" subtitle="Pressure estimate and altitude." tone={Colors.accent} width={cardWidth}>
            <Meter label="Pressure" value={`${pressure.toFixed(1)} hPa`} progress={pressurePercent} tone={Colors.accent} />
            <View style={styles.chips}>
              <View style={[styles.chip, {borderColor: Colors.primary + '33'}]}><Text style={styles.chipLabel}>Sea level</Text><Text style={[styles.chipValue, {color: Colors.primary}]}>1013.3 hPa</Text></View>
              <View style={[styles.chip, {borderColor: Colors.accent + '33'}]}><Text style={styles.chipLabel}>Altitude</Text><Text style={[styles.chipValue, {color: Colors.accent}]}>{altitudeFromPressure} m</Text></View>
            </View>
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Hardware Actions</Text>
          <Text style={styles.sectionText}>Haptics, NFC, Bluetooth and biometrics.</Text>
        </View>
        <View style={styles.grid}>
          <Card
            title={hapticsCardTitle}
            subtitle={hapticsCardSubtitle}
            tone={Colors.success}
            width={cardWidth}>
            <View style={styles.wrap}>
              {HAPTICS.map(preset => (
                <Pressable key={preset.label} onPress={() => triggerHaptic(preset.pattern, preset.label)} style={[styles.smallAction, {borderColor: preset.tone + '44'}]}>
                  <Text style={[styles.smallActionText, {color: preset.tone}]}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.note}>{lastHaptic}</Text>
          </Card>
          <Card title="NFC" subtitle="Tag scan preview with payload history." tone={Colors.warning} width={cardWidth} actionLabel={nfcScanning ? 'Scanning...' : 'Scan tag'} onAction={scanNfc}>
            <View style={[styles.scanBox, {borderColor: nfcScanning ? Colors.warning : Colors.border, backgroundColor: nfcScanning ? Colors.warning + '14' : Colors.surface}]}>
              <Text style={styles.scanText}>{nfcScanning ? 'Reader energizing coil' : 'Bring a tag close to the reader'}</Text>
            </View>
            {tags.map(tag => (
              <View key={`${tag.id}-${tag.seenAt}`} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{tag.id}</Text>
                  <Text style={styles.listSubtitle}>{tag.type} - {tag.payload}</Text>
                </View>
                <Text style={styles.listMeta}>{tag.seenAt}</Text>
              </View>
            ))}
          </Card>
          <Card title="Bluetooth" subtitle="Discovery with signal strength." tone={Colors.primary} width={cardWidth} actionLabel={bluetoothScanning ? 'Scanning...' : 'Scan devices'} onAction={scanBluetooth}>
            {devices.map(device => (
              <View key={device.id} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{device.name}</Text>
                  <Text style={styles.listSubtitle}>{device.kind} - {device.connected ? 'Ready' : 'Nearby'}</Text>
                </View>
                <View style={styles.signalWrap}>
                  <View style={styles.signalBars}>
                    {[1, 2, 3, 4].map(step => (
                      <View key={step} style={[styles.signalBar, {height: 4 + step * 4, backgroundColor: device.strength >= step * 25 ? Colors.primary : Colors.border}]} />
                    ))}
                  </View>
                  <Text style={styles.listMeta}>{device.strength}%</Text>
                </View>
              </View>
            ))}
          </Card>
          <Card title="Biometrics" subtitle="Fingerprint and face gate preview." tone={Colors.secondary} width={cardWidth} actionLabel="Authenticate" onAction={() => setBioState(Math.random() > 0.24 ? 'success' : 'denied')}>
            <View style={[styles.status, bioState === 'success' ? styles.ok : bioState === 'denied' ? styles.fail : styles.idle]}>
              <Text style={styles.statusText}>{bioState === 'idle' ? 'Idle' : bioState === 'success' ? 'Approved' : 'Denied'}</Text>
            </View>
            <Text style={styles.bioMode}>{bioMode}</Text>
            <Text style={styles.note}>
              {bioState === 'success' ? 'Secure enclave check passed. Session may continue.' : bioState === 'denied' ? 'Auth failed. Try again or fall back to PIN.' : 'Waiting for an auth request.'}
            </Text>
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <Text style={styles.sectionText}>{systemActionsCopy}</Text>
        </View>
        <View style={styles.grid}>
          <Card title="Clipboard" subtitle="Keep a local preview buffer and sync the clipboard when available." tone={Colors.primary} width={cardWidth}>
            <TextInput
              style={styles.input}
              value={clipboardText}
              onChangeText={setClipboardText}
              placeholder="Paste text or a route"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={() => void copyClipboard()}>
                <Text style={styles.smallActionTextActive}>Copy</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={pasteClipboard}>
                <Text style={styles.smallActionText}>Paste</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => setClipboardText(filesDeepLink)}>
                <Text style={styles.smallActionText}>Seed link</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>Last buffer: {clipboardCache}</Text>
          </Card>

          <Card title="Share & Deep Links" subtitle="Share payload previews and route internally while showing the matching deep link URL." tone={Colors.secondary} width={cardWidth}>
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={() => void sharePayload('text')}>
                <Text style={styles.smallActionText}>Share text</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => void sharePayload('url')}>
                <Text style={styles.smallActionText}>Share URL</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => void sharePayload('image')}>
                <Text style={styles.smallActionText}>Share image</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => openDeepLink('files')}>
                <Text style={styles.smallActionText}>Go Files</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => openDeepLink('network')}>
                <Text style={styles.smallActionText}>Go Network</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>
              {linksNote}
            </Text>
          </Card>

          <Card title="Notifications" subtitle="Local reminders and remote push simulation in one feed." tone={Colors.warning} width={cardWidth}>
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={() => pushNotification('Local')}>
                <Text style={styles.smallActionText}>Local alert</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => pushNotification('Push')}>
                <Text style={styles.smallActionText}>Push payload</Text>
              </Pressable>
              <Pressable style={[styles.smallAction, pushEnabled && styles.smallActionActive]} onPress={() => setPushEnabled(previous => !previous)}>
                <Text style={pushEnabled ? styles.smallActionTextActive : styles.smallActionText}>
                  {pushEnabled ? 'Push on' : 'Push off'}
                </Text>
              </Pressable>
            </View>
            {notifications.map(item => (
              <View key={item.id} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item.kind} - {item.title}</Text>
                  <Text style={styles.listSubtitle}>{item.body}</Text>
                </View>
                <Text style={styles.listMeta}>{item.time}</Text>
              </View>
            ))}
          </Card>

          <Card title="Permissions" subtitle="Request and inspect runtime permission gates." tone={Colors.error} width={cardWidth}>
            <Meter
              label="Granted"
              value={`${permissionCount}/3`}
              progress={(permissionCount / 3) * 100}
              tone={Colors.warning}
            />
            <View style={styles.wrap}>
              {(['camera', 'location', 'notifications'] as PermissionKey[]).map(key => (
                <Pressable
                  key={key}
                  style={[styles.smallAction, permissions[key] && styles.smallActionActive]}
                  onPress={() => requestPermission(key)}>
                  <Text style={permissions[key] ? styles.smallActionTextActive : styles.smallActionText}>
                    {permissions[key] ? `Revoke ${key}` : `Grant ${key}`}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.note}>
              Camera {permissions.camera ? 'on' : 'off'} - Location {permissions.location ? 'on' : 'off'} - Notifications {permissions.notifications ? 'on' : 'off'}
            </Text>
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Runtime & UX</Text>
          <Text style={styles.sectionText}>Battery, network, lifecycle, theme, i18n, accessibility, orientation and keyboard flow.</Text>
        </View>
        <View style={styles.grid}>
          <Card title="Battery & Network" subtitle="Runtime health with connection status." tone={Colors.success} width={cardWidth}>
            <Meter label="Battery" value={`${batteryLevel}%`} progress={batteryPercent} tone={Colors.success} />
            <View style={styles.chips}>
              <View style={[styles.chip, {borderColor: Colors.success + '33'}]}><Text style={styles.chipLabel}>Status</Text><Text style={[styles.chipValue, {color: Colors.success}]}>{online ? 'Online' : 'Offline'}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.primary + '33'}]}><Text style={styles.chipLabel}>Link</Text><Text style={[styles.chipValue, {color: Colors.primary}]}>{connectionType}</Text></View>
            </View>
          </Card>

          <Card title="Device Info & App State" subtitle="OS facts, viewport and lifecycle state." tone={Colors.primary} width={cardWidth}>
            <View style={styles.chips}>
              <View style={[styles.chip, {borderColor: Colors.primary + '33'}]}><Text style={styles.chipLabel}>OS</Text><Text style={[styles.chipValue, {color: Colors.primary}]}>{Platform.OS} {String(Platform.Version)}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.secondary + '33'}]}><Text style={styles.chipLabel}>Viewport</Text><Text style={[styles.chipValue, {color: Colors.secondary}]}>{Math.round(width)} x {Math.round(height)}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.warning + '33'}]}><Text style={styles.chipLabel}>Engine</Text><Text style={[styles.chipValue, {color: Colors.warning}]}>{engineLabel}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.accent + '33'}]}><Text style={styles.chipLabel}>App state</Text><Text style={[styles.chipValue, {color: Colors.accent}]}>{appStateLabel}</Text></View>
            </View>
          </Card>

          <Card title="Theme & Localization" subtitle="Dark or light preview plus locale switching." tone={Colors.secondary} width={cardWidth}>
            <View style={[styles.previewCard, effectiveTheme === 'dark' ? styles.previewDark : styles.previewLight]}>
              <Text style={[styles.previewTitle, effectiveTheme === 'dark' ? styles.previewTitleDark : styles.previewTitleLight]}>
                {localizedCopy.title}
              </Text>
              <Text style={[styles.previewBody, effectiveTheme === 'dark' ? styles.previewBodyDark : styles.previewBodyLight]}>
                {localizedCopy.body}
              </Text>
            </View>
            <View style={styles.wrap}>
              {(['system', 'dark', 'light'] as const).map(mode => (
                <Pressable key={mode} style={[styles.smallAction, themeMode === mode && styles.smallActionActive]} onPress={() => setThemeMode(mode)}>
                  <Text style={themeMode === mode ? styles.smallActionTextActive : styles.smallActionText}>{mode}</Text>
                </Pressable>
              ))}
              {(['en-US', 'pt-BR', 'es-ES'] as const).map(nextLocale => (
                <Pressable key={nextLocale} style={[styles.smallAction, locale === nextLocale && styles.smallActionActive]} onPress={() => setLocale(nextLocale)}>
                  <Text style={locale === nextLocale ? styles.smallActionTextActive : styles.smallActionText}>{nextLocale}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <Card title="Accessibility & Orientation" subtitle="Screen reader, reduce motion, contrast and layout direction." tone={Colors.warning} width={cardWidth}>
            <View style={styles.chips}>
              <View style={[styles.chip, {borderColor: Colors.warning + '33'}]}><Text style={styles.chipLabel}>Reader</Text><Text style={[styles.chipValue, {color: Colors.warning}]}>{screenReaderEnabled ? 'On' : 'Off'}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.error + '33'}]}><Text style={styles.chipLabel}>Motion</Text><Text style={[styles.chipValue, {color: Colors.error}]}>{reduceMotionEnabled ? 'Reduced' : 'Full'}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.primary + '33'}]}><Text style={styles.chipLabel}>Orientation</Text><Text style={[styles.chipValue, {color: Colors.primary}]}>{orientation}</Text></View>
              <View style={[styles.chip, {borderColor: Colors.success + '33'}]}><Text style={styles.chipLabel}>Font scale</Text><Text style={[styles.chipValue, {color: Colors.success}]}>{fontScale.toFixed(2)}x</Text></View>
            </View>
            <View style={styles.wrap}>
              <Pressable style={[styles.smallAction, highContrast && styles.smallActionActive]} onPress={() => setHighContrast(previous => !previous)}>
                <Text style={highContrast ? styles.smallActionTextActive : styles.smallActionText}>
                  {highContrast ? 'Contrast on' : 'Contrast off'}
                </Text>
              </Pressable>
            </View>
          </Card>

          <Card title="Keyboard & Splash" subtitle="Keyboard handling and splash-state preview." tone={Colors.accent} width={fullWidth}>
            <TextInput
              style={styles.input}
              value={keyboardText}
              onChangeText={setKeyboardText}
              placeholder="Type here to raise the keyboard"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={() => Keyboard.dismiss()}>
                <Text style={styles.smallActionText}>Dismiss keyboard</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => setKeyboardText('')}>
                <Text style={styles.smallActionText}>Clear text</Text>
              </Pressable>
            </View>
            <View style={styles.splashRow}>
              <View style={[styles.splashOrb, splashStep === 0 && styles.splashActive]} />
              <View style={[styles.splashOrb, splashStep === 1 && styles.splashActive]} />
              <View style={[styles.splashOrb, splashStep === 2 && styles.splashActive]} />
            </View>
            <Text style={styles.note}>
              Keyboard {keyboardVisible ? 'visible' : 'hidden'} - Splash state {['Boot', 'Hydrate', 'Ready'][splashStep]}
            </Text>
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{platformSectionTitle}</Text>
          <Text style={styles.sectionText}>{platformSectionCopy}</Text>
        </View>
        <View style={styles.grid}>
          <Card
            title={designSystemTitle}
            subtitle={designSystemSubtitle}
            tone={androidPalette.primary}
            width={fullWidth}
            actionLabel="Shuffle palette"
            onAction={cyclePalette}>
            <View style={[styles.materialFrame, {backgroundColor: androidPalette.wallpaper}]}>
              <View
                style={[
                  styles.materialStatus,
                  {backgroundColor: edgeToEdge ? 'transparent' : androidPalette.surface},
                ]}>
                <Text style={[styles.materialStatusText, {color: androidPalette.onSurface}]}>09:41</Text>
                <View style={styles.materialStatusDots}>
                  <View style={[styles.materialDot, {backgroundColor: androidPalette.onSurface}]} />
                  <View style={[styles.materialDot, {backgroundColor: androidPalette.onSurface, opacity: 0.72}]} />
                  <View style={[styles.materialDot, {backgroundColor: androidPalette.onSurface, opacity: 0.44}]} />
                </View>
              </View>
              <View
                style={[
                  styles.materialSurface,
                  {
                    backgroundColor: androidPalette.surface,
                    borderColor: androidPalette.primary + '44',
                    marginTop: edgeToEdge ? 18 : 8,
                  },
                ]}>
                <Text style={[styles.materialKicker, {color: androidPalette.primary}]}>
                  {isIOS ? 'iOS chrome' : 'Material 3'}
                </Text>
                <Text style={[styles.materialHeadline, {color: androidPalette.onSurface}]}>Adaptive color roles</Text>
                <Text style={[styles.materialCopy, {color: androidPalette.onSurface}]}>
                  {designSystemCopy}
                </Text>
                <View style={styles.materialSwatches}>
                  {[
                    ['Primary', androidPalette.primary],
                    ['Secondary', androidPalette.secondary],
                    ['Tertiary', androidPalette.tertiary],
                    ['Surface', androidPalette.surfaceAlt],
                  ].map(([label, tone]) => (
                    <View key={label} style={styles.materialSwatch}>
                      <View style={[styles.materialSwatchTone, {backgroundColor: String(tone)}]} />
                      <Text style={[styles.materialSwatchLabel, {color: androidPalette.onSurface}]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View
                style={[
                  styles.materialNav,
                  {backgroundColor: edgeToEdge ? 'transparent' : androidPalette.surface},
                ]}>
                <View style={[styles.materialHandle, {backgroundColor: androidPalette.onSurface}]} />
              </View>
            </View>
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, edgeToEdge && styles.smallActionActive]}
                onPress={toggleEdgeMode}>
                <Text style={edgeToEdge ? styles.smallActionTextActive : styles.smallActionText}>
                  {edgeToEdge ? 'Edge on' : 'Edge off'}
                </Text>
              </Pressable>
              <View style={[styles.smallAction, {borderColor: androidPalette.primary + '55'}]}>
                <Text style={[styles.smallActionText, {color: androidPalette.primary}]}>
                  {isIOS ? 'Semantic colors' : 'Dynamic colors'}
                </Text>
              </View>
              <View style={[styles.smallAction, {borderColor: androidPalette.secondary + '55'}]}>
                <Text style={[styles.smallActionText, {color: androidPalette.secondary}]}>
                  {isIOS ? 'Tint set' : 'Palette'}: {androidPalette.name}
                </Text>
              </View>
            </View>
            <Text style={styles.note}>
              Insets preview: {edgeToEdge ? 'transparent bars with protected content paddings' : 'opaque bars with fixed safe zones'}.
            </Text>
          </Card>

          <Card
            title={shellCardTitle}
            subtitle={shellCardSubtitle}
            tone={androidPalette.secondary}
            width={fullWidth}>
            <View style={[styles.bottomBarStage, {backgroundColor: androidPalette.surfaceAlt}]}>
              {fabExpanded ? (
                <View style={styles.fabMenu}>
                  {quickActionChoices.map(action => (
                    <Pressable
                      key={action}
                      style={[styles.fabMenuItem, fabAction === action && styles.fabMenuItemActive]}
                      onPress={() => selectFabAction(action)}>
                      <Text style={fabAction === action ? styles.fabMenuTextActive : styles.fabMenuText}>
                        {action}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View style={styles.bottomBarInfo}>
                <Text style={[styles.materialKicker, {color: androidPalette.secondary}]}>
                  {shellKicker}
                </Text>
                <Text style={[styles.materialHeadline, {color: androidPalette.onSurface}]}>
                  Quick action: {fabAction}
                </Text>
                <Text style={[styles.materialCopy, {color: androidPalette.onSurface}]}>
                  {shellCardCopy}
                </Text>
              </View>
              <View style={[styles.bottomBar, {backgroundColor: androidPalette.surface}]}>
                {bottomTabs.slice(0, 2).map(tab => (
                  <Pressable key={tab} style={styles.bottomTab} onPress={() => setBottomTab(tab)}>
                    <Text style={[styles.bottomTabText, bottomTab === tab && {color: androidPalette.primary}]}>
                      {tab}
                    </Text>
                  </Pressable>
                ))}
                <View style={styles.bottomTabGap} />
                {bottomTabs.slice(2).map(tab => (
                  <Pressable key={tab} style={styles.bottomTab} onPress={() => setBottomTab(tab)}>
                    <Text style={[styles.bottomTabText, bottomTab === tab && {color: androidPalette.primary}]}>
                      {tab}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[styles.fabButton, {backgroundColor: androidPalette.secondary}]}
                onPress={() => setFabExpanded(previous => !previous)}>
                <Text style={styles.fabButtonText}>{fabExpanded ? 'x' : '+'}</Text>
              </Pressable>
            </View>
          </Card>

          <Card
            title="Swipe Actions"
            subtitle="List items expose archive, pin and mute gestures."
            tone={androidPalette.tertiary}
            width={cardWidth}>
            {ANDROID_SWIPE_ITEMS.map(item => {
              const active = swipedItem === item.id;
              return (
                <View key={item.id} style={styles.swipeShell}>
                  <View style={styles.swipeRail}>
                    {(['Archive', 'Pin', 'Mute'] as const).map(action => (
                      <Pressable
                        key={action}
                        style={styles.swipeRailButton}
                        onPress={() => runSwipeAction(item, action)}>
                        <Text style={styles.swipeRailText}>{action}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    style={[styles.swipeCard, active && styles.swipeCardShifted]}
                    onPress={() => toggleSwipeRow(item.id)}>
                    <View style={[styles.swipeAccent, {backgroundColor: item.accent}]} />
                    <View style={styles.listCopy}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.listMeta}>{active ? 'Open' : 'Swipe'}</Text>
                  </Pressable>
                </View>
              );
            })}
            <Text style={styles.note}>{swipeActionsNote}</Text>
          </Card>

          <Card
            title={shortcutsCardTitle}
            subtitle={shortcutsCardSubtitle}
            tone={Colors.primary}
            width={cardWidth}>
            <View style={styles.wrap}>
              {ANDROID_SHORTCUTS.map(shortcut => (
                <Pressable
                  key={shortcut.id}
                  style={[styles.smallAction, {borderColor: shortcut.tone + '55'}]}
                  onPress={() => triggerShortcut(shortcut)}>
                  <Text style={[styles.smallActionText, {color: shortcut.tone}]}>{shortcut.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.pipStage, {backgroundColor: androidPalette.surfaceAlt}]}>
              <View style={[styles.pipPlayer, pipMode === 'PiP' && styles.pipPlayerDimmed]}>
                <Text style={styles.pipTitle}>Release walkthrough.mp4</Text>
                <Text style={styles.pipMeta}>12:48 - autoplay ready</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, {width: '54%', backgroundColor: androidPalette.primary}]} />
                </View>
              </View>
              {pipMode === 'PiP' ? (
                <View style={[styles.pipWindow, {borderColor: androidPalette.primary}]}>
                  <Text style={styles.pipWindowTitle}>PiP</Text>
                  <Text style={styles.pipWindowMeta}>Sync status</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, pipMode === 'PiP' && styles.smallActionActive]}
                onPress={togglePip}>
                <Text style={pipMode === 'PiP' ? styles.smallActionTextActive : styles.smallActionText}>
                  {pipMode === 'PiP' ? 'Exit PiP' : 'Enter PiP'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{shortcutLog}</Text>
          </Card>

          <Card
            title="Splash Screen API"
            subtitle={splashCardSubtitle}
            tone={Colors.warning}
            width={cardWidth}>
            <View style={[styles.androidSplash, {backgroundColor: androidPalette.surfaceAlt}]}>
              <View style={[styles.androidSplashMask, {backgroundColor: androidPalette.primary + '1f'}]}>
                <View style={[styles.androidSplashLogo, {backgroundColor: androidPalette.primary}]} />
              </View>
              <Text style={styles.androidSplashTitle}>{launchMode}</Text>
              <Text style={styles.androidSplashCopy}>
                {splashCardCopy}
              </Text>
            </View>
            <View style={styles.wrap}>
              {splashModes.map(mode => (
                <Pressable
                  key={mode}
                  style={[styles.smallAction, launchMode === mode && styles.smallActionActive]}
                  onPress={() => setLaunchMode(mode)}>
                  <Text style={launchMode === mode ? styles.smallActionTextActive : styles.smallActionText}>
                    {mode}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <Card
            title={notificationsCardTitle}
            subtitle={notificationsCardSubtitle}
            tone={Colors.success}
            width={cardWidth}>
            {notificationGroups.map(channel => (
              <View key={channel.id} style={styles.channelRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{channel.label}</Text>
                  <Text style={styles.listSubtitle}>{channel.importance} importance</Text>
                </View>
                <Pressable
                  style={[styles.smallAction, channelState[channel.id] && styles.smallActionActive]}
                  onPress={() => toggleChannel(channel.id)}>
                  <Text style={channelState[channel.id] ? styles.smallActionTextActive : styles.smallActionText}>
                    {channelState[channel.id] ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            ))}
            <Meter
              label={notificationsMeterLabel}
              value={foregroundActive ? `${foregroundProgress}%` : 'Paused'}
              progress={foregroundActive ? foregroundProgress : 0}
              tone={foregroundActive ? Colors.success : Colors.textMuted}
            />
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, foregroundActive && styles.smallActionActive]}
                onPress={toggleForegroundService}>
                <Text style={foregroundActive ? styles.smallActionTextActive : styles.smallActionText}>
                  {notificationsToggleLabel}
                </Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={cycleForegroundTask}>
                <Text style={styles.smallActionText}>{notificationsNextLabel}</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>
              {enabledChannelCount}/{notificationGroups.length} {isIOS ? 'categories' : 'channels'} enabled - indicator bound to {foregroundTask.toLowerCase()}.
            </Text>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg},
  hero: {backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, gap: Spacing.md},
  eyebrow: {fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: Colors.warning},
  title: {fontSize: 30, fontWeight: '900', color: Colors.textPrimary},
  body: {fontSize: 14, lineHeight: 22, color: Colors.textSecondary},
  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  pill: {backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border},
  pillText: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  sectionHead: {gap: 4},
  sectionTitle: {fontSize: 22, fontWeight: '800', color: Colors.textPrimary},
  sectionText: {fontSize: 13, lineHeight: 20, color: Colors.textSecondary},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  card: {backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md},
  cardCopy: {flex: 1, gap: 4},
  cardTitle: {fontSize: 18, fontWeight: '800', color: Colors.textPrimary},
  cardSubtitle: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  action: {alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, backgroundColor: Colors.surface},
  actionText: {fontSize: 12, fontWeight: '700'},
  map: {height: 196, borderRadius: Radius.xl, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden'},
  vLine: {position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: Colors.border, opacity: 0.45},
  hLine: {position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.border, opacity: 0.45},
  dot: {position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary, marginLeft: -3.5, marginTop: -3.5},
  current: {position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.success, borderWidth: 3, borderColor: Colors.white, marginLeft: -8, marginTop: -8},
  legend: {position: 'absolute', left: 12, bottom: 12, backgroundColor: Colors.overlay, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full},
  legendText: {fontSize: 11, fontWeight: '700', color: Colors.white},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  chip: {minWidth: 88, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 2},
  chipLabel: {fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.textSecondary, textTransform: 'uppercase'},
  chipValue: {fontSize: 14, fontWeight: '700'},
  meter: {gap: 8},
  meterRow: {flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm},
  meterLabel: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  meterValue: {fontSize: 12, fontWeight: '700'},
  track: {height: 8, borderRadius: Radius.full, backgroundColor: Colors.border, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: Radius.full},
  note: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  ring: {alignSelf: 'center', width: 156, height: 156, borderRadius: 78, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: Colors.bg},
  crossV: {position: 'absolute', top: 18, bottom: 18, width: 1, backgroundColor: Colors.border},
  crossH: {position: 'absolute', left: 18, right: 18, height: 1, backgroundColor: Colors.border},
  plate: {width: 90, height: 90, borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.secondary, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 10, backgroundColor: Colors.secondary + '10'},
  plateNeedle: {width: 3, height: 30, borderRadius: Radius.full, backgroundColor: Colors.secondary},
  compassWrap: {alignItems: 'center', gap: Spacing.md},
  compass: {width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', position: 'relative'},
  compassLabel: {position: 'absolute', fontSize: 12, fontWeight: '800', color: Colors.textSecondary},
  north: {top: 12},
  east: {right: 14},
  south: {bottom: 12},
  west: {left: 14},
  needleWrap: {width: 16, height: 126, alignItems: 'center', justifyContent: 'space-between'},
  needleHead: {width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 44, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: Colors.error},
  needleTail: {width: 6, height: 42, borderRadius: Radius.full, backgroundColor: Colors.primary},
  hub: {position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.white, borderWidth: 3, borderColor: Colors.warning},
  compassValue: {fontSize: 20, fontWeight: '900', color: Colors.textPrimary},
  preview: {height: 124, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center'},
  previewText: {fontSize: 24, fontWeight: '900', color: '#463b20'},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing.lg},
  rowCopy: {flex: 1, gap: 6},
  orb: {width: 84, height: 84, borderRadius: 42, borderWidth: 2, justifyContent: 'center', alignItems: 'center'},
  orbCore: {width: 26, height: 26, borderRadius: 13},
  bigValue: {fontSize: 22, fontWeight: '900', color: Colors.textPrimary},
  wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  smallAction: {paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, backgroundColor: Colors.surface},
  smallActionText: {fontSize: 12, fontWeight: '800'},
  smallActionActive: {backgroundColor: Colors.primary},
  smallActionTextActive: {fontSize: 12, fontWeight: '800', color: Colors.white},
  input: {borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.surface, color: Colors.textPrimary, fontSize: 14},
  previewCard: {borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1},
  previewDark: {backgroundColor: Colors.bg, borderColor: Colors.border},
  previewLight: {backgroundColor: Colors.white, borderColor: Colors.border},
  previewTitle: {fontSize: 18, fontWeight: '800'},
  previewTitleDark: {color: Colors.white},
  previewTitleLight: {color: Colors.bg},
  previewBody: {fontSize: 13, lineHeight: 20},
  previewBodyDark: {color: Colors.textSecondary},
  previewBodyLight: {color: '#384152'},
  scanBox: {borderRadius: Radius.xl, borderWidth: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, alignItems: 'center', justifyContent: 'center'},
  scanText: {fontSize: 13, fontWeight: '700', color: Colors.textPrimary},
  listRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border},
  listCopy: {flex: 1, gap: 2},
  listTitle: {fontSize: 13, fontWeight: '800', color: Colors.textPrimary},
  listSubtitle: {fontSize: 11, lineHeight: 17, color: Colors.textSecondary},
  listMeta: {fontSize: 11, fontWeight: '700', color: Colors.textSecondary},
  signalWrap: {alignItems: 'flex-end', gap: 4},
  signalBars: {flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 24},
  signalBar: {width: 4, borderRadius: Radius.full},
  status: {alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full},
  idle: {backgroundColor: Colors.border},
  ok: {backgroundColor: Colors.success + '26'},
  fail: {backgroundColor: Colors.error + '24'},
  statusText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  bioMode: {fontSize: 26, fontWeight: '900', color: Colors.textPrimary},
  splashRow: {flexDirection: 'row', gap: Spacing.sm, alignItems: 'center'},
  splashOrb: {width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.border},
  splashActive: {backgroundColor: Colors.accent},
  materialFrame: {borderRadius: Radius.xl, padding: Spacing.md, minHeight: 232, gap: Spacing.sm},
  materialStatus: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingTop: 2},
  materialStatusText: {fontSize: 11, fontWeight: '700'},
  materialStatusDots: {flexDirection: 'row', gap: 4},
  materialDot: {width: 7, height: 7, borderRadius: 3.5},
  materialSurface: {borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md, flex: 1},
  materialKicker: {fontSize: 11, fontWeight: '800', letterSpacing: 1},
  materialHeadline: {fontSize: 20, fontWeight: '900'},
  materialCopy: {fontSize: 12, lineHeight: 18},
  materialSwatches: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  materialSwatch: {minWidth: 72, gap: 6},
  materialSwatchTone: {height: 34, borderRadius: Radius.lg, borderWidth: 1, borderColor: '#ffffff18'},
  materialSwatchLabel: {fontSize: 11, fontWeight: '700'},
  materialNav: {alignItems: 'center', paddingTop: 4, paddingBottom: 6},
  materialHandle: {width: 84, height: 5, borderRadius: Radius.full, opacity: 0.8},
  bottomBarStage: {borderRadius: Radius.xl, minHeight: 236, padding: Spacing.lg, justifyContent: 'flex-end', overflow: 'hidden'},
  bottomBarInfo: {gap: 6, marginBottom: 82},
  bottomBar: {height: 72, borderRadius: Radius.xl, borderWidth: 1, borderColor: '#ffffff12', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12},
  bottomTab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  bottomTabGap: {width: 72},
  bottomTabText: {fontSize: 12, fontWeight: '800', color: Colors.textSecondary},
  fabButton: {position: 'absolute', right: 20, bottom: 36, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center'},
  fabButtonText: {fontSize: 28, fontWeight: '700', color: Colors.bg},
  fabMenu: {position: 'absolute', right: 20, bottom: 112, gap: Spacing.sm, alignItems: 'flex-end'},
  fabMenuItem: {minWidth: 116, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border},
  fabMenuItemActive: {backgroundColor: Colors.secondary},
  fabMenuText: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  fabMenuTextActive: {fontSize: 12, fontWeight: '800', color: Colors.white},
  swipeShell: {position: 'relative', minHeight: 72, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface},
  swipeRail: {position: 'absolute', top: 0, right: 0, bottom: 0, width: 112, padding: 6, gap: 6, backgroundColor: Colors.bgCardAlt},
  swipeRailButton: {flex: 1, borderRadius: Radius.lg, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center'},
  swipeRailText: {fontSize: 11, fontWeight: '800', color: Colors.textPrimary},
  swipeCard: {minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: Colors.surfaceElevated},
  swipeCardShifted: {transform: [{translateX: -112}]},
  swipeAccent: {width: 10, alignSelf: 'stretch', borderRadius: Radius.full},
  pipStage: {minHeight: 188, borderRadius: Radius.xl, padding: Spacing.md, justifyContent: 'center'},
  pipPlayer: {borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, backgroundColor: Colors.bg, gap: Spacing.sm},
  pipPlayerDimmed: {opacity: 0.58},
  pipTitle: {fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
  pipMeta: {fontSize: 12, color: Colors.textSecondary},
  pipWindow: {position: 'absolute', right: 16, bottom: 16, width: 116, paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.lg, borderWidth: 1, backgroundColor: Colors.bgCard},
  pipWindowTitle: {fontSize: 12, fontWeight: '800', color: Colors.textPrimary},
  pipWindowMeta: {fontSize: 11, color: Colors.textSecondary},
  androidSplash: {borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl},
  androidSplashMask: {width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center'},
  androidSplashLogo: {width: 42, height: 42, borderRadius: 14},
  androidSplashTitle: {fontSize: 22, fontWeight: '900', color: Colors.textPrimary},
  androidSplashCopy: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary, textAlign: 'center'},
  channelRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border},
});
