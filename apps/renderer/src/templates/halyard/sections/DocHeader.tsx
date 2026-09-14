import { ArrowUpRight } from '@apx-ui/icons';
import { Badge, Button, Div, Typography } from '@apx-ui/ds';

import { brand, nav } from '../content';

/**
 * Header. Minimal on purpose — a docs page's chrome should be the least interesting thing on it,
 * and the sidebar already carries navigation. What earns its place here is the version badge: on a
 * docs site "which version am I reading" is the question that costs the most when unanswered.
 *
 * `AppShell` supplies the sticky positioning and the mobile drawer trigger, so neither is written
 * here — that is the whole reason to use the shell rather than assemble a three-column grid.
 */
export function DocHeader() {
  return (
    <Div className="flex w-full items-center justify-between gap-4">
      <Div className="flex items-center gap-3">
        {/* The mark: a halyard is the rope that raises a flag, so — a line and a tensioned
            triangle. Drawn with a clip-path rather than shipped as an asset, so it inherits the
            palette in both modes. */}
        <Div aria-hidden className="flex h-6 items-center gap-1">
          <Div className="h-6 w-0.5 bg-primary" />
          <Div
            className="h-4 w-3 bg-primary"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />
        </Div>

        <Typography
          size="h4"
          weight="bold"
          fontFamily="display"
          letterSpacing="tight"
          className="text-lg"
        >
          {brand.name}
        </Typography>

        <Badge variant="soft" color="neutral" shape="square" size="sm">
          {brand.version}
        </Badge>
      </Div>

      <Div className="flex items-center gap-1">
        <Div className="hidden items-center gap-1 sm:flex">
          {nav.links.map((link) => (
            <Button key={link.href} size="sm" variant="ghost" color="neutral" asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </Div>

        <Button size="sm" variant="outline" color="neutral" asChild>
          <a href={nav.ctas[0]!.href} className="inline-flex items-center gap-1.5">
            {nav.ctas[0]!.label}
            <ArrowUpRight size={14} />
          </a>
        </Button>
      </Div>
    </Div>
  );
}
