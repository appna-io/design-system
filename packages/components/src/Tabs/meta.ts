import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'tabs',
  displayName: 'Tabs',
  description:
    'Sectioned navigation primitive. Compound — `<Tabs>` + `<Tabs.List>` + `<Tabs.Trigger>` + `<Tabs.Panel>` — covers the full ARIA Tabs pattern (roving tabindex, arrow-key navigation, automatic vs manual activation, panel association) across four variants (underline / solid / pills / enclosed) and two orientations. The active indicator is a CSS-only `::after` crossfade; zero JS measurement, zero `getBoundingClientRect`.',
  category: 'Navigation',
  tags: ['tabs', 'navigation', 'sections', 'aria-tabs', 'compound'],
};