import type { TemplateEntry } from '../types';
import { Halyard } from './Halyard';

/**
 * Near-black ground, terminal green, electric blue. See `ART-DIRECTION.md`.
 *
 * Both brand roles are **light fills with dark ink** — the inversion #4's contrast work identified
 * as the thing that buys headroom on a brand band. Measured before the sections were written:
 * `primary` is 10.60:1 at full ink and 8.86:1 at the `foreground.muted` step, `secondary` 6.96 and
 * 6.11. Every step passes in both modes, so a `Surface tone` band anywhere on this page is safe.
 *
 * `focusRing` is the green rather than the DS default: on a near-black ground the default violet
 * ring is nearly invisible, which is the accessibility regression #2 warns a styling choice can
 * hand out silently.
 */
const theme = {
  palette: {
    /**
     * The light mode is authored, not inherited — but it is the *secondary* reading of this
     * template, since `preferredMode` is dark. The brand fills darken substantially (a terminal
     * green that works as ink on black is unreadable as ink on white), which is the one place the
     * two modes are genuinely different colours rather than the same colour re-weighted.
     */
    light: {
      primary: {
        main: '#0B7A46',
        contrast: '#F2FFF8',
        hover: '#096339',
        active: '#074C2C',
        subtle: '#E4F7EC',
        border: '#9BD9B7',
      },
      secondary: {
        main: '#1D4FD8',
        contrast: '#F3F7FF',
        hover: '#1740B4',
        active: '#123292',
        subtle: '#E6EDFE',
        border: '#A9C1F7',
      },
      neutral: {
        main: '#48525E',
        contrast: '#FBFCFD',
        hover: '#333C47',
        active: '#232A33',
        subtle: '#F1F3F5',
        border: '#DDE1E6',
      },
      background: { default: '#FBFCFD', paper: '#FFFFFF', subtle: '#F1F3F5' },
      foreground: { default: '#0B0F14', muted: '#48525E', subtle: '#626D79' },
      border: { default: '#DDE1E6', subtle: '#EDEFF2', strong: '#B6BEC7' },
      focusRing: '#0B7A46',
    },
    dark: {
      primary: {
        main: '#3DDC84',
        contrast: '#04140B',
        hover: '#5FE79C',
        active: '#2FBF6E',
        subtle: '#0A1F14',
        border: '#1D5C39',
      },
      secondary: {
        main: '#4D9EFF',
        contrast: '#04101F',
        hover: '#77B6FF',
        active: '#2F82EE',
        subtle: '#0A1626',
        border: '#1E4573',
      },
      neutral: {
        main: '#9BA7B4',
        contrast: '#07090C',
        hover: '#BAC4CE',
        active: '#7C8894',
        subtle: '#12161C',
        border: '#232A33',
      },
      background: { default: '#07090C', paper: '#0C1015', subtle: '#12161C' },
      foreground: { default: '#E6EDF3', muted: '#9BA7B4', subtle: '#6E7B8A' },
      border: { default: '#232A33', subtle: '#171C23', strong: '#39424D' },
      focusRing: '#3DDC84',
    },
  },
  /**
   * Mono as the *display* face — the register nothing else in the gallery holds. It carries
   * headings, eyebrows, every parameter name and both mock frames; body copy stays Inter, because
   * a paragraph set in mono is a paragraph nobody finishes.
   *
   * Webfont files are not shipped by the renderer, so the fallbacks are load-bearing — and here
   * they are genuinely safe, since every platform has a decent mono.
   */
  typography: {
    fontFamily: {
      display: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  /** Tight and technical. */
  radius: {
    sm: '0.1875rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
    '2xl': '0.625rem',
  },
  /**
   * Barely-there elevation. On a near-black ground a black-alpha shadow is invisible, so depth on
   * this page comes from `background.subtle` panels and hairline borders instead — which is the
   * concrete case for the tinted-shadow token in #2 G6.
   */
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 2px 8px rgba(0, 0, 0, 0.45)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
} as const;

export const halyardTemplate: TemplateEntry = {
  meta: {
    slug: 'halyard',
    name: 'Halyard — Developer docs',
    description:
      'A real three-column documentation site: AppShell with a TreeView sidebar, an on-this-page rail, and one scroll-spy feeding both so they can never disagree. Mono as the display face, dark-first, and the quietest motion in the gallery — fade only, no travel — because a reference page is read non-linearly.',
    category: 'Application',
    tags: ['docs', 'developer', 'api', 'dark', 'mono', 'brand-theme'],
    preferredMode: 'dark',
    theme,
    inspectable: [
      { id: 'doc-header', label: 'Header', file: 'sections/DocHeader.tsx' },
      { id: 'doc-sidebar', label: 'Sidebar nav', file: 'sections/DocSidebar.tsx' },
      { id: 'doc-body', label: 'Documentation', file: 'sections/DocBody.tsx' },
      { id: 'on-this-page', label: 'On this page', file: 'sections/OnThisPage.tsx' },
      { id: 'doc-footer', label: 'Footer', file: 'Halyard.tsx' },
    ],
  },
  Component: Halyard,
};
