import type { TemplateEntry } from '../types';
import { RelayAtelier } from './RelayAtelier';

/**
 * Near-monochrome: bone paper, near-black ink, and one saturated vermilion that appears three
 * times on the entire page. See `ART-DIRECTION.md`.
 *
 * `primary` is the **ink**, not a colour. That is unusual and deliberate — on a page whose second
 * colour is the ink itself, mapping `primary` to the vermilion would make every default DS
 * component (a `Button`, a `Badge`) reach for the accent automatically, and the three-appearance
 * budget would be gone before the first section. With `primary` as the ink, the DS's defaults are
 * already monochrome and the accent has to be asked for explicitly, which is exactly the
 * discipline the art direction needs.
 *
 * Measured before the sections were written:
 * ```
 *                     on ground   as a Surface fill (full / @90)
 * light  ink #141414    16.93       16.93 / 13.73
 * light  accent #B02E17  5.94        6.07 /  5.19
 * light  muted #4A4744   8.48
 * light  subtle #6E6A66  4.93
 * dark   ink #F2EFEB    16.60       16.60 / 13.17
 * dark   accent #FF6A4D   6.72        6.81 /  6.00
 * dark   subtle #8A857E   5.20
 * ```
 */
const theme = {
  palette: {
    light: {
      primary: {
        main: '#141414',
        contrast: '#F7F5F2',
        hover: '#2B2B2B',
        active: '#000000',
        subtle: '#EDEAE5',
        border: '#C9C4BC',
      },
      secondary: {
        main: '#B02E17',
        contrast: '#FFF6F3',
        hover: '#8F2412',
        active: '#711C0E',
        subtle: '#FBEAE6',
        border: '#E8B6AA',
      },
      neutral: {
        main: '#4A4744',
        contrast: '#F7F5F2',
        hover: '#332F2C',
        active: '#211E1C',
        subtle: '#EFECE7',
        border: '#DAD5CE',
      },
      background: { default: '#F7F5F2', paper: '#FFFFFF', subtle: '#EFECE7' },
      foreground: { default: '#141414', muted: '#4A4744', subtle: '#6E6A66' },
      border: { default: '#D5D0C8', subtle: '#E6E2DB', strong: '#141414' },
      focusRing: '#B02E17',
    },
    /**
     * The dark mode is a genuine inversion rather than a re-weighting: the paper becomes the ink
     * and the accent lifts, because a vermilion tuned for bone paper goes muddy on near-black.
     * `primary` stays "the ink" in both, which is what keeps the DS defaults monochrome either way.
     */
    dark: {
      primary: {
        main: '#F2EFEB',
        contrast: '#101010',
        hover: '#FFFFFF',
        active: '#D6D2CC',
        subtle: '#1C1B1A',
        border: '#3A3835',
      },
      secondary: {
        main: '#FF6A4D',
        contrast: '#1A0A06',
        hover: '#FF8B74',
        active: '#E4522F',
        subtle: '#2A120C',
        border: '#7A3123',
      },
      neutral: {
        main: '#A8A29B',
        contrast: '#101010',
        hover: '#C6C1BA',
        active: '#8A857E',
        subtle: '#1A1918',
        border: '#332F2C',
      },
      background: { default: '#101010', paper: '#171716', subtle: '#1A1918' },
      foreground: { default: '#F2EFEB', muted: '#A8A29B', subtle: '#8A857E' },
      border: { default: '#2C2A28', subtle: '#1F1E1D', strong: '#F2EFEB' },
      focusRing: '#FF6A4D',
    },
  },
  /**
   * A **contemporary** high-contrast serif, not a didone revival — the board asked for something
   * with more attitude than Playfair and tighter tracking, and Instrument Serif is exactly that
   * register: very high stroke contrast, tight fit, and modern enough to read as art-directed
   * rather than classical. Eighth display face in the gallery with no overlap.
   *
   * The fallbacks matter more here than in any other template, because the whole page is set at
   * 60–120px where a substitution is unmissable — so the stack is other high-contrast serifs
   * before it gives up and reaches for Georgia.
   */
  typography: {
    fontFamily: {
      display: '"Instrument Serif", "Bodoni Moda", "Didot", "Playfair Display", Georgia, serif',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  /**
   * Effectively square. `preferredVariant: 'katana'` layers the diagonal radii on top, which is
   * the one identity in the DS nothing else in the gallery uses — and it reads as a deliberate cut
   * rather than as rounding, which is the right register for a studio page.
   */
  radius: {
    xs: '0px',
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
  },
  /** No elevation. On a page this flat, a shadow is the only thing that would look pasted on. */
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
} as const;

export const relayAtelierTemplate: TemplateEntry = {
  meta: {
    slug: 'relay-atelier',
    name: 'Relay Atelier — Design studio',
    description:
      'A near-monochrome studio portfolio where the type is the whole argument: a 120px headline on the fluid display scale, four case studies in the kit browser frame, and one accent colour used exactly three times on the entire page. No sticky header and no CTA band — deliberately, both.',
    category: 'Portfolio',
    tags: ['portfolio', 'studio', 'editorial', 'monochrome', 'typography', 'brand-theme'],
    preferredVariant: 'katana',
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'clients', label: 'Client band', file: 'sections/Clients.tsx' },
      { id: 'work', label: 'Selected work', file: 'sections/Work.tsx' },
      { id: 'practice', label: 'Practice', file: 'sections/Practice.tsx' },
      { id: 'studio', label: 'Studio', file: 'sections/Studio.tsx' },
      { id: 'contact', label: 'Contact', file: 'sections/Contact.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: RelayAtelier,
};
