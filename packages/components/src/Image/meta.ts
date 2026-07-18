import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'image',
  displayName: 'Image',
  description:
    'Content-imagery primitive: lazy by default, layout-stable via `aspectRatio`, token-mapped `radius`/`shadow`, `cover`/`contain` fit, and a `fallback` slot for failed sources. Sections render all pictures through it — no raw `<img>`.',
  category: 'Media',
  tags: ['image', 'img', 'picture', 'media', 'photo'],
};
