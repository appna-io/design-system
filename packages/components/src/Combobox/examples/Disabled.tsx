import { Combobox } from '@apx-ui/ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
];

export default function Disabled() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Combobox
        aria-label="Fruit (disabled)"
        placeholder="Pick a fruit"
        options={FRUITS}
        disabled
      />
      <Combobox
        aria-label="Fruit (disabled items)"
        placeholder="Banana + Durian are disabled"
        options={FRUITS}
        defaultOpen
      />
    </div>
  );
}
