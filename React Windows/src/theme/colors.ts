export const Colors = {
  // Fluent Design - Primary
  primary: '#0078d4',
  primaryLight: '#60cdff',
  primaryDark: '#005a9e',
  secondary: '#8764b8',
  accent: '#8764b8',
  accentLight: '#b4a0ff',

  // Backgrounds
  bg: '#f3f3f3',
  bgAlt: '#e8e8e8',
  bgLight: '#e8e8e8',
  bgCard: '#ffffff',
  bgCardAlt: '#f8f8f8',
  bgSmoke: 'rgba(255,255,255,0.72)',
  bgElevated: '#ffffff',
  surface: 'rgba(255,255,255,0.72)',
  surfaceElevated: '#ffffff',

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#616161',
  textMuted: '#9e9e9e',
  white: '#ffffff',

  // Semantic
  success: '#0f7b0f',
  warning: '#f59e0b',
  error: '#d13438',
  info: '#0078d4',

  // Borders & Surfaces
  border: 'rgba(0,0,0,0.06)',
  borderMedium: 'rgba(0,0,0,0.12)',
  borderLight: 'rgba(0,0,0,0.12)',
  shadow: 'rgba(0,0,0,0.08)',
  shadowDeep: 'rgba(0,0,0,0.14)',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.2)',

  // Acrylic
  acrylicBg: 'rgba(255,255,255,0.72)',
  acrylicBorder: 'rgba(255,255,255,0.6)',
  acrylicOverlay: 'rgba(255,255,255,0.45)',
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export function fluentShadow(elevation: 'sm' | 'md' | 'lg' = 'md') {
  const shadows = {
    sm: {shadowColor: Colors.shadow, shadowOffset: {width: 0, height: 1}, shadowOpacity: 1, shadowRadius: 3, elevation: 2},
    md: {shadowColor: Colors.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 1, shadowRadius: 8, elevation: 4},
    lg: {shadowColor: Colors.shadowDeep, shadowOffset: {width: 0, height: 4}, shadowOpacity: 1, shadowRadius: 16, elevation: 8},
  };
  return shadows[elevation];
}
