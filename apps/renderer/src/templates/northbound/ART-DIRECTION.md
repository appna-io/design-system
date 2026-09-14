# Northbound — art direction

Lane 5 of the board in #6: events / conference. Per #6's rule 5, this note ships in the folder.

## The one thing that makes it _this_ template

**A schedule you could plan a day from.** Everything else on a conference page is persuasion; the
agenda is the product. So it is a real `<Table>` with real times, parallel tracks, room names and a
track filter — placed in the middle of the page rather than at the end, because burying it under
pricing would be selling a day nobody has read.

## Face — quirky geometric

**Space Grotesk** display over **Inter** body. The board's rule is one display register per
template, and the three shipped ones hold didone serif (lyli-coffee), heavy grotesque
(fade-and-co) and geometric sans (cadence-ops). Space Grotesk is geometric bones with genuinely
odd details — the splayed `M`, the single-storey `g`, the flat-topped `t` — which reads as
_designed for this event_ rather than as a neutral system face, and does not collide with cadence's
Plus Jakarta. Body stays neutral, per rule 2.

## Palette — duotone, not a tinted neutral

Ink navy `#151B3D` and signal orange `#FF5A1F`, and the point is that **both carry weight**. The
ground switches between them section to section rather than one being background and the other a
garnish: the hero is navy, the topic band and the closing CTA are orange, the venue band is the
page's own ink inverted, and paper runs between them.

That is also the honest test of #4's `Surface` brand tones — if two brand tones cannot sit near
each other and both read, the token map is wrong, and this template is where that would show.

`primary` is the navy, `secondary` the orange, `neutral` a warm slate. No status colours are
authored: success/warning/danger stay on the DS defaults.

## Motion — punctual

The other templates' motion is decorative; it plays once and the page is static. A conference's
whole proposition is that something happens at a specific time, so:

- **The countdown is the only thing that keeps moving**, and it moves because the fact changed.
  Digits are `tabular-nums` in fixed-width columns so 09 → 10 never shifts the separator, and they
  are _replaced_ rather than transitioned — which is what makes the component correct for
  reduced-motion users with no branch.
- **One interval, repeated: 80ms.** Stats, speakers, venue facts and tickets all stagger at the
  same rate. Repeating one interval across a page is what makes motion read as a schedule rather
  than as decoration; varying it per section is how templates end up with no personality at all.
- **Travel is `riseIn` for blocks, `fadeIn` for grid children.** No parallax, no blur-in — those
  belong to the portfolio lane and would make this page read as a studio site.
- **The agenda does not animate its rows.** It is the counter-example: rows that re-reveal on every
  filter change would be unusable. #2's "one reveal per viewport" budget is spent on the heading.
- Above the fold plays on mount, staggered, finished well under a second (#2).

## Geometry

`radius: sm` and **2px hard borders** everywhere — the section dividers, the stat grid, the
speaker cards, the agenda frame. Poster, not app. It is the fourth distinct geometry in the
gallery after full pills (lyli-coffee), 2px corners (fade-and-co) and generous rounding
(cadence-ops).

## What it exercises that nothing else does

`Table` (with `stickyHeader` and a live-region filter), `Marquee`, `Avatar` initials fallback, and
two `Surface` brand tones adjacent to an inverted one.

## Open, deliberately

`CalendarMock` is not built here. #6 listed `Scheduler` as the DS component for it, but `Scheduler`
is a booking component and this agenda is a read-only editorial table — forcing it would be
"reach for a DS component that isn't the right one just to say we did". The gap is written up
rather than papered over.
