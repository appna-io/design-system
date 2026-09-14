import type { TemplateEntry } from '../types';
import { Fernwood } from './Fernwood';

/**
 * Forest green and warm paper — one saturated accent on a low-chroma ground. See
 * `ART-DIRECTION.md` for the full note and the measured contrast table.
 *
 *   forest 700 #0F3D2C · 600 #14523C · 500 #1B6A4E
 *   clay   600 #9A4527 · 500 #B4522E
 *   paper   50 #FBFAF7 · 100 #F4F2ED · 200 #E7E3DA
 *   ink    900 #171512 · 700 #56514A · 500 #78716A
 *
 * `primary` is the forest the newsletter band, the eyebrows and the star ratings are cut from.
 * `secondary` is the clay — and it is deliberately **never a `Surface` tone**: measured against
 * #4's headroom model it clears `full` but fails `muted@80` and `subtle@65` on its own fill, so as
 * a ground it would fail the way cadence's violet did. It exists only as small-area accent on
 * paper (4.81:1), which is also what the lane wants: the product photography is the colour.
 *
 * This is the *default* selection, not a lock: it seeds the preview's scoped theme, and the Colors
 * panel edits on top of it, so any role can be recoloured live and reset back to here.
 *
 * **The dark palette is authored, and it started as a mistake.** This shipped light-only on the
 * reasoning that a warm-paper storefront has no designed dark mode — which was wrong in a way the
 * owner spotted immediately: dark mode dropped the brand entirely and painted the page DS indigo.
 * #9's automatic derivation fixed *that*, and derivation is the right safety net, but it could not
 * make this identity work as a design: it lifted `primary` to a bright mint that reads as a
 * different brand, and left it with no contrast headroom, so `foreground.muted` on the newsletter
 * band failed.
 *
 * Hence real values. The constraint worth recording, because it is not obvious: `primary.main`
 * serves as **both** page text (on the ground) and as a **band fill** (with `contrast` as its
 * ink), and on a dark ground those pull in opposite directions — text wants light, a fill with
 * dark ink wants light too, but a *deep forest* fill would need light ink and then fail as text.
 * `#3EAE81` is the least-bright green that clears both (6.96:1 as text, 6.89:1 filled, 5.09
 * muted@80), so it stays as close to the forest as the roles allow rather than going mint.
 *
 * `secondary` keeps its light-mode discipline: still never a `Surface` tone, still only a
 * small-area accent, now at `#E08A63` so it reads on the dark ground (7.33:1).
 *
 * **No status colours.** The page defines none, so success/warning/danger/info stay on the DS
 * defaults rather than being invented and passed off as part of the identity.
 */
