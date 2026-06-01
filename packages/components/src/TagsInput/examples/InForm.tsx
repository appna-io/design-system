import { useState } from 'react';
import { Button, Div, TagsInput, Typography } from '@apx-ui/ds';

export default function InForm() {
  const [submitted, setSubmitted] = useState<string[] | null>(null);

  return (
    <Div
      as="form"
      display="flex"
      flexDirection="column"
      gap="3"
      alignItems="flex-start"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(data.getAll('tags').map(String));
      }}
    >
      <TagsInput
        label="Tags"
        name="tags"
        required
        defaultValue={['react']}
      />
      <Button type="submit" variant="solid">Submit</Button>
      {submitted ? (
        <Typography as="span" variant="caption" color="fg.muted">
          Submitted: <code>{JSON.stringify(submitted)}</code>
        </Typography>
      ) : null}
    </Div>
  );
}