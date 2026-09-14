import type { TemplateEntry } from '../types';
import { VantageStudio } from './VantageStudio';

/**
 * Vantage's palette, mapped onto semantic roles rather than used as literals — which is what lets
 * the whole page re-skin from one place:
 *
 *   acid    400 #DCFF57 · 500 #CBF74A · 600 #A8D02F
 *   ink      50 #F5F5F2 · 700 #2A2A2E · 800 #171719 · 900 #0C0C0E
 *   sand    200 #E5DDD1 · 400 #B8AEA0 · 600 #7C7367
 *
 * `primary` is the acid the CTA band, the rules and the accent dots are cut from — a colour that
 * only works as a small area against a large dark one, which is exactly how the layout uses it.
 * `secondary` is the sand that warms the quiet surfaces; `neutral` carries the ink of the buttons
 * and muted type.
 *
 * This is the *default* selection, not a lock: it seeds the preview's scoped theme, and the
 * Colors panel edits on top of it, so any role can be recoloured live and reset back to here.
 *
 * **Both modes are authored.** Unlike the coffee template — where dark mode was never designed
 * upstream and falling through to the global dark theme is the honest answer — this identity *is*
 * the dark one. `preferredMode: 'dark'` opens it that way, and the light palette is a designed
 * inverse rather than an afterthought, because a studio site that breaks when someone's OS is in
 * light mode is broken.
 *
 * **No status colours.** The page defines none, so success/warning/danger/info stay on the DS
 * defaults rather than being invented and passed off as part of the identity.
 */
const theme = {
  palette: {
    dark: {
      primary: {
        main: '#CBF74A',
        contrast: '#0C0C0E',
        hover: '#DCFF57',
        active: '#A8D02F',
        subtle: '#1C1F14',
        border: '#3A4222',
      },
      secondary: {
        main: '#E5DDD1',
        contrast: '#0C0C0E',
        hover: '#F2EDE5',
        active: '#B8AEA0',
        subtle: '#1E1D1B',
        border: '#3A3833',
      },
      neutral: {
        main: '#F5F5F2',
        contrast: '#0C0C0E',
        hover: '#FFFFFF',
        active: '#E5E5E0',
        subtle: '#1A1A1D',
        border: '#2E2E33',
      },
      background: { default: '#0C0C0E', paper: '#141417', subtle: '#111114' },
      // `subtle` is the floor for small text on this canvas: #8E8E92 on #0C0C0E clears 4.5:1,
      // where the darker grey it started as sat at ~4.3 and failed AA for the eyebrows, card meta
      // and footer links that all use it.
      foreground: { default: '#F5F5F2', muted: '#B0B0AB', subtle: '#8E8E92' },
      border: { default: '#26262B', subtle: '#1D1D21', strong: '#3A3A42' },
      focusRing: '#CBF74A',
    },
    light: {
      primary: {
        main: '#8FBF00',
        contrast: '#0C0C0E',
        hover: '#A8D02F',
        active: '#7BA300',
        subtle: '#F2F9DC',
        border: '#CDE38A',
      },
      secondary: {
        main: '#7C7367',
        contrast: '#FFFFFF',
        hover: '#5F584E',
        active: '#5F584E',
        subtle: '#F5F2ED',
        border: '#DDD6CB',
      },
      neutral: {
        main: '#171719',
        contrast: '#FFFFFF',
        hover: '#2A2A2E',
        active: '#0C0C0E',
        subtle: '#F2F2F0',
        border: '#D9D9D4',
      },
      background: { default: '#FBFBF9', paper: '#FFFFFF', subtle: '#F2F2EF' },
      foreground: { default: '#0C0C0E', muted: '#55555A', subtle: '#7C7C80' },
      border: { default: '#E2E2DD', subtle: '#EDEDE9', strong: '#C4C4BE' },
      focusRing: '#8FBF00',
    },
  },
  /**
   * A grotesque for display, a neutral sans for body. Webfont files are not shipped by the
   * renderer, so the fallbacks are load-bearing — the stack has to still read as editorial when
   * it lands on the system face.
   */
  typography: {
    fontFamily: {
      display: '"Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      sans: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
  },
  /**
   * Squared throughout. `md` (buttons, inputs) stays a hair off zero so the shape reads as
   * intentional rather than as an unstyled control.
   */
  radius: {
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '0.75rem',
  },
  /**
   * Shadows are near-invisible on a near-black canvas, so they are shallow and cool rather than
   * the warm lift the coffee template uses. Depth on this page comes from the surface steps in
   * the palette, not from drop shadows.
   */
  shadows: {
    md: '0 4px 20px rgba(0, 0, 0, 0.30)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.40)',
    xl: '0 24px 64px rgba(0, 0, 0, 0.50)',
  },
} as const;

export const vantageStudioTemplate: TemplateEntry = {
  meta: {
    slug: 'vantage-studio',
    name: 'Vantage — Brand Studio',
    description:
      'A dark, editorial studio site: cascading display hero, a mixed-span case-study grid, ruled service rows, a four-step process, the team, a single pull-quote and an acid-green closing band. Built to exercise the DS scroll-reveal system — almost every section reveals and staggers on entry, and all of it respects prefers-reduced-motion.',
    category: 'Marketing',
    tags: ['marketing', 'agency', 'studio', 'portfolio', 'dark', 'animation', 'brand-theme'],
    preferredMode: 'dark',
    credit: 'Original — built for the gallery',
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'clients', label: 'Client wall', file: 'sections/Clients.tsx' },
      { id: 'work', label: 'Selected work', file: 'sections/Work.tsx' },
      { id: 'services', label: 'Services', file: 'sections/Services.tsx' },
      { id: 'approach', label: 'Approach', file: 'sections/Approach.tsx' },
      { id: 'studio', label: 'The studio', file: 'sections/Studio.tsx' },
      { id: 'testimonial', label: 'Testimonial', file: 'sections/Testimonial.tsx' },
      { id: 'cta', label: 'Closing CTA', file: 'sections/CtaBand.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: VantageStudio,
};
