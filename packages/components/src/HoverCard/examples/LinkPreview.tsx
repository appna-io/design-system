import { HoverCard } from '@apx-ui/ds';

/**
 * Stripe-style link preview: hover an inline URL to see a small card with the page's title +
 * description. The trigger is an anchor with `href="#sds-overview"` so clicking doesn't navigate
 * Ahmad away from the docs page.
 */
export default function LinkPreview() {
  return (
    <p className="max-w-prose text-sm">
      Read the{' '}
      <HoverCard>
        <HoverCard.Trigger>
          <a href="#sds-overview" className="text-primary underline">
            apx-dsrview
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content size="lg">
          <div className="flex flex-col gap-2">
            <strong className="text-sm">apx-dsesign System</strong>
            <p className="text-xs text-fg-muted">
              A modern, themed React design system built around a typed token engine and
              composable primitives. 50+ components, accessibility-first.
            </p>
            <span className="text-xs text-primary underline">apx-ds →</span>
          </div>
        </HoverCard.Content>
      </HoverCard>{' '}
      to see what&rsquo;s covered.
    </p>
  );
}
