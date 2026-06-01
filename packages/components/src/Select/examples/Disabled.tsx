import { Select } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Select disabled placeholder="Locked" aria-label="Locked">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="a">Option A</Select.Item>
      </Select.Content>
    </Select>
  );
}