const theme = {
  palette: {
    light: {
      primary: {
        main: '#14523C',
        contrast: '#F4F8F5',
        hover: '#0F3D2C',
        active: '#0F3D2C',
        subtle: '#EAF2ED',
        border: '#B9D2C6',
      },
      secondary: {
        main: '#B4522E',
        contrast: '#FFF6F1',
        hover: '#9A4527',
        active: '#9A4527',
        subtle: '#FBEFE9',
        border: '#E3BFAE',
      },
      neutral: {
        main: '#171512',
        contrast: '#FBFAF7',
        hover: '#2E2A25',
        active: '#0E0C0A',
        subtle: '#F4F2ED',
        border: '#DDD8CE',
      },
      background: { default: '#FBFAF7', paper: '#FFFFFF', subtle: '#F4F2ED' },
      foreground: { default: '#171512', muted: '#56514A', subtle: '#78716A' },
      border: { default: '#E7E3DA', subtle: '#F0EDE6', strong: '#C9C2B5' },
      focusRing: '#14523C',    },
    /**
     * Measured, not derived. Every value below was checked against the ground it sits on:
     * `foreground.muted` 8.86:1, `foreground.subtle` 5.27:1, `primary` 6.96:1, `secondary`
     * 7.33:1, and `border.strong` 3.41:1 — that last one against WCAG 1.4.11's 3:1 for control
     * boundaries, which the first draft failed at 1.83:1.
     */
    dark: {
      primary: {
        main: '#3EAE81',
        contrast: '#06120D',
        hover: '#4CBE8F',
        active: '#2E9C72',
        subtle: '#132019',
        border: '#2A4A3B',
      },
      secondary: {
        main: '#E08A63',
        contrast: '#1A0D06',
        hover: '#EBA184',
        active: '#C4744F',
        subtle: '#221610',
        border: '#4A3225',
      },
      neutral: {
        main: '#F1F1F0',
        contrast: '#100E0A',
        hover: '#FFFFFF',
        active: '#DEDEDA',
        subtle: '#1B1712',
        border: '#332D25',
      },
      background: { default: '#100E0A', paper: '#191510', subtle: '#15120E' },
      foreground: { default: '#F1F1F0', muted: '#B5AFA6', subtle: '#8B857C' },
      border: { default: '#2A251E', subtle: '#1E1A15', strong: '#6E665A' },
      focusRing: '#3EAE81',
    },
  },
  /**
   * A humanist sans for display, a neutral sans for body. Webfont files are not shipped by the
   * renderer, so the fallbacks are load-bearing — the stack has to still read as warm when it
   * lands on the system face, which is why Avenir/Segoe precede the generic sans.
   */
  typography: {
    fontFamily: {
      display: '"General Sans", "Avenir Next", Avenir, "Segoe UI", system-ui, sans-serif',
      sans: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
  },
  /**
   * Typographic treatment for the shared `SectionHeading`, set once here rather than at every
   * section — which is what lets this template use the DS component instead of keeping its own
   * copy of it.
   *
   * The lighter display weight and the narrower title measure are this brand's identity, not a
   * per-section decision: a bold heading on a page whose whole register is quiet reads as a
   * different template.
   */
  components: {
    SectionHeading: {
      defaultProps: {
        eyebrowVariant: 'plain',
        titleWeight: 'medium',
        titleMeasure: 'md',
      },
    },
  },
  /** The most generous radii in the gallery. Soft goods, soft corners. */
  radius: {
    md: '0.625rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  /**
   * Warm, low-contrast shadows. Depth on this page comes from the paper/subtle surface steps and
   * from the photography, not from drop shadows — a hard shadow under a product shot reads as a
   * sticker.
   */
  shadows: {
    md: '0 4px 20px rgba(23, 21, 18, 0.06)',
    lg: '0 14px 44px rgba(23, 21, 18, 0.10)',
    xl: '0 24px 64px rgba(23, 21, 18, 0.12)',
  },
} as const;

export const fernwoodTemplate: TemplateEntry = {
  meta: {
    slug: 'fernwood',
    name: 'Fernwood — Home & Pantry Goods',
    description:
      'A DTC storefront built on restraint: photography carries the colour and the interface stays out of its way. Product grid with hover image-swap and zoom, a full-bleed lookbook, named makers, real reviews and a single brand-filled band. First template to consume the DS Marquee and Image hover work.',
    category: 'E-commerce',
    tags: ['e-commerce', 'storefront', 'dtc', 'retail', 'marquee', 'image-hover', 'brand-theme'],
    credit: 'Original — built for the gallery',
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'promises', label: 'Promises marquee', file: 'sections/Promises.tsx' },
      { id: 'shop', label: 'Product grid', file: 'sections/Shop.tsx' },
      { id: 'lookbook', label: 'Lookbook band', file: 'sections/Lookbook.tsx' },
      { id: 'stats', label: 'Proof band', file: 'sections/Stats.tsx' },
      { id: 'makers', label: 'The makers', file: 'sections/Makers.tsx' },
      { id: 'reviews', label: 'Reviews', file: 'sections/Reviews.tsx' },
      { id: 'faq', label: 'FAQ', file: 'sections/Faq.tsx' },
      { id: 'newsletter', label: 'Newsletter', file: 'sections/Newsletter.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: Fernwood,
};
