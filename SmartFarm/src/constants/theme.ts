// SmartFarm Design System Tokens
// All colors, typography sizes, spacing, and radii are defined here.
// Import this file in every component to stay consistent.

export const Colors = {
  // Brand
  primaryGreen: '#287A45',
  darkGreen: '#185631',
  lightGreen: '#E8F4EA',

  // Backgrounds
  appBackground: '#F6F8F5',
  cardBackground: '#FFFFFF',

  // Text
  mainText: '#19251C',
  secondaryText: '#68756C',
  mutedText: '#89948B',

  // UI
  border: '#E5EBE5',

  // Status
  success: '#23864A',
  warning: '#B87516',
  danger: '#C23D3D',
  info: '#3975B8',

  // Tab bar
  tabActive: '#287A45',
  tabInactive: '#89948B',
  tabBackground: '#FFFFFF',
};

export const FontSize = {
  screenHeading: 28,
  sectionHeading: 18,
  cardTitle: 15,
  primaryMetric: 26,
  body: 15,
  secondary: 12,
  label: 13,
};

export const FontWeight = {
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  card: 16,
  hero: 20,
  pill: 100,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};
