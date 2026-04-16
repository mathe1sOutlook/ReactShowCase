import {NativeModules} from 'react-native';
import {Colors} from '../../theme';

export type Vec3 = {x: number; y: number; z: number};
export type RoutePoint = {x: number; y: number};
export type Device = {
  id: string;
  name: string;
  kind: string;
  strength: number;
  connected: boolean;
};
export type Tag = {id: string; type: string; payload: string; seenAt: string};
export type NotificationItem = {
  id: string;
  kind: 'Local' | 'Push';
  title: string;
  body: string;
  time: string;
};
export type AndroidPalette = {
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
  surface: string;
  surfaceAlt: string;
  wallpaper: string;
  onSurface: string;
};
export type AndroidChannel = {
  id: string;
  label: string;
  importance: 'Min' | 'Default' | 'High';
  tone: string;
};
export type AndroidShortcut = {
  id: string;
  label: string;
  route: string;
  tone: string;
};
export type AndroidSwipeItem = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
};
export type PermissionKey = 'camera' | 'location' | 'notifications';

export const BASE_LAT = -23.55052;
export const BASE_LNG = -46.63331;
export const GRID_MARKS = [20, 40, 60, 80];
export const DEVICES: Omit<Device, 'strength' | 'connected'>[] = [
  {id: 'dev-1', name: 'Pixel Buds Pro', kind: 'Audio'},
  {id: 'dev-2', name: 'Studio Keyboard', kind: 'Input'},
  {id: 'dev-3', name: 'Vehicle Sync', kind: 'Automotive'},
  {id: 'dev-4', name: 'Thermal Printer', kind: 'Peripheral'},
];
export const HAPTICS = [
  {label: 'Tap', pattern: 20, tone: Colors.primary},
  {label: 'Success', pattern: [0, 30, 40, 30], tone: Colors.success},
  {label: 'Alert', pattern: [0, 60, 45, 60], tone: Colors.warning},
  {label: 'SOS', pattern: [0, 100, 50, 100, 50, 100], tone: Colors.error},
] as const;
export const ANDROID_PALETTES: AndroidPalette[] = [
  {
    name: 'Ocean Bloom',
    primary: '#7cdfff',
    secondary: '#ffb3de',
    tertiary: '#cabdff',
    surface: '#192238',
    surfaceAlt: '#223051',
    wallpaper: '#0f172a',
    onSurface: '#f8fafc',
  },
  {
    name: 'Citrus Punch',
    primary: '#ffd447',
    secondary: '#ff9164',
    tertiary: '#7ef7d0',
    surface: '#241b12',
    surfaceAlt: '#33251a',
    wallpaper: '#170f09',
    onSurface: '#fff3e0',
  },
  {
    name: 'Forest Neon',
    primary: '#91ffb4',
    secondary: '#8ad9ff',
    tertiary: '#f4b8ff',
    surface: '#13231c',
    surfaceAlt: '#1b3228',
    wallpaper: '#09150f',
    onSurface: '#effff4',
  },
];
export const ANDROID_SHORTCUTS: AndroidShortcut[] = [
  {
    id: 'capture',
    label: 'Quick Capture',
    route: 'cfdandroid://media',
    tone: Colors.primary,
  },
  {
    id: 'scan',
    label: 'Scan QR',
    route: 'cfdandroid://files',
    tone: Colors.warning,
  },
  {
    id: 'sync',
    label: 'Resume Sync',
    route: 'cfdandroid://platform',
    tone: Colors.success,
  },
];
export const ANDROID_CHANNELS: AndroidChannel[] = [
  {
    id: 'deployments',
    label: 'Deployments',
    importance: 'Default',
    tone: Colors.primary,
  },
  {id: 'messages', label: 'Messages', importance: 'High', tone: Colors.secondary},
  {id: 'sync', label: 'Background sync', importance: 'Min', tone: Colors.success},
];
export const ANDROID_SWIPE_ITEMS: AndroidSwipeItem[] = [
  {
    id: 'build-queue',
    title: 'Build queue',
    subtitle: '3 previews finished and ready for release notes.',
    accent: Colors.primary,
  },
  {
    id: 'offline-files',
    title: 'Offline files',
    subtitle: '12 documents cached for field mode.',
    accent: Colors.success,
  },
  {
    id: 'qa-alerts',
    title: 'QA alerts',
    subtitle: '2 regressions need triage before handoff.',
    accent: Colors.warning,
  },
];
export const ANDROID_FAB_ACTIONS = ['Compose', 'Capture', 'Sync'] as const;
export const ANDROID_BOTTOM_TABS = ['Home', 'Search', 'Files', 'Profile'] as const;
export const ANDROID_LAUNCH_STATES = ['Cold start', 'Warm start', 'Resume'] as const;
export const ANDROID_SERVICE_TASKS = ['Media sync', 'Location trace', 'Upload queue'] as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const stamp = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

export const cardinal = (heading: number) =>
  heading < 45 || heading >= 315 ? 'N' : heading < 135 ? 'E' : heading < 225 ? 'S' : 'W';

export function tryCopyToClipboard(value: string) {
  const clipboard =
    (globalThis as {
      navigator?: {clipboard?: {writeText?: (text: string) => Promise<void>}};
    }).navigator?.clipboard;

  if (clipboard?.writeText) {
    return clipboard.writeText(value).then(() => true).catch(() => false);
  }

  const nativeClipboard = (NativeModules as Record<
    string,
    {setString?: (text: string) => void}
  >).Clipboard;

  if (nativeClipboard?.setString) {
    nativeClipboard.setString(value);
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}
