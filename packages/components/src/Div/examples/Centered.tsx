import { Div } from '@apx-ui/ds';

export default function Centered() {
  return (
    <Div centered h={200} bg="bg.paper" radius="md" border="1px dashed" borderColor="border.subtle">
      <Div p={3} bg="primary.50" radius="sm" fg="primary.contrast">
        centered
      </Div>
    </Div>
  );
}
