import { useState, type FormEvent } from 'react';
import { Button, Div, Rating, Typography } from '@apx-ui/ds';

export default function InForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Div
      as="form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get('quality') ?? ''));
      }}
      display="flex"
      flexDirection="column"
      gap="3"
      alignItems="flex-start"
    >
      <Rating
        name="quality"
        label="Quality"
        required
        defaultValue={0}
      />
      <Button type="submit" variant="solid">Submit</Button>
      {submitted ? (
        <Typography as="span" variant="caption" color="fg.muted">
          Submitted value: <strong>{submitted || '(empty)'}</strong>
        </Typography>
      ) : null}
    </Div>
  );
}