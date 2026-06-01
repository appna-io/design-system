import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'popover',
  displayName: 'Popover',
  description:
    'Interactive floating panel — Tooltip\'s focusable cousin. First consumer of the engine\'s full overlay surface (`usePosition` + `<Portal>` + `useEscapeStack` + `useFocusTrap` + `useOutsideClick`). Compound API (`Popover.Trigger` / `Popover.Content` / `Popover.Arrow` / `Popover.Close`) supports rich content, focus trapping, and `modal` mode.',
  category: 'Overlays',
  tags: ['popover', 'floating', 'overlay', 'panel', 'dialog'],
};