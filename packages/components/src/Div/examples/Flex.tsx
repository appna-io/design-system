import { Div } from '@apx-ui/ds';

export default function Flex() {
  return (
    <Div display="flex" gap={12} p={3} bg="bg.paper" radius="md">
      <Div flex={1} p={3} bg="primary.subtle" radius="sm" fg="primary.contrast">
        flex: 1
      </Div>
      <Div flex={2} p={3} bg="secondary.subtle" radius="sm" fg="secondary.contrast">
        flex: 2
      </Div>
      <Div flex={1} p={3} bg="success.subtle" radius="sm" fg="success.contrast">
        flex: 1
      </Div>
    </Div>
  );
}