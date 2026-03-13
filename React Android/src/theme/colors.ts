export const Colors = {
  // Background
  bg: '#0a0a1a',
  bgLight: '#111128',
  bgCard: '#161638',
  bgCardAlt: '#1a1a3e',

  // Neon accents
  primary: '#00f0ff',     // Cyan
  secondary: '#ff00c8',   // Magenta
  accent: '#a855f7',      // Purple
  success: '#39ff14',     // Green
  warning: '#ffe600',     // Yellow
  error: '#ff2255',       // Red
  orange: '#ff6600',
  pink: '#ff6eb4',

  // Text
  textPrimary: '#e8e8ff',
  textSecondary: '#9999bb',
  textMuted: '#666688',
  white: '#f0f0ff',

  // Borders & Surfaces
  border: '#2a2a5a',
  borderLight: '#3a3a6a',
  surface: '#1e1e42',
  surfaceElevated: '#242452',

  // Overlay
  overlay: 'rgba(10, 10, 26, 0.85)',
  overlayLight: 'rgba(10, 10, 26, 0.5)',
};

export const Neon = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  Colors.warning,
  Colors.orange,
  Colors.pink,
];

export function neonShadow(color: string, radius = 12) {
  return {
    shadowColor: color,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: radius,
    elevation: 8,
  };
}
