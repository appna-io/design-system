import { Div, Typography } from '@apx-ui/ds';

/**
 * The numbered eyebrow — `01 · SELECTED WORK`, with the index in the accent and the label quiet.
 *
 * This is a **node builder**, not a component copy. `SectionHeading.eyebrow` takes a `ReactNode`
 * now (#5), so the section number composes at the call site and the kit component stays unaware
 * that section numbers exist — which is right, because they are this template's editorial device
 * and not a general eyebrow feature. Ten lines here replaced a sixty-line fork of the heading.
 *
 * The index is one of the **three** places the accent appears on the whole page (see
 * `ART-DIRECTION.md`); the label deliberately is not, so the number reads as the marker and the
 * words stay supporting.
 *
 * `items-baseline` rather than `items-center`: the two sit at different optical weights and only
 * a shared baseline makes them read as one line rather than as a badge with text beside it.
 *
 * `label` is optional because `SectionIntro.eyebrow` is — every section that reaches for a numbered
 * eyebrow happens to have one, but taking the wider type here beats four `!` assertions at the
 * call sites, each of which would be a promise about content that content is free to break.
 */
export function sectionEyebrow(index: string, label: string | undefined) {
  return (
    <Div as="span" className="inline-flex items-baseline gap-4">
      <Typography
        as="span"
        variant="caption"
        weight="medium"
        color="secondary.main"
        className="tabular-nums"
      >
        {index}
      </Typography>
      <Typography
        as="span"
        variant="caption"
        weight="medium"
        transform="upper"
        letterSpacing="wider"
        color="fg.subtle"
      >
        {label}
      </Typography>
    </Div>
  );
}
