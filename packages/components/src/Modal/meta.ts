import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'modal',
  displayName: 'Modal',
  description:
    'Blocking dialog overlay. Compound API (`Modal.Trigger` / `Modal.Content` / `Modal.Header` / `Modal.Body` / `Modal.Footer` / `Modal.Close`) with portal rendering, focus trap, escape-to-close, backdrop click-outside, and body-scroll lock. First consumer of the engine\'s `useScrollLock`, closing the Phase 17 Core overlay primitive audit.',
  category: 'Overlays',
  tags: ['modal', 'dialog', 'overlay', 'compound', 'blocking'],
};
