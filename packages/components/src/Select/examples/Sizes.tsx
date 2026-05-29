import { Input, Select } from '@apx-ui/ds';

/**
 * The Select trigger heights are pinned to the same per-size scale as Input / Textarea
 * (sm=h-8, md=h-10, lg=h-12) so they line up on the same form row.
 */
export default function Sizes() {
  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="flex items-end gap-3">
        <Input size="sm" placeholder="Input sm" />
        <Select size="sm" placeholder="Select sm" aria-label="Select sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="flex items-end gap-3">
        <Input size="md" placeholder="Input md" />
        <Select size="md" placeholder="Select md" aria-label="Select md">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="flex items-end gap-3">
        <Input size="lg" placeholder="Input lg" />
        <Select size="lg" placeholder="Select lg" aria-label="Select lg">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
          </Select.Content>
        </Select>
      </div>
    </div>
  );
}
