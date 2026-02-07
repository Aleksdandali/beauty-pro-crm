/**
 * Shine Beauty CRM — Design Tokens
 * Glass Beauty theme: glassmorphism + bento grid + micro-delights
 *
 * These tokens are the single source of truth for the entire design system.
 * Every component references these values. Change here → change everywhere.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  dark: {
    background: '#0A0A0F',
    surface: '#12121A',
    surfaceHover: '#1A1A25',
    elevated: '#1E1E2A',

    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(139, 92, 246, 0.5)',

    text: '#F1F1F4',
    textSecondary: '#8B8B9E',
    textMuted: '#5C5C6F',
  },
  light: {
    background: '#FAFAFC',
    surface: 'rgba(255, 255, 255, 0.8)',
    surfaceHover: 'rgba(255, 255, 255, 0.95)',
    elevated: '#FFFFFF',

    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(0, 0, 0, 0.1)',
    borderActive: 'rgba(139, 92, 246, 0.5)',

    text: '#1A1A2E',
    textSecondary: '#64648C',
    textMuted: '#9C9CB8',
  },

  // Shared across themes
  primary: '#8B5CF6',
  primaryHover: '#7C3AED',
  primaryLight: 'rgba(139, 92, 246, 0.12)',
  primaryForeground: '#FFFFFF',

  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  error: '#F43F5E',
  errorLight: 'rgba(244, 63, 94, 0.12)',
  info: '#06B6D4',
  infoLight: 'rgba(6, 182, 212, 0.12)',
} as const;

// ─── Gradients ───────────────────────────────────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
  primaryHover: 'linear-gradient(135deg, #7C3AED, #C026D3)',
  subtle: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.15))',

  // RFM segments — each has a unique gradient identity
  rfmVip: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  rfmLoyal: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
  rfmRegular: 'linear-gradient(135deg, #10B981, #06B6D4)',
  rfmNew: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  rfmSleeping: 'linear-gradient(135deg, #F59E0B, #F97316)',
  rfmLost: 'linear-gradient(135deg, #6B7280, #4B5563)',
} as const;

// ─── Glass (Glassmorphism) ───────────────────────────────────────────────────

export const glass = {
  dark: {
    background: 'rgba(255, 255, 255, 0.03)',
    backgroundHover: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.6)',
    backgroundHover: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.5)',
    borderHover: 'rgba(255, 255, 255, 0.8)',
  },
  blur: '16px',
  blurHeavy: '24px',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const fontFamily = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.8125rem', { lineHeight: '1.25rem' }],
  base: ['0.875rem', { lineHeight: '1.5rem' }],
  md: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.5rem', { lineHeight: '2rem' }],
  '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '3xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '4xl': ['3rem', { lineHeight: '1' }],
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  '0': '0px',
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  dark: {
    sm: 'none',
    md: 'none',
    lg: 'none',
  },
  light: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.03)',
    md: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(100, 80, 160, 0.06)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(100, 80, 160, 0.1)',
  },
  glow: '0 0 20px rgba(139, 92, 246, 0.15)',
  glowStrong: '0 0 30px rgba(139, 92, 246, 0.25)',
} as const;

// ─── Transitions ─────────────────────────────────────────────────────────────

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;

// ─── Combined Export ─────────────────────────────────────────────────────────

export const tokens = {
  colors,
  gradients,
  glass,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  radius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof tokens;
