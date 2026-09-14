import type { TemplateEntry } from '../types';
import { CadenceOps } from './CadenceOps';

const theme = {
  /**
   * Violet, mint and slate — mapped onto semantic roles rather than used as literals, which is
   * what lets the whole page re-skin from one place:
   *
   *   violet 400 #7B5CFF · 500 #5B3DF5 · 600 #4A2FE0 · 700 #3F27C4
   *   mint   400 #2DD4BF · 500 #06B6A4 · 600 #0E9384
   *   slate  400 #6C7391 · 500 #454B63 · 600 #2E3347
   *   paper   50 #FFFFFF · 100 #F7F7FC · 200 #EFEFF8
   *
   * `primary` is the violet the buttons, the brand tile and the CTA band are cut from,
   * `secondary` is the mint that warms the hero's second gradient wash, `neutral` carries the
   * slate of muted text and the quiet outline buttons.
   *
   * This is the *default* selection, not a lock: it seeds the preview's scoped theme, and the
   * Colors panel edits on top of it, so any role can be recoloured live and reset back to here.
   *
   * **No status colours.** The page defines none of its own, so success/warning/danger/info stay
   * on the DS defaults — which matters here more than in the other two templates, because the
   * hero preview and the pricing checkmarks actually *use* `success`, and a product dashboard
   * inventing its own green is how a design system starts to fork.
   */
  palette: {
    light: {
      primary: {
        main: '#5B3DF5',
        contrast: '#FFFFFF',
        hover: '#4A2FE0',
        active: '#3F27C4',
        subtle: '#EFEBFF',
        border: '#C9BCFF',
      },
      secondary: {
        main: '#06B6A4',
        contrast: '#04231F',
        hover: '#0E9384',
        active: '#0E9384',
        subtle: '#E2FAF6',
        border: '#7FE3D6',
      },
      neutral: {
        main: '#454B63',
        contrast: '#FFFFFF',
        hover: '#2E3347',
        active: '#2E3347',
        subtle: '#EFEFF8',
        border: '#D8D8E8',
      },
      background: { default: '#F7F7FC', paper: '#FFFFFF', subtle: '#EFEFF8' },
      foreground: { default: '#0D0F1A', muted: '#454B63', subtle: '#6C7391' },
      border: { default: '#E0E0EF', subtle: '#EAEAF5', strong: '#C4C4DC' },
      focusRing: '#5B3DF5',
    },
    /**
     * Authored, not inherited. A product page whose identity *is* the violet cannot fall through
     * to the global dark theme without becoming a different product — and unlike the ink
     * barbershop, `primary` here is a saturated accent in both modes, so the mapping is the
     * straightforward one: lift the violet for contrast against a near-black page, keep white
     * text on it, and drop the surfaces rather than inverting any roles.
     */
    dark: {
      primary: {
        main: '#7B5CFF',
        contrast: '#FFFFFF',
        hover: '#8E74FF',
        active: '#5B3DF5',
        subtle: '#1B1733',
        border: '#4A3D8A',
      },
      secondary: {
        main: '#2DD4BF',
        contrast: '#04231F',
        hover: '#5CE3D2',
        active: '#06B6A4',
        subtle: '#0B2420',
        border: '#1F6B60',
      },
      neutral: {
        main: '#A8AEC6',
        contrast: '#08090F',
        hover: '#C4C9DC',
        active: '#8189A5',
        subtle: '#151827',
        border: '#2A2F45',
      },
      background: { default: '#08090F', paper: '#101322', subtle: '#0C0E18' },
      foreground: { default: '#F4F5FB', muted: '#A8AEC6', subtle: '#7C8398' },
      border: { default: '#232741', subtle: '#171A2B', strong: '#343A5C' },
      focusRing: '#7B5CFF',
    },
  },
  /**
   * A geometric grotesk for headings, a neutral sans for body. Webfont files are not shipped by
   * the renderer, so the fallbacks are load-bearing.
   */
  typography: {
    fontFamily: {
      display: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  /**
   * Generously rounded — the third distinct geometry in the gallery, after the coffee page's
   * full pills and the barbershop's hard 2px corners. All three are the same token block with
   * different values, which is the argument the gallery exists to make.
   */
  /**
   * Section headings here are centred and sit at the quieter `sectionCompact` step — 30 → 44px,
   * which is the ladder this page had hand-written as `text-3xl sm:text-4xl lg:text-[2.75rem]`
   * before the token existed. Set once, so no section has to restate it.
   */
  components: {
    SectionHeading: {
      defaultProps: {
        align: 'center',
        size: 'sectionCompact',
      },
    },
  },
  radius: {
    md: '0.625rem',
    lg: '0.875rem',
    xl: '1.125rem',
    '2xl': '1.5rem',
  },
  /** Soft, wide, violet-tinted — the diffuse elevation this kind of page reads as "modern". */
  shadows: {
    md: '0 4px 20px rgba(13, 15, 26, 0.06)',
    lg: '0 18px 48px rgba(13, 15, 26, 0.10)',
    xl: '0 32px 72px rgba(45, 32, 120, 0.16)',
  },
} as const;

export const cadenceOpsTemplate: TemplateEntry = {
  meta: {
    slug: 'cadence-ops',
    name: 'Cadence — Field Ops SaaS',
    description:
      'A B2B product landing page: split hero with a live dashboard preview built from DS primitives rather than a screenshot, capability tabs, feature grid, a horizontal workflow timeline, outcome metrics, three pricing tiers, one long testimonial, an FAQ accordion and a closing CTA band. Deliberately exercises the components no other template touches — NavigationMenu, Tabs, Accordion, Timeline, PricingCard, Progress, Avatar.',
    category: 'Marketing',
    tags: ['marketing', 'saas', 'product', 'pricing', 'brand-theme'],
    theme,
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'logos', label: 'Customer band', file: 'sections/LogoBand.tsx' },
      { id: 'product', label: 'Product tabs', file: 'sections/Product.tsx' },
      { id: 'features', label: 'Feature grid', file: 'sections/Features.tsx' },
      { id: 'workflow', label: 'Workflow timeline', file: 'sections/Workflow.tsx' },
      { id: 'metrics', label: 'Outcome metrics', file: 'sections/Metrics.tsx' },
      { id: 'pricing', label: 'Pricing', file: 'sections/Pricing.tsx' },
      { id: 'testimonial', label: 'Testimonial', file: 'sections/Testimonial.tsx' },
      { id: 'faq', label: 'FAQ', file: 'sections/Faq.tsx' },
      { id: 'cta', label: 'Closing CTA', file: 'sections/CtaBand.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: CadenceOps,
};
