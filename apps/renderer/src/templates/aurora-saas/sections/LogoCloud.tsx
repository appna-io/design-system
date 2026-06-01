import { Div, Typography } from '@apx-ui/ds';

import { trustedLogos } from '../data';

export function LogoCloud() {
  return (
    <Div as="section" className="border-b border-border bg-bg-subtle/40">
      <Div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Typography
          variant="overline"
          align="center"
          color="fg.muted"
          weight="semibold"
        >
          Trusted by product teams at
        </Typography>
        <Div as="ul" className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustedLogos.map((name) => (
            <Typography
              key={name}
              as="li"
              variant="bodyLarge"
              weight="semibold"
              letterSpacing="tight"
              className="text-fg-muted/70 transition hover:text-fg"
            >
              {name}
            </Typography>
          ))}
        </Div>
      </Div>
    </Div>
  );
}