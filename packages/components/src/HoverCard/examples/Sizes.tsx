import { Div, HoverCard, Typography } from '@apx-ui/ds';
import type { HoverCardSize } from '@apx-ui/ds';

/**
 * Three sizes — `sm` / `md` (default) / `lg`. Drives padding, font-size, and the `min-width` /
 * `max-width` of the surface. Pick by content density: profile cards usually want `md` or `lg`;
 * inline definition popups want `sm`.
 */
const sizes: HoverCardSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Hover each link to compare the size scale.
      </Typography>
      <Div display="flex" alignItems="center" gap="6" className="flex-wrap text-sm">
        {sizes.map((size) => (
          <HoverCard key={size} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${size}`} className="text-primary underline">
                size: {size}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content size={size}>
              <strong className="text-sm">size = {size}</strong>
              <Typography variant="caption" className="mt-1">
                Drives padding, font-size, and min/max width of the floating surface.
              </Typography>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </Div>
    </Div>
  );
}