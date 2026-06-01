import { Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * Inline glossary / definition pattern. Hover a term in running text to see a short definition.
 * The trigger here is a `<button type="button">` (visually styled as a dotted underline) so the
 * card is keyboard-reachable via Tab — `<a href>` would imply navigation we don't actually want.
 */
export default function DefinitionPopup() {
  return (
    <Typography variant="bodySmall" as="p" className="max-w-prose">
      A{' '}
      <HoverCard>
        <HoverCard.Trigger asChild>
          <button
            type="button"
            className="text-primary underline decoration-dotted underline-offset-2 cursor-help"
          >
            design token
          </button>
        </HoverCard.Trigger>
        <HoverCard.Content variant="soft" color="info" size="md">
          <strong className="block text-sm">design token</strong>
          <Typography variant="caption" className="mt-1">
            A single source-of-truth value (color, spacing, radius, typography) that every
            component reads through. Changing a token re-themes every consumer at once.
          </Typography>
        </HoverCard.Content>
      </HoverCard>{' '}
      is the smallest unit a design system distributes. Every component reads from them, so a
      theme swap is one update at the root.
    </Typography>
  );
}