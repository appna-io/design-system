import { Radio, RadioGroup } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup
        invalid
        required
        aria-label="Shipping speed"
        aria-describedby="shipping-error"
      >
        <Radio value="standard">Standard (5–7 days)</Radio>
        <Radio value="express">Express (2 days)</Radio>
        <Radio value="overnight">Overnight</Radio>
      </RadioGroup>
      <p id="shipping-error" className="text-xs text-danger">
        Please choose a shipping speed to continue.
      </p>
    </div>
  );
}
