import type { TemplateEntry } from '../types';
import { FadeAndCo } from './FadeAndCo';

const theme = {
  /**
   * Ink, bone and brass — mapped onto semantic roles rather than used as literals, which is what
   * lets the whole page re-skin from one place:
   *
   *   ink   700 #22252C · 800 #16181D · 900 #0B0C0F
   *   bone   50 #FAF8F5 · 100 #F1EDE6 · 200 #E0D9CD
   *   brass 400 #D3A75F · 500 #B8863A · 600 #94682A
   *   steel 500 #4A4F58 · 600 #383D45
   *
   * `primary` is the ink the dark bands and the solid buttons are cut from, `secondary` is the
   * brass accent (eyebrow rules, the wordmark's ampersand, icons, the focus ring), `neutral`
   * carries the steel of muted text and the bone surfaces.
   *
   * This is the *default* selection, not a lock: it seeds the preview's scoped theme, and the
   * Colors panel edits on top of it, so any role can be recoloured live and reset back to here.
   *
   * **No status colours** — the page defines none, so success/warning/danger/info stay on the DS
   * defaults, the gold `Rating` stars included. That is the universal convention and not
   * something a shop's brand should override.
   *
   * Dark **is** authored here, unlike the coffee port, which had no dark source to port. The
   * page is already an ink identity, so falling through to the global dark theme would repaint
   * every band in the DS's own primary and throw the brand away. `primary` stays an ink family
   * in both modes — raised just above the page in dark, so the bands read as bands — which is
   * why every booking CTA is `color="secondary"`: a solid ink button on an ink page would be
   * the one thing this mapping cannot make legible.
   */
  palette: {
    light: {
      primary: {
        main: '#16181D',
        contrast: '#FAF8F5',
        hover: '#22252C',
        active: '#0B0C0F',
        subtle: '#F1EDE6',
        border: '#383D45',
      },
      secondary: {
        main: '#B8863A',
        contrast: '#16181D',
        hover: '#94682A',
        active: '#94682A',
        subtle: '#F5EBDA',
        border: '#D3A75F',
      },
      neutral: {
        main: '#4A4F58',
        contrast: '#FAF8F5',
        hover: '#383D45',
        active: '#383D45',
        subtle: '#F1EDE6',
        border: '#E0D9CD',
      },
      background: { default: '#FAF8F5', paper: '#FFFFFF', subtle: '#F1EDE6' },
      foreground: { default: '#0B0C0F', muted: '#3E434B', subtle: '#5F6570' },
      border: { default: '#E0D9CD', subtle: '#F1EDE6', strong: '#C9BFAF' },
      focusRing: '#B8863A',
    },
    dark: {
      primary: {
        main: '#1A1D23',
        contrast: '#F3F0EA',
        hover: '#22262E',
        active: '#101318',
        subtle: '#16181D',
        border: '#33383F',
      },
      secondary: {
        main: '#D3A75F',
        contrast: '#0B0C0F',
        hover: '#E0B978',
        active: '#B8863A',
        subtle: '#241E14',
        border: '#8A6528',
      },
      neutral: {
        main: '#B9B4AA',
        contrast: '#0B0C0F',
        hover: '#D2CDC3',
        active: '#8C8880',
        subtle: '#16181D',
        border: '#33383F',
      },
      background: { default: '#0B0C0F', paper: '#14161B', subtle: '#101217' },
      foreground: { default: '#F3F0EA', muted: '#B9B4AA', subtle: '#8C8880' },
      border: { default: '#262A31', subtle: '#1A1D22', strong: '#3D434C' },
      focusRing: '#D3A75F',
    },
  },
  /**
   * A heavy grotesk for headings, a neutral sans for body. Webfont files are not shipped by the
   * renderer, so the fallbacks are load-bearing — `Arial Black` is what actually paints the
   * uppercase headings on most machines, and it is close enough in weight to hold the layout.
   */
  typography: {
    fontFamily: {
      display: '"Archivo Black", "Helvetica Neue", "Arial Black", sans-serif',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  /**
   * Squared off, top to bottom. This is the brand decision that reads first: buttons, cards,
   * badges and images all lose their corners, which is exactly the opposite of the coffee
   * template's pill geometry — and it is one token block, not a stylesheet.
   */
  radius: {
    sm: '0.125rem',
    md: '0.125rem',
    lg: '0.125rem',
    xl: '0.125rem',
    '2xl': '0.125rem',
  },
  /** Cool, tight shadows — ink-tinted rather than the warm brown of a roastery. */
  shadows: {
    md: '0 2px 14px rgba(11, 12, 15, 0.08)',
    lg: '0 14px 40px rgba(11, 12, 15, 0.14)',
    xl: '0 24px 60px rgba(11, 12, 15, 0.22)',
  },
} as const;

export const fadeAndCoTemplate: TemplateEntry = {
  meta: {
    slug: 'fade-and-co',
    name: 'Fade & Co. — Barbershop',
    description:
      'A barbershop landing page: full-bleed ink hero, a credibility band, the price list as a real definition list, the shop promise on a dark band, the barbers, reviews, a working booking form and the visit details. Squared geometry and a brass accent come entirely from the theme block — recolour a role and the whole page follows.',
    category: 'Marketing',
    tags: ['marketing', 'barbershop', 'local business', 'booking', 'brand-theme'],
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'numbers', label: 'Numbers band', file: 'sections/Numbers.tsx' },
      { id: 'services', label: 'Services', file: 'sections/Services.tsx' },
      { id: 'craft', label: 'Why here', file: 'sections/Craft.tsx' },
      { id: 'barbers', label: 'Barbers', file: 'sections/Barbers.tsx' },
      { id: 'testimonials', label: 'Testimonials', file: 'sections/Testimonials.tsx' },
      { id: 'booking', label: 'Booking', file: 'sections/Booking.tsx' },
      { id: 'visit', label: 'Visit', file: 'sections/Visit.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: FadeAndCo,
};
