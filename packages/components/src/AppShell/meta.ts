import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'app-shell',
  displayName: 'AppShell',
  description:
    'Canonical product layout primitive. Composes four slots (header / sidebar / aside / footer) plus main content into a CSS-Grid-driven shell with two layout variants, responsive sidebar collapse to a Drawer on mobile, optional desktop rail-collapse, RTL-aware logical positioning, a skip-to-content link, and a `useAppShell()` context hook for header components.',
  category: 'Layout',
  tags: ['app-shell', 'layout', 'dashboard', 'admin', 'sidebar', 'header', 'responsive'],
};