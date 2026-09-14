# Fernwood — art direction

Lane 1 (e-commerce) of the board in #6. DTC home & pantry goods.

## The one idea

**The product photography is the colour; the interface is not.** Every decision below follows from
that, and the template is the gallery's argument that restraint is a design position rather than an
absence of one.

## Face

**Humanist sans** — General Sans as display over Inter. The board's free register, and the right
one: humanist warmth is what a goods brand wants, and it is the opposite of `vantage-studio`'s cold
grotesque, which matters because the same author built both.

Body face stays neutral (Inter), per rule 2. The display face carries the identity alone.

## Palette

One saturated accent, low chroma everywhere else.

```
forest  700 #0F3D2C · 600 #14523C · 500 #1B6A4E
clay    600 #9A4527 · 500 #B4522E
paper    50 #FBFAF7 · 100 #F4F2ED · 200 #E7E3DA
ink     900 #171512 · 700 #56514A · 500 #78716A
```

Deep forest green is the only unclaimed hue in the gallery — espresso, ink/brass, violet/mint,
navy/orange and black/lime are taken — and it is the accent least likely to fight food and
homeware photography. The paper is warm (`#FBFAF7`, not white) for the same reason `lyli-coffee`'s
is: a pure white ground makes warm product shots look yellowed.

### The rule that keeps it honest

**`secondary` (clay) is never a `Surface` tone.** Measured against #4's headroom model:

```
                              full   muted@80   subtle@65
primary   #14523C on #F4F8F5  8.51 ✅   6.11 ✅     4.62 ✅
secondary #B4522E on #FFF6F1  4.71 ✅   3.60 ⚠️     2.92 ❌
```

The clay has nothing like the ≥7:1 fill headroom a brand ground needs, so as a fill it would fail
exactly the way cadence's violet did. It exists only as a small-area accent **on paper** — a rule,
a sale chip, a struck price — where it reads 4.81:1 and passes.

This is correct by construction, not by luck, and it also serves the lane: "product photography is
the colour, the UI must not compete" and "two saturated grounds" are incompatible instructions.

There is exactly **one** brand-filled band (the newsletter), so #2's one-brand-band rule holds here
with no amendment.

## Radius

`2xl` and up — the most generous in the gallery, and the furthest thing from Vantage's squared 4px.
Soft goods, soft corners. The lookbook band goes further still at `2rem`.

## Motion personality: tactile

Where Northbound is *rhythmic* and Vantage is *editorial*, this one is **tactile** — it is the only
template whose primary motion responds to the pointer rather than to the scroll.

- **Product cards** carry it: `Image hoverEffect="zoom"` plus `hoverSrc` swapping to the second
  shot, which is the single most standard interaction in e-commerce and was not expressible at all
  before #3.
- **Maker portraits** use `hoverEffect="lift"`, not `zoom` — these are people, and scaling a
  portrait on hover reads as a product interaction.
- **Section chrome reveals plainly and quietly.** Headings `riseIn`, grids cascade by row.
- **`blurIn` is spent exactly once**, on the lookbook image, because a blurred layer re-rasterises
  every frame and that is the only element big enough to earn it.
- **Two sections deliberately do not animate:** the FAQ rows (the click is the motion that carries
  meaning) and the agenda-style promise marquee, which moves continuously instead.

## What this template proves

- First real consumer of `Marquee`, `Image hoverEffect` and `Image hoverSrc` (#3).
- `Surface tone="primary"` on a light template — the other brand-tone consumers are all dark.
- A five-section-deep page where the accent appears fewer than ten times in total.
