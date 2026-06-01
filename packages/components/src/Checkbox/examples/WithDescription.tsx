import { Checkbox, Div } from '@apx-ui/ds';

export default function WithDescription() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Checkbox description="You can change this later in Settings.">
        Subscribe to product updates
      </Checkbox>
      <Checkbox
        color="success"
        defaultChecked
        description="We'll only email you about your account."
      >
        Allow account notifications
      </Checkbox>
    </Div>
  );
}