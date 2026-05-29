import { useState } from 'react';
import { Button, NumberInput } from 'apx-ds';

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
      <div className="flex flex-col gap-1.5 text-sm">
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
        <span className="text-xs text-fg-muted">
          The hidden input submits a canonical number (no thousand separators, no currency glyph).
        </span>
      </div>
      <Button type="submit" size="sm">
        Submit
      </Button>
      {submitted !== null ? (
        <p className="text-xs text-fg-muted">
          FormData received: <code>{submitted}</code>
        </p>
      ) : null}
    </form>
  );
}
