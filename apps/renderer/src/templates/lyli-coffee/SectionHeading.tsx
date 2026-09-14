import { Div, Typography } from '@apx-ui/ds';

/**
 * The source's `.section-heading` + `.section-subheading` pair, which five sections apply
 * identically. Shared here for the same reason the source made them CSS component classes —
 * they are one typographic unit and would always change together.
 *
 * No `onDark` axis. The two espresso bands (ValueProps, Newsletter) are `<Surface tone="primary">`
 * now, which re-points `foreground.*` at the cream contrast slot for everything inside — so the
 * plain tokens below are already correct there, and saying it a second time here would be a way
 * of letting the two drift apart.
 */
export interface SectionHeadingProps {
  title: string;
  body?: string;
  align?: 'start' | 'center';
}

export function SectionHeading({ title, body, align = 'start' }: SectionHeadingProps) {
  return (
    <Div className={align === 'center' ? 'text-center' : undefined}>
      <Typography
        as="h2"
        variant="h2"
        weight="semibold"
        letterSpacing="tight"
        fontFamily="display"
        className="text-3xl sm:text-4xl"
      >
        {title}
      </Typography>
      {body && (
        <Typography
          variant="bodyLarge"
          color="fg.subtle"
          className={`mt-3 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {body}
        </Typography>
      )}
    </Div>
  );
}
