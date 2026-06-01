import { Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * Stripe-style link preview: hover an inline URL to see a small card with the page's title +
 * description. The trigger is an anchor with `href="#sds-overview"` so clicking doesn't navigate
 * Ahmad away from the docs page.
 */
export default function LinkPreview() {
  return (
    <Typography variant="bodySmall" as="p" className="max-w-prose">
      Read the{' '}
      <HoverCard>
        <HoverCard.Trigger>
          <a href="#sds-overview" className="text-primary underline">
            apx-dsrview
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content size="lg">
          <Div display="flex" flexDirection="column" gap="2">
            <strong className="text-sm">apx-dsesign System</strong>
            <Typography variant="caption" color="fg.muted">
              A modern, themed React design system built around a typed token engine and
              composable primitives. 50+ components, accessibility-first.
            </Typography>
            <Typography as="span" variant="caption" color="primary" className="underline">
              apx-ds →
            </Typography>
          </Div>
        </HoverCard.Content>
      </HoverCard>{' '}
      to see what&rsquo;s covered.
    </Typography>
  );
}