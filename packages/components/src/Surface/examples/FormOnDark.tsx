import { Button, Div, Input, Surface, Typography } from '@apx-ui/ds';

/**
 * The case that prompted `<Surface>` — a newsletter capture on a dark band.
 *
 * Previously this needed raw token values at the call site: `Input` has no on-dark variant (its
 * text comes from `text-fg` in every variant) and `Button` has no light fill, so both had to be
 * hand-rolled with `color-mix` against `primary.contrast`. Here neither one is special-cased.
 *
 * The glass field is `bg-bg-paper/10` — an ordinary DS token at 10%, which lands on the inverted
 * ground rather than the page's.
 */
export default function FormOnDark() {
  return (
    <Surface as="section" tone="inverted" className="rounded-lg p-8">
      <Div display="flex" flexDirection="column" gap="4" className="max-w-md">
        <Typography variant="overline">Stay in the loop</Typography>
        <Typography variant="h3">One email a month. Beans, not noise.</Typography>
        <Typography color="fg.muted">
          Placeholder and helper text stay legible because `foreground-muted` fades toward the new
          ground, not the old one.
        </Typography>

        <Div display="flex" gap="2" alignItems="center">
          <Input
            type="email"
            placeholder="you@example.com"
            aria-label="Email address"
            variant="outline"
            className="bg-bg-paper/10 backdrop-blur"
          />
          <Button color="neutral">Subscribe</Button>
        </Div>

        <Typography variant="caption">No spam. Unsubscribe whenever.</Typography>
      </Div>
    </Surface>
  );
}
