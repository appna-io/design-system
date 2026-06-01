import { Select } from '@apx-ui/ds';

export default function WithGroups() {
  return (
    <Select placeholder="Select a country" aria-label="Country">
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.Label>Europe</Select.Label>
          <Select.Item value="fr">France</Select.Item>
          <Select.Item value="de">Germany</Select.Item>
          <Select.Item value="es">Spain</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Asia</Select.Label>
          <Select.Item value="jp">Japan</Select.Item>
          <Select.Item value="kr">South Korea</Select.Item>
          <Select.Item value="cn" disabled>
            China
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  );
}