import { Select } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Select defaultValue="us" placeholder="Select a country" aria-label="Country">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="us">United States</Select.Item>
        <Select.Item value="ca">Canada</Select.Item>
        <Select.Item value="gb">United Kingdom</Select.Item>
        <Select.Item value="de">Germany</Select.Item>
        <Select.Item value="fr">France</Select.Item>
        <Select.Item value="jp">Japan</Select.Item>
        <Select.Item value="au">Australia</Select.Item>
      </Select.Content>
    </Select>
  );
}