import { HoverCard } from '@apx-ui/ds';

/**
 * The canonical "@mention hover" pattern. The trigger is a real anchor (`<a href>`) so it
 * carries its own role + accessible name; HoverCard wires `aria-describedby` to the panel so a
 * screen reader announces both. Hover (or Tab to focus) the link to see the card.
 */
export default function Basic() {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-fg-muted">
        Hover (or focus with Tab) the @mention to preview the user.
      </p>
      <p className="text-sm">
        Pinged{' '}
        <HoverCard>
          <HoverCard.Trigger>
            <a href="#user-ahmad" className="text-primary underline">
              @ahmad
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <div className="flex gap-3">
              <div
                aria-hidden="true"
                className="size-10 shrink-0 rounded-full bg-primary-subtle text-primary flex items-center justify-center font-semibold"
              >
                AI
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-sm">Ahmad Igbaryya</strong>
                <span className="text-xs text-fg-muted">@ahmad</span>
                <p className="text-xs">Software engineer building design systems.</p>
              </div>
            </div>
          </HoverCard.Content>
        </HoverCard>{' '}
        about the spec.
      </p>
    </div>
  );
}
