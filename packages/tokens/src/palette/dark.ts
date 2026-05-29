import type { PaletteShape } from '@apx-ui/engine';

/**
 * Default DARK palette. Same shape as `lightPalette`. Role names stay identical; only the hex
 * values shift so components can switch modes without re-wiring class strings.
 */
export const darkPalette: PaletteShape = {
  primary: {
    main: '#6366f1',
    contrast: '#ffffff',
    hover: '#818cf8',
    active: '#a5b4fc',
    subtle: '#1e1b4b',
    border: '#3730a3',
  },
  secondary: {
    main: '#38bdf8',
    contrast: '#0c1828',
    hover: '#7dd3fc',
    active: '#bae6fd',
    subtle: '#082f49',
    border: '#0369a1',
  },
  success: {
    main: '#22c55e',
    contrast: '#052e16',
    hover: '#4ade80',
    active: '#86efac',
    subtle: '#052e16',
    border: '#166534',
  },
  warning: {
    main: '#fbbf24',
    contrast: '#1c1410',
    hover: '#fcd34d',
    active: '#fde68a',
    subtle: '#451a03',
    border: '#92400e',
  },
  danger: {
    main: '#ef4444',
    contrast: '#ffffff',
    hover: '#f87171',
    active: '#fca5a5',
    subtle: '#450a0a',
    border: '#991b1b',
  },
  info: {
    main: '#3b82f6',
    contrast: '#ffffff',
    hover: '#60a5fa',
    active: '#93c5fd',
    subtle: '#172554',
    border: '#1e40af',
  },
  neutral: {
    main: '#a1a1aa',
    contrast: '#18181b',
    hover: '#d4d4d8',
    active: '#e4e4e7',
    subtle: '#27272a',
    border: '#3f3f46',
  },
  background: {
    default: '#09090b',
    paper: '#18181b',
    subtle: '#27272a',
  },
  foreground: {
    default: '#fafafa',
    muted: '#a1a1aa',
    subtle: '#71717a',
  },
  border: {
    default: '#3f3f46',
    subtle: '#27272a',
    strong: '#52525b',
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  focusRing: '#818cf8',
};
