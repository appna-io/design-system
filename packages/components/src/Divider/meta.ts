import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'divider',
  displayName: 'Divider',
  description:
    'Token-mapped separator primitive. Horizontal or vertical rule, optional inline label (start/center/end), three thickness values and three border-color tokens. Renders `<hr>` by default, `<div role="separator">` when labeled. RTL-correct via `border-inline-start`.',
  category: 'Layout',
  tags: ['divider', 'separator', 'rule', 'hr'],
};