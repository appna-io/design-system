import type { TemplateEntry } from '../types';
import { Northbound } from './Northbound';

/**
 * Ink navy and signal orange — a duotone, not a tinted neutral. See `ART-DIRECTION.md`.
 *
 *   navy   700 #0C1029 · 600 #151B3D · 500 #232B5C · 400 #39447F
 *   orange 600 #D63F0A · 500 #FF5A1F · 400 #FF7A47
 *   slate  600 #3A3F55 · 500 #5A6076 · 400 #8B91A6
 *   paper   50 #FFFDFA · 100 #F6F3EE · 200 #E8E3DA
 *
 * `primary` is the navy the hero and the header rule are cut from, `secondary` the orange that
 * carries the topic band and the close. They are close to **equal in the page's total area**,
 * which is what makes it a duotone rather than an accent on a neutral, and it is why both had to
 * get a real `Surface` tone rather than one of them being a background.
 *
 * The paper is warm (`#FFFDFA`, not white) because the orange goes acidic on pure white and
 * slightly sour on a cool grey. That is the only value here chosen against a colour rather than
 * from a ramp.
 */
const theme = {
  palette: {
    light: {
      primary: {
        main: '#151B3D',
        contrast: '#FFFDFA',
        hover: '#232B5C',
        active: '#0C1029',
        subtle: '#EAEBF2',
        border: '#C2C6D8',
      },
      secondary: {
        main: '#FF5A1F',
        contrast: '#1A0C04',
        hover: '#FF7A47',
        active: '#D63F0A',
        subtle: '#FFEDE4',
        border: '#FFC3A5',
      },
      neutral: {
        main: '#3A3F55',
        contrast: '#FFFDFA',
        hover: '#232838',
        active: '#171B27',
        subtle: '#F1EEE8',
        border: '#DCD7CD',
      },
      background: { default: '#FFFDFA', paper: '#FFFFFF', subtle: '#F6F3EE' },
      foreground: { default: '#12162B', muted: '#4A5068', subtle: '#767C92' },
      border: { default: '#12162B', subtle: '#E8E3DA', strong: '#12162B' },
      focusRing: '#FF5A1F',
    },
    /**
     * Authored, not inherited. The duotone is the identity, so falling through to the global dark
     * theme would produce a different event. In dark mode the navy stops being usable as a *fill*
     * — a navy band on a near-black page is invisible — so `primary` lifts to the mid navy and the
     * page ground drops below it. The orange barely moves: it is already the brighter of the pair
     * and the whole duotone depends on the two staying comparable in weight.
     */
    dark: {
      primary: {
        main: '#39447F',
        contrast: '#FFFDFA',
        hover: '#4A5799',
        active: '#232B5C',
        subtle: '#161A2E',
        border: '#333B63',
      },
      secondary: {
        main: '#FF6B33',
        contrast: '#1A0C04',
        hover: '#FF8A5C',
        active: '#E14C13',
        subtle: '#2A150B',
        border: '#7A3417',
      },
      neutral: {
        main: '#A9AFC2',
        contrast: '#0A0C16',
        hover: '#C6CBD9',
        active: '#8A90A4',
        subtle: '#161927',
        border: '#2B2F42',
      },
      background: { default: '#0A0C16', paper: '#12162B', subtle: '#0F1220' },
      foreground: { default: '#F4F3EF', muted: '#A9AFC2', subtle: '#7C8296' },
      border: { default: '#F4F3EF', subtle: '#1E2236', strong: '#F4F3EF' },
      focusRing: '#FF6B33',
    },
  },
  /**
   * Space Grotesk is the identity — geometric bones with genuinely odd details (the splayed `M`,
   * the single-storey `g`), which reads as designed *for this event* rather than as a neutral
   * system face. Webfont files are not shipped by the renderer, so the fallbacks are load-bearing:
   * the geometric fallbacks keep the poster proportions even when the face never arrives.
   */
  typography: {
    fontFamily: {
      display: '"Space Grotesk", "Futura", "Century Gothic", system-ui, sans-serif',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  /** Tight, technical, printed. The fourth distinct geometry in the gallery. */
  radius: {
    sm: '0.125rem',
    md: '0.1875rem',
    lg: '0.25rem',
    xl: '0.3125rem',
    '2xl': '0.375rem',
  },
  /**
   * Hard offset shadows, not ambient blur. A poster's depth comes from ink sitting *on* paper —
   * a soft diffuse shadow would fight the 2px borders every surface in this template carries.
   */
  shadows: {
    sm: '2px 2px 0 rgba(18, 22, 43, 0.9)',
    md: '4px 4px 0 rgba(18, 22, 43, 0.9)',
    lg: '6px 6px 0 rgba(18, 22, 43, 0.9)',
    xl: '10px 10px 0 rgba(18, 22, 43, 0.9)',
  },
} as const;

export const northboundTemplate: TemplateEntry = {
  meta: {
    slug: 'northbound',
    name: 'Northbound — One-day conference',
    description:
      'A conference poster that turns into a usable schedule: full-bleed duotone hero with a live countdown, a running topic band, six speakers led by their talk rather than their name, and a real filterable agenda table with times, tracks and rooms. Two Surface brand tones sit either side of an inverted one — the page is a duotone, not an accent on a neutral.',
    category: 'Marketing',
    tags: ['events', 'conference', 'agenda', 'duotone', 'poster', 'brand-theme'],
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero poster', file: 'sections/Hero.tsx' },
      { id: 'topics', label: 'Topic marquee', file: 'sections/TopicBand.tsx' },
      { id: 'stats', label: 'Day at a glance', file: 'sections/Stats.tsx' },
      { id: 'speakers', label: 'Speakers', file: 'sections/Speakers.tsx' },
      { id: 'agenda', label: 'Agenda', file: 'sections/Agenda.tsx' },
      { id: 'venue', label: 'Venue', file: 'sections/Venue.tsx' },
      { id: 'tickets', label: 'Tickets', file: 'sections/Tickets.tsx' },
      { id: 'faq', label: 'Practicalities', file: 'sections/Faq.tsx' },
      { id: 'cta', label: 'Closing CTA', file: 'sections/CtaBand.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: Northbound,
};
