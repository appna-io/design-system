import { HoverCard } from '@apx-ui/ds';
import type { HoverCardSize } from '@apx-ui/ds';

/**
 * Three sizes — `sm` / `md` (default) / `lg`. Drives padding, font-size, and the `min-width` /
 * `max-width` of the surface. Pick by content density: profile cards usually want `md` or `lg`;
 * inline definition popups want `sm`.
 */
const sizes: HoverCardSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">Hover each link to compare the size scale.</p>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {sizes.map((size) => (
          <HoverCard key={size} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${size}`} className="text-primary underline">
                size: {size}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content size={size}>
              <strong className="text-sm">size = {size}</strong>
              <p className="mt-1 text-xs">
                Drives padding, font-size, and min/max width of the floating surface.
              </p>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
