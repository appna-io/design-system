import { Badge, Div, Typography } from '@apx-ui/ds';

/**
 * The eyebrow / title / body stack that opens six of this page's sections.
 *
 * The eyebrow is a `Badge` rather than the small-caps rule the other two templates use — this
 * identity is soft and pill-shaped, and a chip reads as the same family as the buttons and the
 * pricing highlight instead of borrowing a rule that belongs to a squared brand.
 *
 * `onDark` flips it to the inverted treatment the CTA band needs. It swaps palette *roles*, not
 * literal colours, so recolouring `primary` re-skins both faces — except the chip, which has to
 * reach for the contrast token directly: `BadgeColor` has no inverse role, so a `primary` badge
 * on a `primary` fill would paint violet on violet. Same DS gap as the on-dark buttons.
 */
const ON_PRIMARY_CHIP = {
  borderColor: 'var(--sds-palette-primary-contrast)',
  color: 'var(--sds-palette-primary-contrast)',
} as const;

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'start' | 'center';
  onDark?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center',
  onDark = false,
}: SectionHeadingProps) {
  return (
    <Div className={align === 'center' ? 'text-center' : undefined}>
      <Badge
        variant={onDark ? 'outline' : 'soft'}
        color="primary"
        shape="pill"
        size="sm"
        style={onDark ? ON_PRIMARY_CHIP : undefined}
      >
        {eyebrow}
      </Badge>

      <Typography
        as="h2"
        variant="h2"
        weight="bold"
        lineHeight="tight"
        letterSpacing="tight"
        fontFamily="display"
        color={onDark ? 'primary.contrast' : undefined}
        className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </Typography>

      {body && (
        <Typography
          variant="bodyLarge"
          lineHeight="relaxed"
          color={onDark ? 'primary.contrast' : 'foreground.muted'}
          className={`mt-5 max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${
            onDark ? 'opacity-80' : ''
          }`}
        >
          {body}
        </Typography>
      )}
    </Div>
  );
}
