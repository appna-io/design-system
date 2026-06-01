import { Div, HoverCard, Typography } from '@apx-ui/ds';
import type { HoverCardVariant } from '@apx-ui/ds';

/**
 * Three visual variants — `solid` (default, paper bg + neutral border), `outline` (paper +
 * colored border), `soft` (tinted bg + low-opacity colored border). Color axis is pinned to
 * `primary` here so Ahmad can compare the variant chrome at a glance.
 */
const variants: HoverCardVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Hover each label to see the variant chrome.
      </Typography>
      <Div display="flex" alignItems="center" gap="6" className="flex-wrap text-sm">
        {variants.map((variant) => (
          <HoverCard key={variant} openDelay={200} closeDelay={200}>
            <HoverCard.Trigger>
              <a href={`#${variant}`} className="text-primary underline">
                {variant}
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content variant={variant} color="primary" size="sm">
              <strong className="text-sm">variant: {variant}</strong>
              <Typography variant="caption" className="mt-1">
                {variant === 'solid'
                  ? 'Paper background + neutral border. Default.'
                  : variant === 'outline'
                    ? 'Paper background + 1px colored border.'
                    : 'Subtle tinted background + low-opacity colored border.'}
              </Typography>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </Div>
    </Div>
  );
}