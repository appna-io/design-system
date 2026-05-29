import { Combobox } from '@apx-ui/ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function Variants() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Combobox variant="outline" placeholder="outline" aria-label="Outline" options={FRUITS} />
      <Combobox variant="solid" placeholder="solid" aria-label="Solid" options={FRUITS} />
      <Combobox variant="ghost" placeholder="ghost" aria-label="Ghost" options={FRUITS} />
      <Combobox variant="underline" placeholder="underline" aria-label="Underline" options={FRUITS} />
    </div>
  );
}
