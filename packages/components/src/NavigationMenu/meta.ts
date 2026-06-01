/**
 * Component metadata used by the docs renderer and the component-catalog tooling.
 * Mirrors the shape every other compound component exports so the example
 * registry generator picks it up.
 */
export const meta = {
  name: 'NavigationMenu',
  displayName: 'NavigationMenu',
  description:
    'Horizontal top-nav with dropdowns and mega-menus, with W3C Menubar keyboard support and animated active-state indicator.',
  category: 'Navigation',
  tags: ['navigation', 'menu', 'navbar', 'menubar', 'mega-menu', 'dropdown'],
} as const;