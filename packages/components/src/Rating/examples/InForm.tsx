import { useState } from 'react';
import { Button, Rating } from '@apx-ui/ds';

export default function InForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get('quality') ?? ''));
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
    >
      <Rating
        name="quality"
        label="Quality"
        required
        defaultValue={0}
      />
      <Button type="submit" variant="solid">Submit</Button>
      {submitted ? (
        <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
          Submitted value: <strong>{submitted || '(empty)'}</strong>
        </span>
      ) : null}
    </form>
  );
}
