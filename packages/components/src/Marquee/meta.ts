import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'marquee',
  displayName: 'Marquee',
  description:
    'Continuously scrolling band for logo tickers, category rails and press strips. Pure CSS — the track renders its children twice and translates by one copy on a linear infinite keyframe, so there is no frame loop or scroll listener. Four directions, three named speeds, optional pause-on-hover and edge fade. Under prefers-reduced-motion it becomes a native scroll region rather than a stopped animation, so every item stays reachable.',
  category: 'Layout',
  tags: ['marquee', 'ticker', 'scroller', 'logos', 'carousel', 'animation'],
};
