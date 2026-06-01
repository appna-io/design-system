import { Div, Input, Select } from '@apx-ui/ds';

/**
 * The Select trigger heights are pinned to the same per-size scale as Input / Textarea
 * (sm=h-8, md=h-10, lg=h-12) so they line up on the same form row.
 */
export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="max-w-md">
      <Div display="flex" alignItems="end" gap="3">
        <Input size="sm" placeholder="Input sm" />
        <Select size="sm" placeholder="Select sm" aria-label="Select sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </Div>
      <Div display="flex" alignItems="end" gap="3">
        <Input size="md" placeholder="Input md" />
        <Select size="md" placeholder="Select md" aria-label="Select md">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </Div>
      <Div display="flex" alignItems="end" gap="3">
        <Input size="lg" placeholder="Input lg" />
        <Select size="lg" placeholder="Select lg" aria-label="Select lg">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </Div>
    </Div>
  );
}