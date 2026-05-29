import { Div } from '@apx-ui/ds';

export default function DisplayOn() {
  return (
    <Div display="flex" flexDirection="column" gap={8}>
      <Div p={3} bg="primary.50" radius="md" fg="primary.contrast">
        Always visible
      </Div>
      <Div displayOn="md" p={3} bg="success.50" radius="md" fg="success.contrast">
        Visible only from <code>md</code> upward.
      </Div>
      <Div displayOn="lg" p={3} bg="secondary.50" radius="md" fg="secondary.contrast">
        Visible only from <code>lg</code> upward.
      </Div>
    </Div>
  );
}
