import { Div, Textarea } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-md">
      <Textarea
        disabled
        defaultValue="This textarea is disabled — not even tab-focusable."
        aria-label="Disabled textarea"
        rows={2}
      />
      <Textarea
        readOnly
        defaultValue="Read-only — tab-focusable, content selectable, just not editable."
        aria-label="Read-only textarea"
        rows={2}
      />
    </Div>
  );
}