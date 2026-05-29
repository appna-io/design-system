import { Textarea } from 'apx-ds';

export default function Disabled() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
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
    </div>
  );
}
