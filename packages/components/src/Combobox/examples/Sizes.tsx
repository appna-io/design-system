import { Combobox } from '@apx-ui/ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Combobox size="sm" placeholder="sm" aria-label="Small" options={FRUITS} />
      <Combobox size="md" placeholder="md" aria-label="Medium" options={FRUITS} />
      <Combobox size="lg" placeholder="lg" aria-label="Large" options={FRUITS} />
    </div>
  );
}
