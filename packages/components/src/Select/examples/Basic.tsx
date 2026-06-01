import { Select } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Select placeholder="Select a fruit" aria-label="Fruit">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
        <Select.Item value="durian">Durian</Select.Item>
      </Select.Content>
    </Select>
  );
}