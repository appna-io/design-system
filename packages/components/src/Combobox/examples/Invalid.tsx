import { Combobox } from 'apx-ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function Invalid() {
  return (
    <div className="flex flex-col gap-1 max-w-sm">
      <label htmlFor="cb-invalid" className="text-sm font-medium">
        Fruit
      </label>
      <Combobox
        id="cb-invalid"
        placeholder="Pick a fruit"
        options={FRUITS}
        invalid
        aria-describedby="cb-invalid-err"
      />
      <span id="cb-invalid-err" className="text-xs text-danger">
        Please pick a fruit.
      </span>
    </div>
  );
}
