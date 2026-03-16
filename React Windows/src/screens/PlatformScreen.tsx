import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AccessibilityInfo,
  AppState,
  Keyboard,
  Linking,
  NativeModules,
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
import {AcrylicCard} from '../components/common/AcrylicCard';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';
import type {HomeStackParamList} from '../navigation/types';

type Vec3 = {x: number; y: number; z: number};
type RoutePoint = {x: number; y: number};
type Device = {id: string; name: string; kind: string; strength: number; connected: boolean};
type Tag = {id: string; type: string; payload: string; seenAt: string};
type NotificationItem = {
  id: string;
  kind: 'Local' | 'Push';
  title: string;
  body: string;
  time: string;
};
type PermissionKey = 'camera' | 'location' | 'notifications';
type DesktopWindow = {
  id: string;
  title: string;
  state: 'Focused' | 'Secondary' | 'Pinned';
  size: string;
};
type DesktopToast = {
  id: string;
  title: string;
  body: string;
  time: string;
};
type CardProps = {
  title: string;
  subtitle: string;
  tone: string;
  width: number;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
};
type MeterProps = {label: string; value: string; progress: number; tone: string};
type Nav = NativeStackNavigationProp<HomeStackParamList>;

const BASE_LAT = -23.55052;
const BASE_LNG = -46.63331;
const GRID_MARKS = [20, 40, 60, 80];
const DEVICES: Omit<Device, 'strength' | 'connected'>[] = [
  {id: 'dev-1', name: 'Pixel Buds Pro', kind: 'Audio'},
  {id: 'dev-2', name: 'Studio Keyboard', kind: 'Input'},
  {id: 'dev-3', name: 'Vehicle Sync', kind: 'Automotive'},
  {id: 'dev-4', name: 'Thermal Printer', kind: 'Peripheral'},
];
const HAPTICS = [
  {label: 'Tap', pattern: 20, tone: Colors.primary},
  {label: 'Success', pattern: [0, 30, 40, 30], tone: Colors.success},
  {label: 'Alert', pattern: [0, 60, 45, 60], tone: Colors.warning},
  {label: 'SOS', pattern: [0, 100, 50, 100, 50, 100], tone: Colors.error},
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const stamp = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

const cardinal = (heading: number) =>
  heading < 45 || heading >= 315 ? 'N' : heading < 135 ? 'E' : heading < 225 ? 'S' : 'W';

function tryCopyToClipboard(value: string) {
  const clipboard =
    (globalThis as {
      navigator?: {clipboard?: {writeText?: (text: string) => Promise<void>}};
    }).navigator?.clipboard;

  if (clipboard?.writeText) {
    return clipboard.writeText(value).then(() => true).catch(() => false);
  }

  const nativeClipboard = (NativeModules as Record<string, {setString?: (text: string) => void}>)
    .Clipboard;

  if (nativeClipboard?.setString) {
    nativeClipboard.setString(value);
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}

function Card({title, subtitle, tone, width, actionLabel, onAction, children}: CardProps) {
  return (
    <View style={[styles.card, {width, borderColor: tone + '2e'}]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={[styles.action, {borderColor: tone + '44'}]}>
            <Text style={[styles.actionText, {color: tone}]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Meter({label, value, progress, tone}: MeterProps) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={[styles.meterValue, {color: tone}]}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, {width: `${clamp(progress, 0, 100)}%`, backgroundColor: tone}]} />
      </View>
    </View>
  );
}

export default function PlatformScreen() {
  const navigation = useNavigation<Nav>();
  const {width, height, fontScale} = useWindowDimensions();
  const systemScheme = useColorScheme();
  const fullWidth = width - Spacing.lg * 2;
  const cardWidth = width >= 840 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const orientation = width > height ? 'Landscape' : 'Portrait';

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
    {id: 'TAG-18F0', type: 'NTAG215', payload: 'device-profile:android-lab', seenAt: '09:08:44'},
  ]);
  const [bioState, setBioState] = useState<'idle' | 'success' | 'denied'>('idle');
  const [bioMode, setBioMode] = useState<'Fingerprint' | 'Face ID'>(
    Platform.OS === 'android' ? 'Fingerprint' : 'Face ID',
  );
  const [clipboardText, setClipboardText] = useState('cfd://platform/resources');
  const [clipboardCache, setClipboardCache] = useState('cfd://platform/resources');
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
  const [trayPinned, setTrayPinned] = useState(true);
  const [desktopToasts, setDesktopToasts] = useState<DesktopToast[]>([
    {
      id: 'toast-1',
      title: 'Taskbar synced',
      body: 'Desktop shell is pinned and ready to receive commands.',
      time: '09:34:10',
    },
    {
      id: 'toast-2',
      title: 'Widgets refreshed',
      body: 'Weather, calendar and stock cards pulled fresh data.',
      time: '09:31:22',
    },
  ]);
  const [desktopWindows, setDesktopWindows] = useState<DesktopWindow[]>([
    {id: 'main', title: 'Main Shell', state: 'Focused', size: '1280 x 820'},
    {id: 'inspector', title: 'Inspector', state: 'Secondary', size: '540 x 640'},
  ]);
  const [taskbarProgress, setTaskbarProgress] = useState(68);
  const [taskbarState, setTaskbarState] = useState<'Normal' | 'Paused' | 'Error'>('Normal');
  const [contextTarget, setContextTarget] = useState('Documents');
  const [contextOpen, setContextOpen] = useState(false);
  const [shortcutLog, setShortcutLog] = useState('Ctrl+Shift+P opened the desktop command palette.');
  const [activePath, setActivePath] = useState('C:\\Users\\mathe\\Documents\\Showcase');
  const [droppedFiles, setDroppedFiles] = useState([
    'package.json',
    'invoice-q1.pdf',
    'window-state.json',
  ]);
  const [registryPath, setRegistryPath] = useState(
    'HKCU\\Software\\CFDShowcase\\Windowing',
  );
  const [registryValue, setRegistryValue] = useState(
    'taskbar_mode=normal',
  );
  const [savedSetting, setSavedSetting] = useState(
    'window.mode=compact',
  );
  const [printQueue, setPrintQueue] = useState([
    'Print preview - 4 pages - queued',
    'Invoice export - 2 pages - completed',
  ]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const effectiveTheme =
    themeMode === 'system' ? systemScheme ?? (Platform.OS === 'android' ? 'dark' : 'light') : themeMode;
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
  const engineLabel = (globalThis as {HermesInternal?: object}).HermesInternal ? 'Hermes' : 'JavaScriptCore';

  const triggerHaptic = (pattern: number | readonly number[], label: string) => {
    setLastHaptic(`${label} pulse sent at ${stamp(new Date())}`);
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
        ? 'Copied to the system clipboard.'
        : 'Clipboard API unavailable. Stored in the local buffer.',
    );
  };

  const pasteClipboard = () => {
    setKeyboardText(clipboardCache);
    setSystemMessage('Pasted the latest copied value into the keyboard field.');
  };

  const sharePayload = async (kind: 'text' | 'url' | 'image') => {
    const payload =
      kind === 'text'
        ? {message: 'React ShowCase system resources are ready for QA handoff.'}
        : kind === 'url'
          ? {message: 'Open the device lab route', url: Platform.OS === 'android' ? 'cfdandroid://platform' : 'cfdwindows://platform'}
          : {message: 'Image payload preview: https://showcase.cfd.dev/assets/device-lab.png'};
    await Share.share(payload);
    setSystemMessage(`Share sheet opened for ${kind}.`);
  };

  const openDeepLink = async (target: 'files' | 'platform') => {
    const url =
      Platform.OS === 'android'
        ? `cfdandroid://${target}`
        : `cfdwindows://${target}`;

    try {
      await Linking.openURL(url);
      setSystemMessage(`Opened ${url}.`);
    } catch {
      setSystemMessage(`Deep link preview ready: ${url}`);
    }
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

  const queueDesktopToast = (title: string, body: string) => {
    const nextToast: DesktopToast = {
      id: `desktop-${Date.now()}`,
      title,
      body,
      time: stamp(new Date()),
    };
    setDesktopToasts(previous => [nextToast, ...previous].slice(0, 4));
    setSystemMessage(`${title} queued in the Windows notification center.`);
  };

  const openDesktopWindow = () => {
    const next = desktopWindows.length + 1;
    setDesktopWindows(previous => [
      ...previous,
      {
        id: `window-${next}`,
        title: `Utility ${next}`,
        state: 'Secondary',
        size: `${520 + next * 20} x ${420 + next * 18}`,
      },
    ]);
    setTaskbarProgress(previous => clamp(previous + 8, 0, 100));
  };

  const closeDesktopWindow = () => {
    setDesktopWindows(previous =>
      previous.length > 1 ? previous.slice(0, -1) : previous,
    );
    setTaskbarProgress(previous => clamp(previous - 6, 0, 100));
  };

  const runShortcut = (combo: string, effect: string) => {
    setShortcutLog(`${combo} ${effect}`);
    setSystemMessage(`${combo} executed.`);
  };

  const dropDesktopFile = (file: string) => {
    setDroppedFiles(previous => [file, ...previous.filter(item => item !== file)].slice(0, 5));
    setSystemMessage(`${file} added to the desktop drop zone.`);
  };

  const saveRegistry = () => {
    setSavedSetting(`${registryPath} :: ${registryValue}`);
    setSystemMessage('Registry and settings snapshot stored.');
  };

  const sendToPrinter = () => {
    const job = `Desktop report - ${2 + (printQueue.length % 4)} pages - queued`;
    setPrintQueue(previous => [job, ...previous].slice(0, 4));
    setTaskbarProgress(previous => clamp(previous + 5, 0, 100));
    queueDesktopToast('Print job sent', 'The shell forwarded the document to the default printer.');
  };

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 6</Text>
          <Text style={styles.title}>Device & System</Text>
          <Text style={styles.body}>
            Sensors, system APIs, app lifecycle and runtime capabilities in one cross-platform lab.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>27 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Live telemetry</Text></View>
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
          <Card title="Vibration / Haptics" subtitle="Preset pulse patterns." tone={Colors.success} width={cardWidth}>
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
                  <Text style={styles.listSubtitle}>{tag.type} · {tag.payload}</Text>
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
                  <Text style={styles.listSubtitle}>{device.kind} · {device.connected ? 'Ready' : 'Nearby'}</Text>
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
          <Text style={styles.sectionText}>Clipboard, sharing, deep links, notifications and permissions.</Text>
        </View>
        <View style={styles.grid}>
          <Card title="Clipboard" subtitle="Copy to the native clipboard and paste from the local buffer." tone={Colors.primary} width={cardWidth}>
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
              <Pressable style={styles.smallAction} onPress={() => setClipboardText(Platform.OS === 'android' ? 'cfdandroid://files' : 'cfdwindows://files')}>
                <Text style={styles.smallActionText}>Seed link</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>Last buffer: {clipboardCache}</Text>
          </Card>

          <Card title="Share & Deep Links" subtitle="Open the share sheet and route the app through URL handling." tone={Colors.secondary} width={cardWidth}>
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
              <Pressable style={styles.smallAction} onPress={() => void openDeepLink('files')}>
                <Text style={styles.smallActionText}>Open Files</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => void openDeepLink('platform')}>
                <Text style={styles.smallActionText}>Open Platform</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>
              Prefix: {Platform.OS === 'android' ? 'cfdandroid://' : 'cfdwindows://'}
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
          <Text style={styles.sectionTitle}>Windows Desktop</Text>
          <Text style={styles.sectionText}>
            Fluent shell surfaces, multi-window previews, tray flows and native desktop affordances.
          </Text>
        </View>
        <View style={styles.grid}>
          <Card
            title="Fluent Shell"
            subtitle="WinUI-like controls, acrylic surfaces and links to existing desktop routes."
            tone={Colors.primary}
            width={fullWidth}>
            <AcrylicCard style={styles.shellCard}>
              <Text style={styles.shellTitle}>NavigationView + Command Bar</Text>
              <View style={styles.wrap}>
                {['New tab', 'Pin pane', 'Share', 'Sync'].map(item => (
                  <View key={item} style={styles.shellChip}>
                    <Text style={styles.shellChipText}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.wrap}>
                <Pressable
                  style={[styles.smallAction, styles.smallActionActive]}
                  onPress={() => navigation.navigate('WindowControls')}>
                  <Text style={styles.smallActionTextActive}>Open Window & Grid</Text>
                </Pressable>
                <Pressable
                  style={styles.smallAction}
                  onPress={() => navigation.navigate('Widgets')}>
                  <Text style={styles.smallActionText}>Open Widgets</Text>
                </Pressable>
              </View>
            </AcrylicCard>
            <Text style={styles.note}>
              Acrylic, title bar customization and resize-responsive surfaces are live in the Windows shell routes.
            </Text>
          </Card>

          <Card
            title="System Tray & Toasts"
            subtitle="Pinned tray icon, badge toggles and notification center feed."
            tone={Colors.warning}
            width={cardWidth}>
            <View style={styles.trayRow}>
              <View style={[styles.trayIcon, trayPinned && styles.trayIconActive]} />
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{trayPinned ? 'Tray pinned' : 'Tray hidden'}</Text>
                <Text style={styles.listSubtitle}>
                  Badge {desktopToasts.length} · taskbar state {taskbarState}
                </Text>
              </View>
            </View>
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, trayPinned && styles.smallActionActive]}
                onPress={() => setTrayPinned(previous => !previous)}>
                <Text style={trayPinned ? styles.smallActionTextActive : styles.smallActionText}>
                  {trayPinned ? 'Hide tray' : 'Pin tray'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.smallAction}
                onPress={() =>
                  queueDesktopToast(
                    'Toast preview',
                    'System notifications can be staged from the desktop shell.',
                  )
                }>
                <Text style={styles.smallActionText}>System toast</Text>
              </Pressable>
            </View>
            {desktopToasts.map(item => (
              <View key={item.id} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listSubtitle}>{item.body}</Text>
                </View>
                <Text style={styles.listMeta}>{item.time}</Text>
              </View>
            ))}
          </Card>

          <Card
            title="Multi-window & Taskbar"
            subtitle="Secondary windows, pinned instances and taskbar progress states."
            tone={Colors.success}
            width={cardWidth}>
            <Meter
              label="Taskbar progress"
              value={`${taskbarProgress}%`}
              progress={taskbarProgress}
              tone={
                taskbarState === 'Error'
                  ? Colors.error
                  : taskbarState === 'Paused'
                    ? Colors.warning
                    : Colors.success
              }
            />
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={openDesktopWindow}>
                <Text style={styles.smallActionText}>Open window</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={closeDesktopWindow}>
                <Text style={styles.smallActionText}>Close last</Text>
              </Pressable>
              {(['Normal', 'Paused', 'Error'] as const).map(state => (
                <Pressable
                  key={state}
                  style={[styles.smallAction, taskbarState === state && styles.smallActionActive]}
                  onPress={() => setTaskbarState(state)}>
                  <Text style={taskbarState === state ? styles.smallActionTextActive : styles.smallActionText}>
                    {state}
                  </Text>
                </Pressable>
              ))}
            </View>
            {desktopWindows.map(windowItem => (
              <View key={windowItem.id} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{windowItem.title}</Text>
                  <Text style={styles.listSubtitle}>
                    {windowItem.state} · {windowItem.size}
                  </Text>
                </View>
                <Text style={styles.listMeta}>{windowItem.id}</Text>
              </View>
            ))}
          </Card>

          <Card
            title="Context Menu & Shortcuts"
            subtitle="Right-click target actions and keyboard command routing."
            tone={Colors.secondary}
            width={cardWidth}>
            <View style={styles.wrap}>
              {['Documents', 'Exports', 'Shortcuts'].map(item => (
                <Pressable
                  key={item}
                  style={[styles.smallAction, contextTarget === item && styles.smallActionActive]}
                  onPress={() => {
                    setContextTarget(item);
                    setContextOpen(true);
                  }}>
                  <Text style={contextTarget === item ? styles.smallActionTextActive : styles.smallActionText}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
            {contextOpen ? (
              <View style={styles.contextMenu}>
                {['Open', 'Pin to quick access', 'Rename', 'Properties'].map(action => (
                  <Text key={action} style={styles.contextLine}>
                    {contextTarget}: {action}
                  </Text>
                ))}
              </View>
            ) : null}
            <View style={styles.wrap}>
              <Pressable
                style={styles.smallAction}
                onPress={() => runShortcut('Ctrl+Shift+P', 'opened the desktop command palette.')}>
                <Text style={styles.smallActionText}>Ctrl+Shift+P</Text>
              </Pressable>
              <Pressable
                style={styles.smallAction}
                onPress={() => runShortcut('Alt+Enter', 'opened the properties flyout.')}>
                <Text style={styles.smallActionText}>Alt+Enter</Text>
              </Pressable>
              <Pressable
                style={styles.smallAction}
                onPress={() => runShortcut('Ctrl+W', 'closed the focused secondary window.')}>
                <Text style={styles.smallActionText}>Ctrl+W</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{shortcutLog}</Text>
          </Card>

          <Card
            title="Drag & Drop + File System"
            subtitle="Desktop drops, native path browsing and local file actions."
            tone={Colors.accent}
            width={cardWidth}>
            <View style={styles.dropZone}>
              <Text style={styles.dropTitle}>Drop files here</Text>
              <Text style={styles.listSubtitle}>{activePath}</Text>
            </View>
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={() => dropDesktopFile('contracts.docx')}>
                <Text style={styles.smallActionText}>Drop contracts.docx</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => dropDesktopFile('shell-state.json')}>
                <Text style={styles.smallActionText}>Drop shell-state.json</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => setActivePath('C:\\Users\\mathe\\Desktop\\Exports')}>
                <Text style={styles.smallActionText}>Open exports</Text>
              </Pressable>
            </View>
            {droppedFiles.map(file => (
              <View key={file} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{file}</Text>
                  <Text style={styles.listSubtitle}>Ready for native file operations</Text>
                </View>
                <Text style={styles.listMeta}>FS</Text>
              </View>
            ))}
          </Card>

          <Card
            title="Registry, Settings & Print"
            subtitle="Settings persistence, print queue and desktop shell integration."
            tone={Colors.error}
            width={cardWidth}>
            <TextInput
              style={styles.input}
              value={registryPath}
              onChangeText={setRegistryPath}
              placeholder="Registry path"
              placeholderTextColor={Colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={registryValue}
              onChangeText={setRegistryValue}
              placeholder="Registry value"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.wrap}>
              <Pressable style={styles.smallAction} onPress={saveRegistry}>
                <Text style={styles.smallActionText}>Save setting</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={sendToPrinter}>
                <Text style={styles.smallActionText}>Print report</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>Saved: {savedSetting}</Text>
            {printQueue.map(item => (
              <View key={item} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item}</Text>
                  <Text style={styles.listSubtitle}>Desktop queue and taskbar progress stay in sync.</Text>
                </View>
              </View>
            ))}
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
  shellCard: {padding: 0},
  shellTitle: {fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm},
  shellChip: {paddingHorizontal: 12, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.bgSmoke, borderWidth: 1, borderColor: Colors.border},
  shellChipText: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  trayRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.bgSmoke, borderWidth: 1, borderColor: Colors.border},
  trayIcon: {width: 18, height: 18, borderRadius: 5, backgroundColor: Colors.textMuted},
  trayIconActive: {backgroundColor: Colors.primary},
  contextMenu: {padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.bgSmoke, borderWidth: 1, borderColor: Colors.border, gap: 6},
  contextLine: {fontSize: 12, color: Colors.textPrimary, fontWeight: '600'},
  dropZone: {padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.accent, backgroundColor: Colors.accent + '10', gap: 4},
  dropTitle: {fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
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
});
