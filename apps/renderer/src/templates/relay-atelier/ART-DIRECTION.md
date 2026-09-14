# Relay Atelier — art direction

Lane 2 of the board in #6: portfolio / design studio. Per #6's rule 5, this note ships in the folder.

## The one thing that makes it _this_ template

**Enormous type, and almost nothing else.** The hero is four words at 120px with a rule under it.
If a reader does not notice the typography first, the template has not landed — which is the
board's own test, and the reason this lane exists at all.

## Face — contemporary high-contrast serif

**Instrument Serif** display over **Inter** body. The board asked for a high-contrast serif
_different from Playfair_ with more attitude and tighter tracking, and this is that register:
very high stroke contrast, tight fit, modern enough to read as art-directed rather than classical.
Eight display faces in the gallery now, no overlap — didone serif, heavy grotesque, geometric sans,
quirky geometric, neo-grotesque, humanist, mono, **contemporary high-contrast serif**.

The fallback stack matters more here than anywhere else in the gallery, because the page is set at
60–120px where a substitution is unmissable. So it walks Bodoni Moda → Didot → Playfair before it
gives up and reaches Georgia.

## The acceptance test for #2 G1

This is the first template to reach the top of the fluid display scale. `variant="display2Xl"`
resolves to `clamp(3.5rem, 9vw + 1rem, 7.5rem)` — **120px at the cap**, clearing the board's
"6rem+". Before G1 this hero would have been a hand-rolled `clamp()`, which is exactly what
Northbound had to write.

Verdict on the scale: **the steps are right.** `display2Xl` for the hero, `displayLg` for section
headings and case titles, `displayXl` for the contact address — three steps, no arbitrary values
anywhere in the template. The `vw + rem` preferred term is doing real work: the headline still
responds to a browser font-size override, which a bare `vw` would not (WCAG 1.4.4).

One note: the `max-w` on a `display2Xl` headline has to be in `ch`, not `rem`. At 120px the line
length that reads well is a function of the type size, and a `rem` measure tuned at the 3.5rem
floor is far too wide at the cap. Might be worth a line in G1's docs.

## Palette — near-monochrome, three appearances

Bone paper `#F7F5F2`, near-black ink `#141414`, one saturated vermilion `#B02E17`.

**`primary` is mapped to the ink, not to the accent.** That is the load-bearing decision. Map
`primary` to the vermilion and every default DS component — a `Button`, a `Badge` — reaches for it
automatically, and the accent budget is gone before the first section. With `primary` as the ink,
the DS's defaults are already monochrome and the accent must be asked for explicitly.

The accent appears in exactly **three** places on the whole page, counted rather than estimated:
the section numerals, the dots in the client band, and the email address in `Contact`.

Measured before the sections were written, both modes: ink 16.93 / 16.60, accent 5.94 / 6.72,
muted 8.48 / 7.53, subtle 4.93 / 5.20, and both roles safe as `Surface` fills.

## Geometry — `katana`

`preferredVariant: 'katana'`, with the template's own radii at `0`. Katana's diagonal corners
(rounded top-left + bottom-right, sharp on the other diagonal) are the one identity in the DS that
nothing else in the gallery uses, and at this scale they read as a deliberate cut rather than as
rounding. Shadows are `none` throughout — on a page this flat, an elevation is the only thing that
would look pasted on.

## Motion — expressive, within the rules

The most theatrical in the gallery, which the board asked for:

- The hero's three lines are three elements so they can **stagger at 90ms** in reading order. The
  hang of "itself." under "the thing" is the composition; a single string with `<br>`s could not
  stagger it. Plays on mount, done in about half a second (#2: above the fold does not
  scroll-reveal).
- **`blurIn` on the case-study frames** — on a large element it reads as a lens pulling focus.
- The client marquee runs `pauseOnHover`, which matters more here than on a decorative band: these
  are names someone might want to read.

**Parallax, at half the allowed ceiling.** The board specced background parallax on case imagery.
This shipped without one at first because the DS had no primitive and hand-rolling a scroll
listener would have been the local patch the workspace rule forbids; `Parallax` landed in #3 and
the case frames drift now at `speed={-0.05}`.

That is half of the component's own ±0.1 clamp, and deliberately: #2 caps parallax at ~10% of
scroll distance and calls it background-only, but on a near-monochrome page where the frames carry
most of the visual weight, even the ceiling reads as the layer arguing with the scroll. Negative,
so the frame lags the copy beside it — which is what makes a case study feel like a plate on a page
rather than a card sliding past.

The blur-in stays alongside it: `blurIn` is the arrival, the drift is what happens while you read.

## Two deliberate absences

- **No sticky header.** Alone in the gallery. A studio site whose chrome follows you down the page
  is one that does not trust its work to hold you; the nav is three links and you can scroll back.
- **No CTA band.** Every other template ends on a coloured band with a solid button. This one ends
  on an email address set at `displayXl` on the same paper as everything else. On a near-monochrome
  page a filled band would be the loudest thing on it — making the loudest thing a _container_
  rather than the work.

## What it exercises

`Marquee` with `pauseOnHover`, `Parallax`, the `_kit` `MockFrame` browser chrome (second template
to use the kit, and the check that the abstraction generalised), `Section` + `Reveal` from the kit,
`blurIn` and `riseIn` from #1, the full fluid display scale from G1, and the `katana` variant.
