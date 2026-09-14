import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'section',
  displayName: 'Section',
  description:
    "One page band — ground, container and vertical rhythm in a single element. Composes Surface rather than sitting beside it, so a template never has to remember a wrapper order that breaks the tone capture silently when reversed. Four rhythm steps and four widths, all named rather than numeric, so templates cannot drift into different vertical rhythms. `width=\"full\"` bleeds the ground edge to edge while keeping children in the house container, and `atmosphere` renders the two offset radial washes that read as light rather than as a stripe of colour.",
  category: 'Layout',
  tags: ['section', 'layout', 'band', 'container', 'rhythm', 'surface'],
};
