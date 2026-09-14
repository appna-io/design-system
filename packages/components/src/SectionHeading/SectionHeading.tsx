import { forwardRef } from '@apx-ui/engine';
import type { ReactNode } from 'react';
import { useComponentDefaults } from '@apx-ui/theme';

import { Badge } from '../Badge/Badge';
import { Div } from '../Div';
import { toneOwnsItsGround, useSurfaceTone } from '../Surface';
import { Typography } from '../Typography';
import type {
  SectionHeadingProps,
  SectionHeadingSize,
} from './SectionHeading.types';

/**
 * `<SectionHeading />` — the eyebrow / title / body stack that opens a section.
 *
 * ## Why this is in the design system
 *
 * It had been written **four times**, once per template, ~60 lines each. The copies had drifted
 * in the way copies do: the same heading rendered at `text-3xl sm:text-4xl lg:text-[2.75rem]` in
 * one and `text-3xl sm:text-4xl` in another, one of them an arbitrary value. Nothing about that
 * was art direction — it was four people solving the same problem on different days.
 *
 * The only *real* difference between them was how the eyebrow was drawn: a chip, a hairline rule,
 * or plain small caps. That is a variant, not a fork.
 *
 * ## There is no `onDark` prop
 *
 * Two of the four copies had one, and each faked it differently — one hand-patched a chip with a
 * raw `var(--sds-palette-primary-contrast)`, the other added `opacity-80` to the body copy (which
 * is a contrast bug: 80% ink on a saturated brand fill measures under 4.5:1).
 *
 * The third copy was right and needed no such axis, because it sat inside a `Surface` and let the
 * *ground* say what colour the text should be. That is the pattern here. A heading should never
 * have to ask what it is sitting on — and a prop that lets it ask is a prop that will be forgotten
 * on the one band where it mattered.
 *
 * ```tsx
 * <SectionHeading eyebrow="Pricing" title="Simple, honest pricing" />
 * <SectionHeading eyebrowVariant="rule" title="The craft" align="center" />
 * <SectionHeading size="hero" level={1} title="Run the field like it is in the room" />
 * ```
 */

/** Visual size → the `Typography` variant that carries it. `hero` rides the fluid display scale. */
const SIZE_TO_VARIANT = {
  hero: 'displayXl',
  section: 'displayLg',
  // For a template whose register is quieter than a marketing hero. See the `display-md` token.
  sectionCompact: 'displayMd',
  sub: 'h3',
} as const satisfies Record<SectionHeadingSize, string>;

/**
 * Measure caps for the supporting paragraph. Full-width body copy at 1440px is the single most
 * common tell of a template nobody designed, so the cap is not optional.
 */
const BODY_MEASURE = 'max-w-2xl';

/**
 * Measure caps for the heading itself. Static rather than interpolated, because Tailwind scans
 * source text and never generates a class it cannot see written down.
 *
 * A display-scale heading needs its own cap: at 64px an uncapped line runs to a width the eye
 * cannot track back from, and the return sweep is where long-measure text actually loses people.
 */
const TITLE_MEASURE = {
  none: '',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
} as const;

/**
 * Static, because Tailwind scans source text: an interpolated `bg-${role}` is invisible to the
 * scanner, so the class is never generated and the hairline renders with no background at all.
 */
const RULE_CLASS = {
  primary: 'h-px w-8 bg-primary',
  secondary: 'h-px w-8 bg-secondary',
  neutral: 'h-px w-8 bg-neutral',
} as const;

