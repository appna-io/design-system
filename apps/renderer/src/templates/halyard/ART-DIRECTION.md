# Halyard — art direction

Lane 3 of the board in #6: docs / developer product. Per #6's rule 5, this note ships in the folder.

## The one thing that makes it _this_ template

**A genuine three-column docs layout**, built on `AppShell` + `TreeView` — the two components no
marketing template touches. The interesting part isn't the three columns; it's what a hand-built
grid quietly omits: the sidebar collapsing into a focus-trapped `Drawer` below `md`, the `<main>`
landmark, roving-tabindex keyboard traversal in the nav tree. This is the template that shows the
DS is more than a landing-page kit.

## Face — monospace as display

**JetBrains Mono** display over **Inter** body. Nothing else in the gallery can do this, and it
reads "developer" instantly and honestly rather than by decoration. Seven registers now, no
overlap: didone serif, heavy grotesque, geometric sans, quirky geometric, humanist, condensed,
**mono**.

The mono carries headings, the eyebrows, the version badge, every parameter name and type in the
API table, and both mock frames. Body copy is Inter, because a paragraph set in mono is a paragraph
nobody finishes.

## Palette — dark-first, terminal green

`preferredMode: 'dark'`, which nothing else in the gallery is (rule 3: one per wave). Near-black
ground `#07090C`, terminal green `#3DDC84` primary, electric blue `#4D9EFF` secondary for the
second-order accents.

Both brand roles are **light fills with dark ink**, which is the inversion Designer identified in
#4 as what buys contrast headroom — and it's why every step passes:

```
                          full    @90 (foreground.muted on the fill)
primary  #3DDC84         10.60   8.86  ✅
secondary #4D9EFF         6.96   6.11  ✅
body on ground #07090C   16.87         ✅   muted 8.15 ✅   subtle 4.62 ✅
light-mode primary        5.26   4.59  ✅   secondary 6.19 / 5.32 ✅
```

Measured before the sections were written, not after — the discipline from #4.

## Motion — the counter-example

**`fadeIn` only. No travel, no stagger, no parallax anywhere on the page.**

The board asked for the template that proves our motion rules include knowing when not to move,
and a reference page is the honest case: it's read non-linearly — people arrive at `#errors` from a
search result and scroll _up_ — so content that slides in from below while you scroll through it is
content you cannot read. Fading is the most that can be justified and it's close to the line.

The only thing that genuinely moves is the reader's position marker in the two rails, and that's
navigation state rather than decoration. One `IntersectionObserver`, in the orchestrator, feeding
both rails — two observers would be two answers to "where is the reader", and they diverge exactly
when both rails are on screen.

Section spacing is `py-14`, not #2's `py-20 lg:py-28`. That scale is tuned for bands you scroll
_past_; these are sections you scroll _within_, and marketing whitespace between them turns a
reference page into a scroll hunt.

## Geometry

`radius: sm`. Tight and technical, and the fifth distinct geometry after full pills, 2px corners,
generous rounding and the poster's hard edges.

## What it exercises that nothing else does

`AppShell` (header + sidebar + aside + footer, with the mobile drawer), `TreeView` as real
navigation, `Tabs` for package managers, `Accordion type="multiple"`, and `Table` twice with
different column shapes.

## Deliberate omissions

- **No syntax highlighting.** The renderer ships Shiki, so it was available — and using it would be
  wrong for a template. A template is a thing someone copies into their project; one whose code
  blocks need a highlighter either drags Shiki along or renders as unstyled text.
- **No `useScrollProgress` bar.** The board suggested one. The two rails already answer "where am
  I" more precisely than a progress bar can, and a third indicator of the same fact is noise.
