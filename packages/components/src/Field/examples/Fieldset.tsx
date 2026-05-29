import { Checkbox, Field, Stack } from 'apx-ds';

export default function FieldsetExample() {
  return (
    <Field as="fieldset" label="Notifications" helperText="Pick at least one channel.">
      <Field.Description>Choose how we contact you when activity happens.</Field.Description>
      <Stack gap={2}>
        <Checkbox name="notify-email" defaultChecked>
          Email
        </Checkbox>
        <Checkbox name="notify-sms">SMS</Checkbox>
        <Checkbox name="notify-push">Push notifications</Checkbox>
        <Checkbox name="notify-slack">Slack DM</Checkbox>
      </Stack>
    </Field>
  );
}
