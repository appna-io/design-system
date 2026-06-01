import { useRef, useState } from 'react';
import { Button, Div, Input, Popover, Textarea, Typography } from '@apx-ui/ds';

/**
 * Stress-tests the focus trap: a Popover containing a multi-field form. Tabbing cycles between
 * the inputs and submit button; Shift-Tab from the first focusable wraps to the last.
 *
 * `initialFocus` is wired to the email field so screen-reader + keyboard users start where the
 * form actually expects input.
 */
export default function FormInside() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Div display="flex" alignItems="center" gap="3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button>Subscribe</Button>
        </Popover.Trigger>
        <Popover.Content size="lg" initialFocus={emailRef}>
          <Popover.Close />
          <form
            className="flex flex-col gap-3 pe-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              setOpen(false);
            }}
          >
            <Typography variant="bodySmall" weight="medium">
              Subscribe to updates
            </Typography>
            <Input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              required
              size="sm"
            />
            <Textarea placeholder="What are you most interested in?" rows={3} size="sm" />
            <Button type="submit" size="sm" className="self-end">
              Subscribe
            </Button>
          </form>
        </Popover.Content>
      </Popover>
      {submitted ? (
        <Typography as="span" variant="caption" color="fg.muted">
          Thanks! Form was submitted.
        </Typography>
      ) : null}
    </Div>
  );
}