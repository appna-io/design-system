import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'stepper',
  displayName: 'Stepper',
  description:
    "Multi-step progress indicator for wizards, onboarding, and checkout flows. Three variants (numbered / dots / progress), five step statuses (pending / active / complete / error / loading), horizontal + vertical layouts, optional clickable + linear modes, and a compound `<Stepper.Step>` API for inline expanded content.",
  category: 'Navigation',
  tags: ['stepper', 'wizard', 'progress', 'onboarding', 'compound'],
};