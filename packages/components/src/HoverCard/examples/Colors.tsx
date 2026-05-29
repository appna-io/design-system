import { HoverCard } from 'apx-ds';
import type { HoverCardColor } from 'apx-ds';

/**
 * Seven colors × `soft` variant. `soft` is the most color-rich variant — paper-based `solid`
 * doesn't read color, and `outline` paints only the 1px border. `soft` puts the color front
 * and center via a tinted background + colored text. Hover each row to see the color cell.
 */
const colors: HoverCardColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">
        Hover each link to compare the soft-variant color cells.
      </p>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {colors.map((color) => (
          <HoverCard key={color} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${color}`} className="text-primary underline">
                {color}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content variant="soft" color={color} size="sm">
              <strong className="text-sm">soft / {color}</strong>
              <p className="mt-1 text-xs">
                Tinted background + colored text. Useful for status / context cues.
              </p>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
