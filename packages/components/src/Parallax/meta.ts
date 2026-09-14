import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'parallax',
  displayName: 'Parallax',
  description:
    'Scroll-linked layer that drifts against the scroll, for hero backdrops and decorative imagery. Drift is clamped to a tenth of the travel — enforced, not documented, because larger parallax makes a page feel cheap and is a vestibular trigger above the reduced-motion threshold. Under prefers-reduced-motion the layer sits at its neutral position and no scroll listener is attached. For backgrounds only, never body copy.',
  category: 'Layout',
  tags: ['parallax', 'scroll', 'motion', 'depth', 'hero', 'animation'],
};
