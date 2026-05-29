import { Radio, RadioGroup } from '@apx-ui/ds';

export default function Horizontal() {
  return (
    <RadioGroup
      orientation="horizontal"
      defaultValue="medium"
      aria-label="Density"
    >
      <Radio value="compact">Compact</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="comfortable">Comfortable</Radio>
    </RadioGroup>
  );
}
