import { Select } from '@apx-ui/ds';

/**
 * Default is `matchTriggerWidth={true}` — the listbox stretches to the trigger's width via
 * Floating UI's `size` middleware. Pass `false` to let the listbox size itself by content (handy
 * when item labels are much longer than the trigger).
 */
export default function MatchTriggerWidth() {
  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <p className="mb-2 text-sm text-fg-muted">matchTriggerWidth (default)</p>
        <Select placeholder="Pick" aria-label="Default">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A very, very, very long option label</Select.Item>
            <Select.Item value="b">Short</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div>
        <p className="mb-2 text-sm text-fg-muted">matchTriggerWidth={'{false}'}</p>
        <Select placeholder="Pick" aria-label="Content-sized">
          <Select.Trigger />
          <Select.Content matchTriggerWidth={false}>
            <Select.Item value="a">A very, very, very long option label</Select.Item>
            <Select.Item value="b">Short</Select.Item>
          </Select.Content>
        </Select>
      </div>
    </div>
  );
}
