import { useState } from 'react';
import { Button, TagsInput } from '@apx-ui/ds';

export default function InForm() {
  const [submitted, setSubmitted] = useState<string[] | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(data.getAll('tags').map(String));
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
    >
      <TagsInput
        label="Tags"
        name="tags"
        required
        defaultValue={['react']}
      />
      <Button type="submit" variant="solid">Submit</Button>
      {submitted ? (
        <span style={{ fontSize: 12, color: 'var(--sds-color-fg-muted)' }}>
          Submitted: <code>{JSON.stringify(submitted)}</code>
        </span>
      ) : null}
    </form>
  );
}
