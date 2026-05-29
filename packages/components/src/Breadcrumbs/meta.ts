import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'breadcrumbs',
  displayName: 'Breadcrumbs',
  description:
    'Navigation-hierarchy primitive. Shows the user\'s path through a nested resource tree with custom separators, overflow collapse via Menu, polymorphic items for router integration, and full RTL. Array API + compound API both supported; the last item without an href is auto-rendered as the current page.',
  category: 'Navigation',
  tags: ['breadcrumbs', 'navigation', 'hierarchy', 'compound'],
};
