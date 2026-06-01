import { Globe } from 'lucide-react';

import { Select } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Select placeholder="Select a region" aria-label="Region">
      <Select.Trigger leftIcon={<Globe className="size-4" />} />
      <Select.Content>
        <Select.Item value="emea" leftIcon={<span aria-hidden>🌍</span>}>
          Europe, Middle East &amp; Africa
        </Select.Item>
        <Select.Item value="amer" leftIcon={<span aria-hidden>🌎</span>}>
          Americas
        </Select.Item>
        <Select.Item value="apac" leftIcon={<span aria-hidden>🌏</span>}>
          Asia Pacific
        </Select.Item>
      </Select.Content>
    </Select>
  );
}