import { Div, Marquee, Typography } from '@apx-ui/ds';

import { promises } from '../content';

/**
 * The promises band — a slow ticker rather than a static row.
 *
 * First real consumer of the DS `Marquee`. A storefront's guarantees are the classic case for one:
 * six short claims that all matter equally, where a static row would either wrap awkwardly or force
 * us to drop two.
 *
 * `speed="slow"` because this is ambient, not a call to action — and `pauseOnHover` so a reader who
 * wants to finish one can stop it. `Marquee` handles `prefers-reduced-motion` itself, which is
 * exactly why this is a DS component and not six divs and a keyframe.
 */
export function Promises() {
  return (
    <Div as="section" className="border-y border-border-subtle bg-bg py-4">
      <Marquee speed="slow" gap={12} pauseOnHover fade>
        {promises.map((promise) => (
          <Div key={promise} className="flex items-center gap-3">
            <Div aria-hidden className="size-1 shrink-0 rounded-full bg-primary" />
            <Typography
              variant="bodySmall"
              color="fg.muted"
              transform="upper"
              letterSpacing="wider"
              className="whitespace-nowrap text-xs"
            >
              {promise}
            </Typography>
          </Div>
        ))}
      </Marquee>
    </Div>
  );
}
