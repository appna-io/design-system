import { useState } from 'react';
import { Button, Div, NumberInput, Typography } from '@apx-ui/ds';

export default function FormSubmission() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get('quantity')));
      }}
    >
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm">
        <label htmlFor="form-submission-quantity" className="font-medium">
          Quantity (USD)
        </label>
        <NumberInput
          id="form-submission-quantity"
          name="quantity"
          defaultValue={1299.99}
          min={0}
          step={0.01}
          precision={2}
          locale="en-US"
          format={{ style: 'currency', currency: 'USD' }}
        />
        <Typography variant="caption" color="fg.muted">
          The hidden input submits a canonical number (no thousand separators, no currency glyph).
        </Typography>
      </Div>
      <Button type="submit" size="sm">
        Submit
      </Button>
      {submitted !== null ? (
        <Typography variant="caption" color="fg.muted">
          FormData received: <code>{submitted}</code>
        </Typography>
      ) : null}
    </form>
  );
}