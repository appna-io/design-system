import { Div, Typography } from '@apx-ui/ds';

/**
 * The eyebrow / rule / title / body stack that opens six of this page's sections. One
 * typographic unit — the brass hairline is what ties the eyebrow to the heading — so it is
 * shared rather than re-assembled per section.
 *
 * It carries no on-dark variant. The dark bands are `Surface tone="inverted"` now, so the plain
 * `foreground.*` tokens are already correct inside them — a second `onDark` axis here would be
 * a way of saying twice what the surface has said once.
 */
export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'start' | 'center';
}

export function SectionHeading({ eyebrow, title, body, align = 'start' }: SectionHeadingProps) {
  return (
    <Div className={align === 'center' ? 'text-center' : undefined}>
      <Div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <Div aria-hidden className="h-px w-8 bg-secondary" />
        <Typography
          variant="overline"
          weight="semibold"
          color="secondary.main"
          transform="upper"
          letterSpacing="wider"
        >
          {eyebrow}
        </Typography>
      </Div>

      <Typography
        as="h2"
        variant="h2"
        weight="bold"
        lineHeight="tight"
        letterSpacing="tight"
        fontFamily="display"
        transform="upper"
        className="mt-4 text-3xl sm:text-4xl"
      >
        {title}
      </Typography>

      {body && (
        <Typography
          variant="bodyLarge"
          lineHeight="relaxed"
          color="foreground.subtle"
          className={`mt-4 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {body}
        </Typography>
      )}
    </Div>
  );
}
