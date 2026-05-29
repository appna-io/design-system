import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'icon',
  displayName: 'Icon',
  description:
    'Library-agnostic icon primitive. Three render modes (`as` / `name` / `children`), DS color + size tokens with arbitrary-value fallbacks, decorative-by-default a11y, rotate / flip / spin utility props, `asChild` via Slot. Ships with `<IconProvider>` + `createIconRegistry` + `DS_ICON_NAMES` so consumers wire lucide / heroicons / radix-icons / iconify once and the entire DS surface lights up.',
  category: 'Primitives',
  tags: ['icon', 'svg', 'glyph', 'a11y', 'registry'],
};
