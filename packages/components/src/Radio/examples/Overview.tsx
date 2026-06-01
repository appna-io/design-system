import { Radio, RadioGroup } from '@apx-ui/ds';

/**
 * Quick-review demo: a three-option radio group with one option selected.
 */
export default function Overview() {
  return (
    <RadioGroup name="shipping" defaultValue="standard" aria-label="Shipping speed">
      <Radio value="standard">Standard (5–7 days)</Radio>
      <Radio value="express">Express (2 days)</Radio>
      <Radio value="overnight">Overnight</Radio>
    </RadioGroup>
  );
}