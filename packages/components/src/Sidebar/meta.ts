/**
 * Component metadata used by the docs renderer and the component-catalog tooling. Mirrors the
 * shape every other compound component exports so the example registry generator picks it up.
 */
export const meta = {
  name: 'Sidebar',
  displayName: 'Sidebar',
  description:
    'Vertical navigation rail with sections, items, badges, expandable groups, and rail mode.',
  category: 'Layout',
  tags: ['navigation', 'sidebar', 'rail', 'nav', 'menu'],
} as const;
