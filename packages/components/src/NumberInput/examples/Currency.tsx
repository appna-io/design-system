import { NumberInput } from '@apx-ui/ds';

export default function Currency() {
  return (
    <NumberInput
      aria-label="Amount in USD"
      defaultValue={1299.99}
      min={0}
      max={1_000_000}
      step={0.01}
      precision={2}
      locale="en-US"
      format={{ style: 'currency', currency: 'USD' }}
    />
  );
}