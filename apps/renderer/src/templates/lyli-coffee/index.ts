import type { TemplateEntry } from '../types';
import { LyliCoffee } from './LyliCoffee';

const theme = {
  /**
   * The source's own palette, mapped onto semantic roles rather than used as literals — which
   * is what lets the whole page re-skin from one place:
   *
   *   cream    50 #FDF8F3 · 100 #F7EDE0 · 200 #EFDCC8
   *   espresso 700 #3D2314 · 800 #2A1810 · 900 #1A0F0A
   *   roast    400 #A67C52 · 500 #8B5E3C · 600 #6F4A30
   *   bean     500 #5C4033 · 600 #4A3329
   *
   * `primary` is the espresso action colour (`.btn-primary`, the dark bands), `secondary` is the
   * roast accent (eyebrow, links, the wordmark's full stop, the focus ring), `neutral` carries
   * the cream surfaces and muted text.
   *
   * This is the *default* selection, not a lock: it seeds the preview's scoped theme, and the
   * Colors panel edits on top of it, so any role can be recoloured live and reset back to here.
   *
   * Two deliberate omissions:
   *  - **No status colours.** The landing page defines none, so success/warning/danger/info stay
   *    on the DS defaults rather than being invented and passed off as ported.
   *  - **No dark palette.** The source has no authored dark mode; synthesising one would be a new
   *    design decision, so dark mode falls through to the global dark theme.
   */
  palette: {
    light: {
      primary: {
        main: '#2A1810',
        contrast: '#FDF8F3',
        hover: '#3D2314',
        active: '#1A0F0A',
        subtle: '#F7EDE0',
        border: '#3D2314',
      },
      secondary: {
        main: '#8B5E3C',
        contrast: '#FDF8F3',
        hover: '#6F4A30',
        active: '#6F4A30',
        subtle: '#F7EDE0',
        border: '#A67C52',
      },
      neutral: {
        main: '#5C4033',
        contrast: '#FDF8F3',
        hover: '#4A3329',
        active: '#4A3329',
        subtle: '#F7EDE0',
        border: '#EFDCC8',
      },
      background: { default: '#FDF8F3', paper: '#FFFFFF', subtle: '#F7EDE0' },
      foreground: { default: '#1A0F0A', muted: '#4A3329', subtle: '#5C4033' },
      border: { default: '#EFDCC8', subtle: '#F7EDE0', strong: '#A67C52' },
      focusRing: '#8B5E3C',
    },
  },
  // Playfair for headings, Source Sans for body. Webfont files are not shipped by the renderer,
  // so the fallbacks are load-bearing.
  typography: {
    fontFamily: {
      display: '"Playfair Display", Georgia, serif',
      sans: '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',
    },
  },
  // `rounded-full` buttons and inputs, `rounded-2xl` cards and images, `rounded-lg` menu rows.
  radius: {
    md: '9999px',
    lg: '0.5rem',
    xl: '1rem',
    '2xl': '1rem',
  },
  // The source's warm-tinted `shadow-card` / `shadow-elevated`.
  shadows: {
    md: '0 4px 24px rgba(42, 24, 16, 0.08)',
    lg: '0 12px 40px rgba(42, 24, 16, 0.12)',
    xl: '0 12px 40px rgba(42, 24, 16, 0.12)',
  },
} as const;

export const lyliCoffeeTemplate: TemplateEntry = {
  meta: {
    slug: 'lyli-coffee',
    name: 'Beans — Specialty Coffee',
    description:
      'A coffee landing page ported from the Lyli source: hero, featured single origins, a dark value-prop band, the roastery story, a three-step process, testimonials and a gradient newsletter capture. Ships with the roastery palette selected, and every surface is a semantic role — so recolouring any of them re-skins the whole page.',
    category: 'Marketing',
    tags: ['marketing', 'coffee', 'landing', 'port', 'brand-theme'],
    credit: 'Ported from lyle-coffee',
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'featured-beans', label: 'Featured beans', file: 'sections/FeaturedBeans.tsx' },
      { id: 'value-props', label: 'Why Beans?', file: 'sections/ValueProps.tsx' },
      { id: 'story', label: 'Our story', file: 'sections/Story.tsx' },
      { id: 'process', label: 'How it works', file: 'sections/Process.tsx' },
      { id: 'testimonials', label: 'Testimonials', file: 'sections/Testimonials.tsx' },
      { id: 'newsletter', label: 'Newsletter', file: 'sections/Newsletter.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: LyliCoffee,
};
