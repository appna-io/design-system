import { Checkbox } from 'apx-ds';

export default function WithDescription() {
  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}
