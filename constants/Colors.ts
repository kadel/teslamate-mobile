// Tesla-inspired dark design system
// Color as information: accents reserved for meaning, not decoration

export const palette = {
  // Backgrounds (dark-first)
  bg: {
    primary: '#000000',
    card: '#141414',
    cardHover: '#1a1a1a',
    elevated: '#1c1c1e',
    input: '#1c1c1e',
  },

  // Text
  text: {
    primary: '#f5f5f5',
    secondary: '#8e8e93',
    tertiary: '#636366',
    inverted: '#000000',
  },

  // Borders
  border: {
    subtle: '#1c1c1e',
    default: '#2c2c2e',
    strong: '#3a3a3c',
  },

  // Accent — Tesla red (used sparingly for primary actions)
  accent: {
    primary: '#e31937',
    primaryDim: 'rgba(227, 25, 55, 0.15)',
  },

  // Semantic colors
  blue: {
    DEFAULT: '#3b82f6',
    dim: 'rgba(59, 130, 246, 0.15)',
    muted: 'rgba(59, 130, 246, 0.6)',
  },

  green: {
    DEFAULT: '#30d158',
    dim: 'rgba(48, 209, 88, 0.15)',
    muted: 'rgba(48, 209, 88, 0.6)',
  },

  orange: {
    DEFAULT: '#ff9f0a',
    dim: 'rgba(255, 159, 10, 0.15)',
  },

  red: {
    DEFAULT: '#ff453a',
    dim: 'rgba(255, 69, 58, 0.15)',
  },

  purple: {
    DEFAULT: '#bf5af2',
    dim: 'rgba(191, 90, 242, 0.15)',
  },
} as const;

// Legacy export for compatibility with existing navigation theme
export default {
  light: {
    text: palette.text.primary,
    background: palette.bg.primary,
    tint: palette.blue.DEFAULT,
    tabIconDefault: palette.text.tertiary,
    tabIconSelected: palette.text.primary,
  },
  dark: {
    text: palette.text.primary,
    background: palette.bg.primary,
    tint: palette.text.primary,
    tabIconDefault: palette.text.tertiary,
    tabIconSelected: palette.text.primary,
  },
};
