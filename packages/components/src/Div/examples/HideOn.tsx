import { Div } from '@apx-ui/ds';

export default function HideOn() {
  return (
    <Div display="flex" flexDirection="column" gap={8}>
      <Div p={3} bg="primary.50" radius="md" fg="primary.contrast">
        Always visible
      </Div>
      <Div hideOn="md" p={3} bg="warning.50" radius="md" fg="warning.contrast">
        Hidden from <code>md</code> upward — resize the viewport to confirm.
      </Div>
      <Div hideOn="lg" p={3} bg="info.50" radius="md" fg="info.contrast">
        Hidden from <code>lg</code> upward.
      </Div>
    </Div>
  );
}
