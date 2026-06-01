import { Div, HoverCard, Typography } from '@apx-ui/ds';
import type { HoverCardColor } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Hover each link to compare the soft-variant color cells.
      </Typography>
      <Div display="flex" alignItems="center" gap="6" className="flex-wrap text-sm">
        {colors.map((color) => (
          <HoverCard key={color} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${color}`} className="text-primary underline">
                {color}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content variant="soft" color={color} size="sm">
              <strong className="text-sm">soft / {color}</strong>
              <Typography variant="caption" className="mt-1">
                Tinted background + colored text. Useful for status / context cues.
              </Typography>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </Div>
    </Div>
  );
}