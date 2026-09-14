import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'section-heading',
  displayName: 'SectionHeading',
  description:
    'The eyebrow / title / body stack that opens a section. Had been hand-written four times across the template gallery, drifting to three different heading sizes; the only genuine difference between the copies was how the eyebrow was drawn, which is now a variant (badge, rule or plain). Deliberately has no onDark prop — the Surface tone says what colour the text is, so a heading never has to ask what it is sitting on. Visual size and heading level are separate props, so a large heading can still tell the truth about the document outline.',
  category: 'Layout',
  tags: ['heading', 'section', 'eyebrow', 'typography', 'layout'],
};
