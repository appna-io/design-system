import { forwardRef } from '@apx-ui/engine';

import { Div } from '../Div';
import { Surface } from '../Surface';
import type {
  SectionAtmosphere,
  SectionAtmosphereAnchor,
  SectionProps,
  SectionRhythm,
  SectionWidth,
} from './Section.types';

/**
 * `<Section />` — one page band: its ground, its container and its vertical rhythm, in one element.
 *
 * ## Why this composes `Surface` instead of sitting beside it
 *
 * `Surface` already owns "this region establishes its own ground", including the capture-element
 * trick that makes a tone inversion work without a custom-property cycle. A separate rhythm
 * primitive would mean every band in every template is written as
 * `<Surface tone="…"><Section>…</Section></Surface>` — a wrapper order the author has to
 * remember, and getting it wrong breaks the capture element *silently*: the padded box swallows
 * it and a nested inversion resolves against the wrong palette.
 *
 * So a band is one element. `Surface` stays the low-level primitive for a card or a partial-width
 * region that needs a ground but not a page rhythm.
 *
 * ```tsx
 * <Section id="pricing">…</Section>
 * <Section tone="primary" rhythm="spacious">…</Section>       // the CTA band
 * <Section width="full" rhythm="flush"><Marquee>…</Marquee></Section>
 * <Section atmosphere>…</Section>                             // hero, with light in it
 * ```
 *
 * ## Two elements, two jobs
 *
 * The outer element carries the ground and bleeds edge to edge. The inner one carries the
 * container and the padding. That split is what makes `width="full"` mean what a designer means
 * by it — the *colour* runs to the edges while the copy stays on the same line as every other
 * section on the page. A single element cannot express that, which is why every template that
 * wanted a full-bleed band before this hand-wrote two divs.
 */

/**
 * The rhythm scale. Adjacent sections should not share the same value across a colour change —
 * the eye needs the break to read as a break — which is why there are four steps and not two.
 */
const RHYTHM: Record<SectionRhythm, string> = {
  compact: 'py-20 lg:py-28',
  default: 'py-24 lg:py-32',
  spacious: 'py-28 lg:py-40',
  flush: '',
};

/** Horizontal padding is constant across every width — only the max-width changes. */
const GUTTER = 'px-4 sm:px-6 lg:px-8';

const WIDTH: Record<SectionWidth, string> = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-[88rem]',
  full: 'max-w-7xl',
};

const OPPOSITE: Record<SectionAtmosphereAnchor, SectionAtmosphereAnchor> = {
  'top-left': 'bottom-right',
  'top-right': 'bottom-left',
  'bottom-left': 'top-right',
  'bottom-right': 'top-left',
};

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(props, ref) {
  const {
    tone = 'default',
    rhythm = 'default',
    width = 'default',
    atmosphere,
    as = 'section',
    className,
    containerClassName,
    children,
    ...rest
  } = props;

  const config: SectionAtmosphere = typeof atmosphere === 'object' ? atmosphere : {};
  const anchor = config.anchor ?? 'top-left';

  return (
    <Surface
      ref={ref}
      as={as}
      tone={tone}
      className={['relative overflow-hidden', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {atmosphere ? (
        <>
          {/*
            Two offset radial washes, never one linear gradient. A single linear gradient reads as
            a band — a flat stripe of colour with an edge. Two radials anchored in opposite
            corners read as *light* falling across the section, which is the difference between a
            page that looks designed and one that looks filled in.
          */}
          <Div
            decorative
            gradient={{
              type: 'radial',
              from: config.from ?? 'primary.subtle',
              to: 'transparent',
              position: anchor,
              size: '70% 90%',
            }}
          />
          <Div
            decorative
            gradient={{
              type: 'radial',
              from: config.counter ?? 'secondary.subtle',
              to: 'transparent',
              position: OPPOSITE[anchor],
              size: '60% 80%',
            }}
          />
        </>
      ) : null}

      <Div
        className={[
          'relative mx-auto w-full',
          WIDTH[width],
          GUTTER,
          RHYTHM[rhythm],
          containerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </Div>
    </Surface>
  );
}, 'Section');
