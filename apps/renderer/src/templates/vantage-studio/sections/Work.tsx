import { ArrowUpRight } from '@apx-ui/icons';
import { Div, Image, Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { work, workSection } from '../data';

/**
 * Case-study grid — the section this page exists for, so it gets the most room and the most
 * motion.
 *
 * The grid is two columns, and a `wide` card takes both. That gives the alternating full-bleed /
 * paired rhythm an editorial spread has, and — unlike a four-column grid — it cannot strand a
 * card next to two columns of nothing when the run of work does not divide evenly. The spans are
 * content (`data.ts`), not layout guesswork, so re-ordering the work does not re-derive the grid.
 *
 * The hover zoom used to be hand-rolled here — `overflow-hidden` plus `transition-transform
 * duration-700 group-hover:scale-[1.04]` — on the argument that how hard a photo scales is *this
 * brand's* motion and not the DS's business. That argument was wrong, and #3's `Image
 * hoverEffect="zoom"` is the proof: every template wanted the same gesture, so what looked like
 * art direction was really a missing component prop. The timing now comes from the theme rather
 * than from a number picked here.
 */
const SPAN = {
  wide: 'sm:col-span-2',
  tall: 'sm:col-span-1',
} as const;

const RATIO = {
  wide: '16/9',
  tall: '4/5',
} as const;

export function Work() {
  return (
    <Section as="section" id="work" width="wide">
      <Reveal>
        <SectionHeading
          intro={workSection}
          eyebrowVariant="rule"
          size="section"
          titleMeasure="lg"
        />
      </Reveal>

      <Reveal
        as="ul"
        stagger="row"
        columns={2}
        delay="short"
        className="mt-16 grid list-none grid-cols-1 gap-x-6 gap-y-14 p-0 sm:grid-cols-2"
      >
          {work.map((item) => (
            <Reveal as="li" key={item.id} className={SPAN[item.size]}>
              <Div
                actLike="a"
                href={`#${item.id}`}
                className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
              >
                <Div className="relative rounded-xl bg-bg-subtle">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    hoverEffect="zoom"
                    aspectRatio={RATIO[item.size]}
                    fit="cover"
                    radius="xl"
                    fullWidth
                    loading="lazy"
                    fallback={<Div className="h-full w-full bg-neutral-subtle" />}
                  />
                  <Div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-fg/10"
                  />
                </Div>

                <Div className="mt-5 flex items-start justify-between gap-4">
                  <Div>
                    <Typography
                      variant="bodySmall"
                      color="fg.subtle"
                      transform="upper"
                      letterSpacing="wider"
                      className="text-xs"
                    >
                      {item.client} · {item.year}
                    </Typography>
                    <Typography
                      as="h3"
                      variant="h3"
                      weight="medium"
                      lineHeight="snug"
                      letterSpacing="tight"
                      fontFamily="display"
                      className={
                        item.size === 'wide'
                          ? 'mt-2 text-2xl sm:text-3xl lg:text-4xl'
                          : 'mt-2 text-2xl sm:text-3xl'
                      }
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="bodySmall" color="fg.subtle" className="mt-2">
                      {item.discipline}
                    </Typography>
                  </Div>

                  <Div
                    aria-hidden
                    className="mt-1 shrink-0 text-fg-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  >
                    <ArrowUpRight size={22} />
                  </Div>
                </Div>
              </Div>
            </Reveal>
          ))}
        </Reveal>
    </Section>
  );
}
