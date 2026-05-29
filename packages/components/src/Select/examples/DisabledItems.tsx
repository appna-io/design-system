import { Select } from 'apx-ds';

export default function DisabledItems() {
  return (
    <Select placeholder="Pick a tier" aria-label="Tier">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="free">Free</Select.Item>
        <Select.Item value="pro">Pro</Select.Item>
        <Select.Item value="enterprise" disabled>
          Enterprise (contact sales)
        </Select.Item>
        <Select.Item value="custom" disabled>
          Custom (coming soon)
        </Select.Item>
      </Select.Content>
    </Select>
  );
}
