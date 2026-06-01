import { NumberInput } from '@apx-ui/ds';

export default function Percentage() {
  return (
    <NumberInput
      aria-label="Tax rate"
      defaultValue={0.1}
      min={0}
      max={1}
      step={0.01}
      precision={4}
      locale="en-US"
      format={{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }}
    />
  );
}