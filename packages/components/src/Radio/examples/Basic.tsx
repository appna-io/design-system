import { Radio, RadioGroup } from '@apx-ui/ds';

export default function Basic() {
  return (
    <RadioGroup name="size" defaultValue="medium" aria-label="T-shirt size">
      <Radio value="small">Small</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="large">Large</Radio>
    </RadioGroup>
  );
}