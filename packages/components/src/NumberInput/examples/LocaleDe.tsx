import { NumberInput } from 'apx-ds';

export default function LocaleDe() {
  return (
    <NumberInput
      aria-label="German locale"
      defaultValue={1234.56}
      min={0}
      max={10_000_000}
      step={0.01}
      precision={2}
      locale="de-DE"
      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
    />
  );
}
