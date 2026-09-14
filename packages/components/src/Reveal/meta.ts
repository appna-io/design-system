import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'reveal',
  displayName: 'Reveal',
  description:
    "Scroll-reveal wrapper with the design system's choreography already applied. Wraps Div's viewport trigger and variant orchestration, and supplies the judgement on top: which preset, how long, how far apart, and when to fire on mount instead. Every knob is a named intent — there is no distance, stagger interval, easing name or duration in the API, because those are design decisions and a call site that can set them is a call site that will drift. Staggered grids can cascade by row, which keeps a twelve-item grid inside the one-second choreography budget. Reduced motion renders children fully visible and final.",
  category: 'Layout',
  tags: ['reveal', 'scroll', 'animation', 'stagger', 'motion', 'viewport'],
};
