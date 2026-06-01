import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'toggle',
  displayName: 'Toggle',
  description:
    'Binary-state button + segmented multi-button group. Standalone <Toggle> for one-off pressed-state affordances; <ToggleGroup type="single|multiple"> for toolbars and segmented controls. Reuses the Button visual language.',
  category: 'Forms',
  tags: ['toggle', 'togglegroup', 'segmented', 'toolbar', 'press-state'],
};