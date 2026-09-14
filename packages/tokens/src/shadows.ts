import type { ShadowScale } from '@apx-ui/engine';

export const shadows: ShadowScale = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  /**
   * Marketing elevation. The scale above is Tailwind's default black-alpha, which is correct for
   * product UI and wrong for a landing page in two ways.
   *
   * **It greys.** A card lifting on hover over a warm ground goes grey rather than warmer, because
   * a neutral black shadow ignores the palette entirely.
   *
   * **It disappears on dark.** A black-alpha shadow on a dark band is invisible — so a hover lift
   * inside `Surface tone="inverted"` or `tone="primary"` reads as nothing happening. Every dark
   * CTA band in the gallery has this problem today.
   *
   * `ambient` fixes both by tinting from `foreground-default` rather than from black. That role is
   * remapped by every `Surface` tone, so the shadow follows the ground automatically: near-black
   * ink on a light page gives a warm dark shadow, and on an inverted band the same token resolves
   * to a *light* halo — which is how elevation actually reads on dark. No tone-specific override,
   * no per-template patching.
   *
   * `glow` is the accent-coloured version for a deliberate lift on an interactive card. It tints
   * from `primary-main`, and brand roles deliberately do **not** remap per tone — so `glow` on a
   * `tone="primary"` band is primary-on-primary and invisible. That combination is a design
   * mistake rather than a bug: a glowing card belongs on a neutral ground.
   *
   * Both are two-layer — a tight contact shadow plus a wide diffuse one. A single layer reads as a
   * sticker; the contact layer is what makes an element look like it is resting on the page.
   */
  ambient:
    '0 2px 4px -2px color-mix(in srgb, var(--sds-palette-foreground-default) 10%, transparent), 0 12px 32px -12px color-mix(in srgb, var(--sds-palette-foreground-default) 18%, transparent)',
  glow: '0 4px 12px -4px color-mix(in srgb, var(--sds-palette-primary-main) 28%, transparent), 0 16px 40px -12px color-mix(in srgb, var(--sds-palette-primary-main) 22%, transparent)',
};