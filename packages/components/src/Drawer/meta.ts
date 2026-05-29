import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'drawer',
  displayName: 'Drawer',
  description:
    'Edge-anchored sliding panel. Modal\'s cousin — same compound API (`Drawer.Trigger` / `Drawer.Content` / `Drawer.Header` / `Drawer.Body` / `Drawer.Footer` / `Drawer.Close`), same backdrop + focus-trap + scroll-lock lifecycle, but anchored to a viewport edge (`left` / `right` / `top` / `bottom`) and slides in from there. Second consumer of `useScrollLock` and the third of `mergeRefs` (which this phase promoted to the engine).',
  category: 'Overlays',
  tags: ['drawer', 'sheet', 'overlay', 'compound', 'edge'],
};
