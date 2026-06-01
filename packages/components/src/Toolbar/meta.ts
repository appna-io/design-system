import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'toolbar',
  displayName: 'Toolbar',
  description:
    'W3C-pattern action rail. Composes Buttons / Toggles / ToggleGroups / Menus into one accessible toolbar with a single Tab stop, arrow-key roving tabindex, RTL-aware navigation, optional ResizeObserver-based overflow → menu reflow, and optional auto-tooltip enrichment for iconic children.',
  category: 'Navigation',
  tags: ['toolbar', 'actions', 'compound', 'roving-tabindex', 'editor', 'rich-text'],
};