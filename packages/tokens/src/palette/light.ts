import type { PaletteShape } from '@apx-ui/engine';

/**
 * Default LIGHT palette. Concrete sRGB values keyed by semantic role. Components reference
 * `palette.primary.main` — never the raw hex — so swapping a role here updates every consumer.
 */
export const lightPalette: PaletteShape = {
  primary: {
    main: '#4f46e5',
    contrast: '#ffffff',
    hover: '#4338ca',
    active: '#3730a3',
    subtle: '#eef2ff',
    border: '#c7d2fe',
  },
  secondary: {
    main: '#0ea5e9',
    contrast: '#ffffff',
    hover: '#0284c7',
    active: '#0369a1',
    subtle: '#e0f2fe',
    border: '#bae6fd',
  },
  success: {
    main: '#16a34a',
    contrast: '#ffffff',
    hover: '#15803d',
    active: '#166534',
    subtle: '#dcfce7',
    border: '#bbf7d0',
  },
  warning: {
    main: '#f59e0b',
    contrast: '#111827',
    hover: '#d97706',
    active: '#b45309',
    subtle: '#fef3c7',
    border: '#fde68a',
  },
  danger: {
    main: '#dc2626',
    contrast: '#ffffff',
    hover: '#b91c1c',
    active: '#991b1b',
    subtle: '#fee2e2',
    border: '#fecaca',
  },
  info: {
    main: '#2563eb',
    contrast: '#ffffff',
    hover: '#1d4ed8',
    active: '#1e40af',
    subtle: '#dbeafe',
    border: '#bfdbfe',
  },
  neutral: {
    main: '#52525b',
    contrast: '#ffffff',
    hover: '#3f3f46',
    active: '#27272a',
    subtle: '#f4f4f5',
    border: '#e4e4e7',
  },
  background: {
    default: '#ffffff',
    paper: '#fafafa',
    subtle: '#f4f4f5',
  },
  foreground: {
    default: '#18181b',
    muted: '#52525b',
    subtle: '#71717a',
  },
  border: {
    default: '#e4e4e7',
    subtle: '#f4f4f5',
    strong: '#a1a1aa',
  },
  overlay: 'rgba(0, 0, 0, 0.5)',
  focusRing: '#4f46e5',
};