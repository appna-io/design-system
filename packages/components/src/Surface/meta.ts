import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'surface',
  displayName: 'Surface',
  description:
    'Region primitive that establishes its own ground. `tone="inverted"` swaps the surface tokens (background / foreground / border, plus the neutral role) for its subtree; `tone="primary" | "secondary"` fills the region with a brand role and re-points those tokens at it. Either way Typography, Input, Button and everything else read correctly with no per-component `onDark` variant — `<Button color="neutral">` is the light button the band wants. Values are `color-mix`es of the inherited palette, so it composes with a scoped brand theme and nests (an inverted surface inside a brand band is the light card).',
  category: 'Layout',
  tags: ['surface', 'inverted', 'on-dark', 'band', 'section', 'ground', 'brand', 'cta'],
};
