import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'typography',
  displayName: 'Typography',
  description:
    'Text primitive. A variant-driven `<Typography />` / `<Text />` that picks the right semantic element (`h1`–`h6` / `p` / `span` / `code`), carries token-aware shorthand props for the typography surface (`fontSize`, `weight`, `lineHeight`, `letterSpacing`, `fontFamily`), ships text-friendly shortcuts (`italic`, `align`, `transform`, `decoration`, `truncate`, `lineClamp`), and inherits the full `<Div />` styling + polymorphism + animation + responsive show/hide + pseudo-state hook surface.',
  category: 'Layout',
  tags: ['typography', 'text', 'heading', 'h1', 'h2', 'paragraph', 'caption', 'code', 'primitive'],
};
