import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'surface',
  displayName: 'Surface',
  description:
    'Region primitive that establishes its own ground. `tone="inverted"` swaps the surface tokens (background / foreground / border, plus the neutral role) for its subtree, so Typography, Input, Button and everything else read as on-dark without any per-component `onDark` variant. Values are `color-mix`es of the inherited palette, so it inverts a scoped brand theme correctly and nests (two inversions cancel).',
  category: 'Layout',
  tags: ['surface', 'inverted', 'on-dark', 'band', 'section', 'ground'],
};
