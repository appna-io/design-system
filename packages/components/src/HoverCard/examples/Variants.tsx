import { HoverCard } from '@apx-ui/ds';
import type { HoverCardVariant } from '@apx-ui/ds';

/**
 * Three visual variants — `solid` (default, paper bg + neutral border), `outline` (paper +
 * colored border), `soft` (tinted bg + low-opacity colored border). Color axis is pinned to
 * `primary` here so Ahmad can compare the variant chrome at a glance.
 */
const variants: HoverCardVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">Hover each label to see the variant chrome.</p>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {variants.map((variant) => (
          <HoverCard key={variant} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${variant}`} className="text-primary underline">
                {variant}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content variant={variant} color="primary" size="sm">
              <strong className="text-sm">variant: {variant}</strong>
              <p className="mt-1 text-xs">
                {variant === 'solid'
                  ? 'Paper background + neutral border. Default.'
                  : variant === 'outline'
                    ? 'Paper background + 1px colored border.'
                    : 'Subtle tinted background + low-opacity colored border.'}
              </p>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