export const SectionHeading = forwardRef<HTMLElement, SectionHeadingProps>(
  function SectionHeading(props, ref) {
    // A template sets its typographic treatment once, in its theme, rather than at every section:
    //   components: { SectionHeading: { defaultProps: { titleWeight: 'medium' } } }
    //
    // This is the fix for the finding that six of eight templates kept a hand-written copy of this
    // component. The eyebrow/title/body *relationship* is genuinely shared — the *treatment* is
    // per-template identity, and a component that hardcodes the treatment is one every template
    // has to route around. Consumer props still win, so one section can break the pattern.
    const {
      intro,
      eyebrow,
      eyebrowVariant = 'badge',
      eyebrowStyle,
      eyebrowColor,
      headingId,
      title,
      body,
      align = 'start',
      size = 'section',
      level = 2,
      titleWeight = 'bold',
      titleMeasure = 'none',
      bodyTone = 'muted',
      className,
      ...rest
    } = useComponentDefaults('SectionHeading', props);

    // Individual props win over the corresponding `intro` field, so a section can pass its whole
    // content object and still override just the title.
    const resolvedEyebrow = eyebrow ?? intro?.eyebrow;
    const resolvedTitle = title ?? intro?.title;
    const resolvedBody = body ?? intro?.body;

    const centered = align === 'center';

    // The eyebrow's colour is the one part of this component that chooses *between* palette roles
    // rather than reading one, so it is the one part a remapped ground can invalidate. On a brand
    // tone a `primary` chip is the brand painted on itself.
    //
    // `eyebrowColor` stays as the explicit override — art direction, or a ground whose tone vars
    // were set by hand rather than by `Surface`. What changed is the *default*: it now comes from
    // the surface instead of being `'primary'` everywhere. A default that is wrong on every brand
    // band is a default that has to be remembered, and this component exists because four
    // templates independently failed to remember exactly this.
    const tone = useSurfaceTone();
    const resolvedEyebrowColor = eyebrowColor ?? (toneOwnsItsGround(tone) ? 'neutral' : 'primary');

    return (
      <Div ref={ref} className={[centered ? 'text-center' : '', className].filter(Boolean).join(' ')} {...rest}>
        {resolvedEyebrow
          ? renderEyebrow(resolvedEyebrow, eyebrowVariant, centered, eyebrowStyle, resolvedEyebrowColor)
          : null}

        <Typography
          as={`h${level}`}
          variant={SIZE_TO_VARIANT[size]}
          weight={titleWeight}
          {...(headingId ? { id: headingId } : {})}
          // `scroll-mt` rides along with the id and is not optional. A fragment link that parks
          // the heading underneath a sticky header reads to the user as a broken link, and the
          // id is the only signal that this heading is a jump target.
          className={
            [
              resolvedEyebrow ? 'mt-5' : '',
              headingId ? 'scroll-mt-24' : '',
              TITLE_MEASURE[titleMeasure],
              titleMeasure !== 'none' && centered ? 'mx-auto' : '',
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
        >
          {resolvedTitle}
        </Typography>

        {resolvedBody ? (
          <Typography
            variant="bodyLarge"
            color={bodyTone === 'subtle' ? 'foreground.subtle' : 'foreground.muted'}
            lineHeight="relaxed"
            className={['mt-5', BODY_MEASURE, centered ? 'mx-auto' : ''].filter(Boolean).join(' ')}
          >
            {resolvedBody}
          </Typography>
        ) : null}
      </Div>
    );
  },
  'SectionHeading',
);

function renderEyebrow(
  eyebrow: ReactNode,
  variant: SectionHeadingProps['eyebrowVariant'],
  centered: boolean,
  style: SectionHeadingProps['eyebrowStyle'],
  color: NonNullable<SectionHeadingProps['eyebrowColor']>,
) {
  if (variant === 'badge') {
    return (
      <Badge
        variant={style?.variant ?? 'soft'}
        color={color}
        shape={style?.shape ?? 'pill'}
        size="sm"
      >
        {eyebrow}
      </Badge>
    );
  }

  if (variant === 'rule') {
    // The rule keeps `secondary` as its default rather than following the badge: the brass
    // hairline is this variant's whole identity in the template that uses it, and switching it to
    // the badge's role would be a silent visual change to a shipped page. On a surface that owns
    // its ground it still has to move, for the same reason the badge does.
    const ruleRole = color === 'primary' ? 'secondary' : color;

    return (
      <Div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
        {/* The hairline is what ties the eyebrow to the heading — one typographic unit, so it
            lives here rather than being re-assembled per section. */}
        {/* Same problem as the badge, and it was hiding one variant over: `secondary` is a brand
            role, brand roles do not remap per tone, so on a brand band the hairline and its label
            are drawn in a colour that has nothing to do with the ground. The resolved role
            follows the surface for the same reason. */}
        <Div aria-hidden className={RULE_CLASS[ruleRole]} />
        <Typography
          variant="overline"
          weight="semibold"
          color={`${ruleRole}.main`}
          transform="upper"
          letterSpacing="wider"
        >
          {eyebrow}
        </Typography>
      </Div>
    );
  }

  return (
    <Typography variant="overline" weight="semibold" transform="upper" letterSpacing="wider">
      {eyebrow}
    </Typography>
  );
}
