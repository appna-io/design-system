import { Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * The canonical "@mention hover" pattern. The trigger is a real anchor (`<a href>`) so it
 * carries its own role + accessible name; HoverCard wires `aria-describedby` to the panel so a
 * screen reader announces both. Hover (or Tab to focus) the link to see the card.
 */
export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Hover (or focus with Tab) the @mention to preview the user.
      </Typography>
      <Typography variant="bodySmall" as="p">
        Pinged{' '}
        <HoverCard>
          <HoverCard.Trigger>
            <a href="#user-ahmad" className="text-primary underline">
              @ahmad
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Div display="flex" gap="3">
              <Div
                aria-hidden="true"
                className="size-10 shrink-0 rounded-full bg-primary-subtle text-primary flex items-center justify-center font-semibold"
              >
                AI
              </Div>
              <Div display="flex" flexDirection="column" gap="1">
                <strong className="text-sm">Ahmad Igbaryya</strong>
                <Typography as="span" variant="caption" color="fg.muted">
                  @ahmad
                </Typography>
                <Typography variant="caption">
                  Software engineer building design systems.
                </Typography>
              </Div>
            </Div>
          </HoverCard.Content>
        </HoverCard>{' '}
        about the spec.
      </Typography>
    </Div>
  );
}