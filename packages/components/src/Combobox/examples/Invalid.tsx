import { Combobox, Div, Typography } from '@apx-ui/ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="1" className="max-w-sm">
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
      <Typography as="span" id="cb-invalid-err" variant="caption" color="danger">
        Please pick a fruit.
      </Typography>
    </Div>
  );
}