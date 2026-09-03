import { Div, Typography } from '@apx-ui/ds';

/**
 * The source's `.section-heading` + `.section-subheading` pair, which five sections apply
 * identically. Shared here for the same reason the source made them CSS component classes —
 * they are one typographic unit and would always change together.
 *
 * `onDark` swaps to the inverted palette the ValueProps and Newsletter bands need, where the
 * surface is espresso and the type is cream.
 */
export interface SectionHeadingProps {
  title: string;
  body?: string;
  align?: 'start' | 'center';
  onDark?: boolean;
}

export function SectionHeading({
  title,
  body,
  align = 'start',
  onDark = false,
}: SectionHeadingProps) {
  return (
    <Div className={align === 'center' ? 'text-center' : undefined}>
      <Typography
        as="h2"
        variant="h2"
        weight="semibold"
        letterSpacing="tight"
        fontFamily="display"
        color={onDark ? 'primary.contrast' : undefined}
        className="text-3xl sm:text-4xl"
      >
        {title}
      </Typography>
      {body && (
        <Typography
          variant="bodyLarge"
          color={onDark ? 'primary.contrast' : 'fg.subtle'}
          className={`mt-3 max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${
            onDark ? 'opacity-80' : ''
          }`}
        >
          {body}
        </Typography>
      )}
    </Div>
  );
}
