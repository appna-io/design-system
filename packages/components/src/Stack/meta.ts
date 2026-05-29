import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'stack',
  displayName: 'Stack',
  description:
    'Flex-based layout vocabulary. `<Stack>` (generic), `<HStack>` / `<VStack>` (axis-locked aliases), and `<Spacer>` (greedy or fixed separator). Pure layout — no state, no effects, RTL-correct by default via logical properties.',
  category: 'Layout',
  tags: ['stack', 'hstack', 'vstack', 'spacer', 'layout', 'flex', 'primitive'],
};
