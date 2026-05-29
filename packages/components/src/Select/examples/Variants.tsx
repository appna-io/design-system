import { Select } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Select variant="outline" placeholder="Outline" aria-label="Outline">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Option A</Select.Item>
          <Select.Item value="b">Option B</Select.Item>
        </Select.Content>
      </Select>
      <Select variant="solid" placeholder="Solid" aria-label="Solid">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Option A</Select.Item>
          <Select.Item value="b">Option B</Select.Item>
        </Select.Content>
      </Select>
      <Select variant="ghost" placeholder="Ghost" aria-label="Ghost">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Option A</Select.Item>
          <Select.Item value="b">Option B</Select.Item>
        </Select.Content>
      </Select>
      <Select variant="underline" placeholder="Underline" aria-label="Underline">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Option A</Select.Item>
          <Select.Item value="b">Option B</Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
}
