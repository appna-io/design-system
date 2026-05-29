import { NumberInput } from '@apx-ui/ds';

export default function LocaleAr() {
  return (
    <NumberInput
      aria-label="Arabic locale with Indic digits"
      defaultValue={1234.56}
      min={0}
      max={10_000_000}
      step={0.01}
      precision={2}
      locale="ar-EG"
      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
    />
  );
}
