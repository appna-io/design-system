import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'image',
  displayName: 'Image',
  description:
    'Content-imagery primitive: lazy by default, layout-stable via `aspectRatio`, token-mapped `radius`/`shadow`, `cover`/`contain` fit, and a `fallback` slot for failed sources. Opt-in hover treatments (`zoom` inside a fixed frame so the grid never reflows, `lift`) and a `hoverSrc` cross-fade fetched on first hover. Every hover rule is gated on a fine pointer, so nothing latches on touch. Sections render all pictures through it — no raw img.',
  category: 'Media',
  tags: ['image', 'img', 'picture', 'media', 'photo', 'hover', 'zoom', 'product'],
};
