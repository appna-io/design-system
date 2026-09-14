import type { ReactNode } from 'react';
import type { DivProps } from '../Div';

/**
 * How the eyebrow is drawn. This is the **only** thing that differed between the four
 * hand-written copies of this component in the gallery — a chip, a hairline rule, or plain
 * small caps. One component, three treatments.
 */
export type SectionHeadingEyebrow = 'badge' | 'rule' | 'plain';

/**
 * How the `badge` eyebrow is drawn, for the templates whose identity is in that chip.
 *
 * The variant was originally fixed at `soft` / `pill` / `primary`, which reads as one deliberate
 * look until a template wants a *hard-edged filled bar* — and then the wrapper is swallowing three
 * props `Badge` already has. Northbound's eyebrow is exactly that bar and it is most of that
 * template's type signature, which is why a fifth hand-written `SectionHeading` still existed
 * after the kit landed.
 *
 * The colour is deliberately **not** here: it is derived from the ground. See `SectionHeadingProps.eyebrowColor`.
 */
export interface SectionHeadingEyebrowStyle {
  /** `Badge` fill treatment. Defaults to `'soft'`. */
  variant?: 'solid' | 'soft' | 'outline' | 'subtle' | undefined;
  /** `Badge` corner shape. Defaults to `'pill'`. */
  shape?: 'pill' | 'rounded' | 'square' | undefined;
}

/**
 * Visual size, decoupled from the heading level. `hero` is the fluid display scale; `section` is
 * the ordinary section opener; `sub` is for a heading inside a section.
 */
export type SectionHeadingSize = 'hero' | 'section' | 'sectionCompact' | 'sub';

/**
 * The content shape a section intro takes in the template kit — `{ eyebrow, title, body }`.
 *
 * Structural rather than imported: the DS cannot depend on the templates' content schema, and it
 * does not need to. Anything with these three fields fits, which is the point — a template hands
 * over the object its content file already holds instead of unpacking it into three props at
 * every call site.
 */
export interface SectionIntroLike {
  eyebrow?: ReactNode | undefined;
  title: ReactNode;
  body?: ReactNode | undefined;
}

export interface SectionHeadingProps extends Omit<DivProps, 'title' | 'children'> {
  /**
   * The whole intro as one object, instead of `eyebrow` / `title` / `body` separately.
   *
   * Templates keep their copy in a content file as exactly this shape, so passing it whole is
   * both shorter at the call site and the thing that makes a CMS-backed section a one-line
   * change. Individual props still win over the corresponding field, so a section can override
   * just the title.
   */
  intro?: SectionIntroLike | undefined;
  /**
   * Short label above the title. Omit it for a bare heading.
   *
   * `ReactNode`, not `string`, and for the same reason `title` and `body` are: an eyebrow is
   * often more than one run of text — a number and a label baseline-aligned, a label with an
   * icon. Typing it as a string forced a template with a decorated eyebrow to keep a whole
   * hand-written copy of this component to express one line of it.
   */
  eyebrow?: ReactNode | undefined;
  /** How the eyebrow is drawn. Defaults to `'badge'`. */
  eyebrowVariant?: SectionHeadingEyebrow | undefined;
  /**
   * Fill and shape for the `badge` eyebrow. Ignored by the other two variants.
   *
   * `eyebrowVariant="badge" eyebrowStyle={{ variant: 'solid', shape: 'square' }}` is the filled
   * bar a poster-register template wants.
   */
  eyebrowStyle?: SectionHeadingEyebrowStyle | undefined;
  /**
   * Palette role for the `badge` eyebrow. Defaults to `'primary'` — **except** that a `primary`
   * chip on a `primary` ground is violet-on-violet, so pass `'neutral'` inside a
   * `<Section tone="primary">` or `<Surface tone="primary">`.
   *
   * It is a prop rather than something the component detects, because the tone is expressed
   * purely in CSS custom properties: `Surface` re-points what the tokens resolve to, and there is
   * nothing in React for a descendant to read. Detecting it would mean a context that the *ground*
   * has to remember to publish — a second source of truth for a fact the CSS already knows, and
   * one that would be wrong for anyone who set the tone vars by hand.
   *
   * `'neutral'` is the right answer on every brand tone, because [#4](/issues/4)'s tone map points
   * the neutral role at the ground's contrast slot.
   */
  eyebrowColor?: 'primary' | 'secondary' | 'neutral' | undefined;
  /**
   * `id` for the **heading element**, not the wrapper.
   *
   * On the wrapper it would be nearly useless; on the heading it is what a URL fragment lands on,
   * which is why it comes with `scroll-mt` (see the component). A documentation template keys its
   * sidebar, its on-this-page rail and its scroll-spy off this one id — four things that must
   * agree, so there must only be one of them.
   */
  headingId?: string | undefined;
  /** The heading itself. Required unless `intro` supplies it. */
  title?: ReactNode | undefined;
  /** One paragraph under the title. Capped to a readable measure. */
  body?: ReactNode | undefined;
  /** Text alignment. Defaults to `'start'`. */
  align?: 'start' | 'center' | undefined;
  /** Visual size. Defaults to `'section'`. */
  size?: SectionHeadingSize | undefined;
  /**
   * Heading level for the document outline, independent of `size`. Defaults to 2.
   *
   * Separate because a visually-large heading is sometimes an `h3`, and forcing size and level to
   * move together means either the page looks wrong or the outline lies to a screen reader.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /**
   * Weight of the heading. Defaults to `'bold'`.
   *
   * A prop because it is the single most common reason a template kept its own copy of this
   * component: three of the eight run a *lighter* display weight as their identity, and a bold
   * heading is simply the wrong page for them. Set it once per template in
   * `theme.components.SectionHeading.defaultProps` rather than per section.
   */
  titleWeight?: 'medium' | 'semibold' | 'bold' | undefined;
  /**
   * Measure cap on the heading itself. Defaults to `'none'`.
   *
   * A display-scale heading needs its own cap — at 64px an uncapped line runs to a width nobody
   * can track back from. The body has always been capped; the title was not, and three templates
   * added their own.
   */
  titleMeasure?: 'none' | 'md' | 'lg' | undefined;
  /** Palette role for the supporting paragraph. Defaults to `'muted'`. */
  bodyTone?: 'muted' | 'subtle' | undefined;
}
