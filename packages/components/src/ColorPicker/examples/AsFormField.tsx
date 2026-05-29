import { useState } from 'react';
import { Button, ColorPicker } from 'apx-ds';

export default function AsFormField() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get('brandColor') ?? ''));
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
    >
      <ColorPicker
        name="brandColor"
        label="Brand color"
        description="Used for primary buttons + links"
        helperText="WCAG AA recommended against white"
        required
        defaultValue="#6c5ce7"
      />
      <Button type="submit" variant="solid">
        Save
      </Button>
      {submitted ? (
        <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
          Submitted: <strong>{submitted}</strong>
        </span>
      ) : null}
    </form>
  );
}
