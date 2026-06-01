import { Div, Select, Typography } from '@apx-ui/ds';

/**
 * Default is `matchTriggerWidth={true}` — the listbox stretches to the trigger's width via
 * Floating UI's `size` middleware. Pass `false` to let the listbox size itself by content (handy
 * when item labels are much longer than the trigger).
 */
export default function MatchTriggerWidth() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="max-w-md">
      <Div>
        <Typography variant="bodySmall" color="fg.muted" className="mb-2">
          matchTriggerWidth (default)
        </Typography>
        <Select placeholder="Pick" aria-label="Default">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A very, very, very long option label</Select.Item>
            <Select.Item value="b">Short</Select.Item>
          </Select.Content>
        </Select>
      </Div>
      <Div>
        <Typography variant="bodySmall" color="fg.muted" className="mb-2">
          matchTriggerWidth={'{false}'}
        </Typography>
        <Select placeholder="Pick" aria-label="Content-sized">
          <Select.Trigger />
          <Select.Content matchTriggerWidth={false}>
            <Select.Item value="a">A very, very, very long option label</Select.Item>
            <Select.Item value="b">Short</Select.Item>
          </Select.Content>
        </Select>
      </Div>
    </Div>
  );
}