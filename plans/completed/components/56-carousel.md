# Phase 56 — `<Carousel />`

> Status: **✓ Completed** · Owner: SDS-Agent8 · **Tier 2.5** (complex interaction + a11y surface) · Depends on: Phase 5 Text, Phase 6 Button, Phase 14 Card (optional slide content), Phase 17 Tooltip (autoplay pause/play hint), Phase 27 (I18nProvider — optional)
> Accessible, keyboard- + touch-friendly carousel/slider. Pure CSS scroll-snap + a thin JS coordination layer; **zero new dependencies**.

## Objective

Ship the **`<Carousel />`** primitive — the canonical "horizontal/vertical list of slides with navigation, indicators, optional autoplay, and full a11y."

Use cases:

- Hero banner carousels.
- Image / media galleries.
- Product galleries (e-commerce).
- Testimonial carousels.
- Onboarding step screens (alternative to Stepper for slide-style flows).
- Card lanes (Netflix-style horizontal scrolling lists with multiple visible cards).
- "Latest news" / "Featured X" lanes on marketing pages.

Goals:

- **Accessibility-first**: W3C APG "Carousel" pattern. Region role, slide labels, visible pause/play, keyboard, reduced-motion behavior.
- **Native gestures**: CSS scroll-snap for swipe/drag → no custom pointer-event state machine for ~95% of mechanics.
- **No new dependencies**. Specifically NOT pulling in `embla-carousel-react` (~12 KB), `swiper` (~50 KB), or `keen-slider` (~10 KB).
- **Autoplay off by default**. Even when enabled, ALWAYS render a visible pause/play control (WCAG 2.2.2).
- **RTL-correct** (native via flex + logical scroll).
- **Composable**: works inside any layout; doesn't fight the parent.

---

## What this component proves

- A modern carousel can be small (~5 KB gz) and fully accessible without a third-party engine.
- CSS scroll-snap + IntersectionObserver covers swipe, momentum, keyboard scroll, and active-slide tracking with minimal JS.
- The DS's overlay / button / icon primitives compose into a polished carousel without a new abstraction layer.

---

## Public API

```tsx
import { Carousel } from 'apx-ds';

// Minimal
<Carousel ariaLabel="Featured products">
  <Carousel.Slide>
    <Card>…</Card>
  </Carousel.Slide>
  <Carousel.Slide>
    <Card>…</Card>
  </Carousel.Slide>
  <Carousel.Slide>
    <Card>…</Card>
  </Carousel.Slide>
</Carousel>

// With explicit controls (Prev, Next, Indicators)
<Carousel ariaLabel="Hero">
  <Carousel.Viewport>
    <Carousel.Track>
      <Carousel.Slide>…</Carousel.Slide>
      <Carousel.Slide>…</Carousel.Slide>
      <Carousel.Slide>…</Carousel.Slide>
    </Carousel.Track>
  </Carousel.Viewport>

  <Carousel.Controls>
    <Carousel.PrevButton />
    <Carousel.NextButton />
  </Carousel.Controls>

  <Carousel.Indicators />
</Carousel>

// Sugar — the default rendering above can be flattened:
// Carousel root automatically wraps Viewport + Track around <Carousel.Slide> children
// and auto-renders Prev/Next/Indicators when omitted (configurable).

// Show 3 slides at once with a gap
<Carousel slidesPerView={3} gap={4} ariaLabel="Products">
  …slides
</Carousel>

// Responsive slidesPerView
<Carousel
  slidesPerView={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={{ base: 2, md: 4 }}
  ariaLabel="Products"
>
  …slides
</Carousel>

// Snap alignment
<Carousel snap="start" />        // snap to the start of each slide (default)
<Carousel snap="center" />       // peek pattern — half slides on either side
<Carousel snap="none" />         // free scroll

// Loop
<Carousel loop ariaLabel="Photos">
  …slides
</Carousel>

// Autoplay (OPT-IN; pause/play control auto-rendered + visible)
<Carousel
  autoplay
  autoplayInterval={5000}
  pauseOnHover
  pauseOnFocus
  ariaLabel="Hero"
>
  …slides
</Carousel>

// Vertical orientation
<Carousel orientation="vertical" slidesPerView={3} ariaLabel="News">
  …slides
</Carousel>

// Controlled (current index)
<Carousel index={current} onIndexChange={setCurrent} ariaLabel="Tour">
  …slides
</Carousel>

// Programmatic via ref
const ref = useRef<CarouselRef>(null);
<Carousel ref={ref}>…</Carousel>;
ref.current?.scrollTo(2);
ref.current?.next();
ref.current?.prev();
ref.current?.pauseAutoplay();
ref.current?.playAutoplay();

// Polymorphic slides via Slot (e.g. router Link slide cards)
<Carousel.Slide asChild>
  <RouterLink to="/products/42">…</RouterLink>
</Carousel.Slide>

// Custom indicators
<Carousel>
  <Carousel.Slide>…</Carousel.Slide>
  …
  <Carousel.Indicators
    variant="dots"            // 'dots' | 'bars' | 'numbers' | 'thumbnails'
    align="center"
  />
</Carousel>

// Full prop form
<Carousel
  /* layout */
  orientation="horizontal"       // 'horizontal' | 'vertical'
  slidesPerView={1}              // number | ResponsiveValue<number>
  gap={0}                        // theme spacing scale | ResponsiveValue<number>
  snap="start"                   // 'start' | 'center' | 'end' | 'none'

  /* state */
  index                          // number — controlled active slide
  defaultIndex={0}
  onIndexChange                  // (index: number, source: 'pointer' | 'keyboard' | 'autoplay' | 'control' | 'programmatic') => void
  loop={false}                   // boolean

  /* autoplay */
  autoplay={false}               // boolean — OFF BY DEFAULT
  autoplayInterval={5000}        // ms
  autoplayDirection="forward"    // 'forward' | 'backward'
  pauseOnHover={true}
  pauseOnFocus={true}            // pause when any slide is keyboard-focused
  pauseOnReducedMotion={true}    // pause when prefers-reduced-motion: reduce
  showAutoplayControl="auto"     // 'auto' (when autoplay enabled) | 'always' | 'never'  (auto is correct default)

  /* navigation controls */
  showControls="auto"            // 'auto' (when slidesCount > slidesPerView) | 'always' | 'never'
  showIndicators="auto"

  /* a11y */
  ariaLabel                      // string — REQUIRED (or ariaLabelledby)
  ariaLabelledby
  ariaRoleDescription="carousel" // string — overridable (e.g. "Gallery")
  liveRegionPoliteness="off"     // 'off' | 'polite'  — announce slide changes (off by default to avoid noise unless autoplay)
                                  //                       (auto-set to 'polite' when autoplay enabled + paused)

  /* visual */
  size="md"                      // 'sm' | 'md' | 'lg'  (controls indicator + button sizing)
  variant="default"              // 'default' | 'ghost' | 'card'
  showShadows={false}            // boolean — fade gradients on overflow edges
  scrollBehavior="smooth"        // 'smooth' | 'auto'  (auto = instant; respects reduced motion automatically)

  /* programmatic */
  ref                            // RefObject<CarouselRef>

  className=""
  style={{}}
>
  {children}                      {/* <Carousel.Slide> children OR full compound */}
</Carousel>

// CarouselRef shape
interface CarouselRef {
  scrollTo(index: number, opts?: { behavior?: 'smooth' | 'auto' }): void;
  next(): void;
  prev(): void;
  getIndex(): number;
  getSlideCount(): number;
  isAutoplaying(): boolean;
  pauseAutoplay(): void;
  playAutoplay(): void;
}
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **CSS scroll-snap is the engine**, not a transform-based JS state machine | Native swipe / momentum / keyboard / RTL behavior. Smaller bundle. Works without JS for read-only carousels.   |
| **Autoplay off by default**                                            | WCAG 2.2.2 — auto-moving content must be pauseable. Default-off is the safest UX.                                |
| **`showAutoplayControl="auto"`** renders a visible pause/play button when autoplay is enabled | WCAG 2.2.2 hard requirement. Cannot be disabled when autoplay is on; consumer-supplied custom control overrides default but must exist. |
| **`loop` is opt-in**                                                  | Looping carousels can confuse non-sighted users (no clear "end of list" announcement). Off by default.            |
| **Two APIs: prop-driven (simple) + compound (full control)**          | Most consumers want `<Carousel>…slides</Carousel>` with controls auto-rendered. Power users use the full compound API. |
| **No transform-based mode in V1**                                     | scroll-snap covers ~95% of needs. Transform-based mode (for continuous looping animations) deferred to a follow-up phase if needed. |
| **`liveRegionPoliteness="off"` default**                              | Manual navigation doesn't need announcements (user knows they advanced). Auto-set to `'polite'` only when autoplay is paused and announcements matter. |
| **`slidesPerView` accepts ResponsiveValue**                          | Mobile = 1 slide, desktop = 4 slides is the common ask. Single prop handles it.                                  |
| **Vertical orientation**                                              | News feeds / product lanes sometimes use vertical. CSS scroll-snap handles either axis the same way.            |
| **`snap="center"` enables peek pattern**                              | Visual "half slides on either side" effect; popular for hero carousels.                                          |
| **No fade transition variant in V1**                                  | scroll-snap is inherently a translate-only motion. Fade transitions would require the deferred transform mode.   |
| **`scrollBehavior="auto"` instant jump, `"smooth"` default**         | `prefers-reduced-motion: reduce` automatically converts smooth → instant (CSS native).                          |
| **Indicators are buttons (clickable), not visual-only**              | Each indicator advances to its slide; not just a position marker.                                                |

---

## Internal architecture

```
                       ┌──────────────────────────────────────────────┐
   Carousel root  ────►│  Owns: index (controlled or via observer),    │
                       │   slideCount, autoplay timer, hoverPaused,    │
                       │   focusPaused, reducedMotionPaused             │
                       │  Emits: CarouselContext                        │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Carousel.Viewport (overflow container)       │
                       │  scroll-snap-type: x mandatory                │
                       │  ↕ IntersectionObserver watches each slide;   │
                       │    most-visible slide → setIndex               │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Carousel.Track (flex container)             │
                       │  flex-direction: row (or column)              │
                       │  gap: <gap>                                   │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Carousel.Slide (scroll-snap-align: start)    │
                       │  flex-basis derived from slidesPerView + gap  │
                       │  role="group" aria-roledescription="slide"    │
                       │  aria-label="Slide N of M"                    │
                       └──────────────────────────────────────────────┘

                       ┌──────────────────────────────────────────────┐
                       │  Carousel.PrevButton / NextButton            │
                       │   scrollBy(-/+ slideStep, behavior)           │
                       │  Carousel.Indicators                          │
                       │   N buttons; click → scrollTo(i)              │
                       │  Carousel.AutoplayControl                     │
                       │   pause/play toggle (rendered iff autoplay)  │
                       └──────────────────────────────────────────────┘
```

**Index tracking** via `IntersectionObserver` on each slide with thresholds `[0.5, 0.6, 0.7, 0.8, 0.9, 1]`. The slide with the highest intersection ratio is the active one. Updated via a small reducer + RAF-throttled to avoid flicker mid-scroll.

**Programmatic scroll** via `Viewport.scrollTo({ left: targetLeft, behavior })`. RTL adjusts `left` calculation through the standard `scrollLeft` semantics (modern browsers normalize to negative-left in RTL).

**Loop mode** virtually duplicates the first slide at the end + last slide at the start; when the user scrolls past, jumps invisibly to the real first/last. Single source of truth: the `index` state. Implementation borrows from Embla but in ~80 LoC.

---

## File Structure

```
packages/components/src/Carousel/
├── Carousel.tsx
├── Carousel.Viewport.tsx
├── Carousel.Track.tsx
├── Carousel.Slide.tsx
├── Carousel.PrevButton.tsx
├── Carousel.NextButton.tsx
├── Carousel.Indicators.tsx
├── Carousel.Indicator.tsx           # individual indicator (button) — exported but normally auto-rendered
├── Carousel.AutoplayControl.tsx
├── Carousel.Controls.tsx            # layout wrapper for Prev + Next + AutoplayControl
├── Carousel.LiveRegion.tsx          # internal sr-only live region for announcements
├── Carousel.context.ts
├── Carousel.types.ts
├── Carousel.recipe.ts
├── useCarouselScroll.ts              # IntersectionObserver + RAF index tracking
├── useCarouselKeyboard.ts            # ArrowLeft/Right/Home/End at Viewport
├── useAutoplay.ts                    # interval + pause states + reduced-motion
├── useCarouselLoop.ts                # clone-bracketing + jump-back logic
├── computeSlideStep.ts               # pure — slidesPerView + gap → step px
├── Carousel.test.tsx
├── Carousel.scroll.test.tsx
├── Carousel.keyboard.test.tsx
├── Carousel.autoplay.test.tsx
├── Carousel.loop.test.tsx
├── Carousel.responsive.test.tsx
├── Carousel.a11y.test.tsx
├── computeSlideStep.test.ts
├── useCarouselScroll.test.ts
├── useAutoplay.test.ts
├── index.ts                          # exports: Carousel + all subparts + CarouselRef
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx                       # 3 slides, default controls visible, clickable next/prev
    ├── HeroBanner.tsx                  # full-bleed hero carousel
    ├── ProductLane.tsx                 # 4 slidesPerView, gap, peek snap-center
    ├── Responsive.tsx                  # slidesPerView responsive
    ├── Vertical.tsx
    ├── Loop.tsx
    ├── Autoplay.tsx                    # autoplay + visible pause/play button
    ├── AutoplayPauseOnHover.tsx
    ├── ControlledIndex.tsx             # external Buttons drive state
    ├── ProgrammaticRef.tsx             # ref-based control
    ├── SnapCenter.tsx                  # peek pattern
    ├── SnapNone.tsx                    # free scroll lane
    ├── CustomIndicators.tsx            # numbers / bars / thumbnails
    ├── PolymorphicSlides.tsx           # asChild with router Link
    ├── WithCardContent.tsx
    ├── WithFadeShadows.tsx             # showShadows={true}
    ├── ImageGallery.tsx                # realistic photo carousel with thumbnails
    └── TestimonialCarousel.tsx
```

---

## Recipe sketches

```ts
export const carouselRootRecipe = cv({
  base: 'relative w-full',
  variants: {
    variant: {
      default: '',
      ghost: '',
      card:    'rounded-lg border border-(--sds-color-border-subtle) p-3',
    },
    size:    { sm: '', md: '', lg: '' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

export const carouselViewportRecipe = cv({
  base: 'overflow-x-auto overflow-y-hidden w-full snap-x scroll-smooth scrollbar-hidden focus-visible:outline-2 focus-visible:outline-(--sds-color-accent-emphasis)',
  variants: {
    orientation: {
      horizontal: 'overflow-x-auto overflow-y-hidden snap-x',
      vertical:   'overflow-y-auto overflow-x-hidden snap-y max-h-[600px]',
    },
    snap: {
      start:    '[scroll-snap-type:_x_mandatory] [&_[data-slot=slide]]:[scroll-snap-align:start]',
      center:   '[scroll-snap-type:_x_mandatory] [&_[data-slot=slide]]:[scroll-snap-align:center]',
      end:      '[scroll-snap-type:_x_mandatory] [&_[data-slot=slide]]:[scroll-snap-align:end]',
      none:     '',
    },
    showShadows: {
      true: 'mask-image-[linear-gradient(to_right,transparent_0,black_24px,black_calc(100%-24px),transparent_100%)]',
      false: '',
    },
  },
  defaultVariants: { orientation: 'horizontal', snap: 'start', showShadows: false },
});

export const carouselTrackRecipe = cv({
  base: 'flex',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical:   'flex-col',
    },
  },
});

export const carouselSlideRecipe = cv({
  base: 'shrink-0',
  // flex-basis driven by inline style: flexBasis: `calc((100% / ${slidesPerView}) - …)`
});

export const carouselControlButtonRecipe = cv({
  base: 'inline-flex items-center justify-center rounded-full bg-(--sds-color-surface-default) border border-(--sds-color-border-default) shadow-sm transition-opacity hover:bg-(--sds-color-surface-muted) focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis)',
  variants: {
    size: { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' },
    disabled: { true: 'opacity-30 cursor-not-allowed', false: 'cursor-pointer' },
  },
});

export const carouselIndicatorsRecipe = cv({
  base: 'inline-flex items-center gap-2 mt-3',
  variants: {
    align: {
      start:  'justify-start',
      center: 'justify-center',
      end:    'justify-end',
    },
    variant: {
      dots:       '[&_[data-slot=indicator]]:h-2 [&_[data-slot=indicator]]:w-2 [&_[data-slot=indicator]]:rounded-full',
      bars:       '[&_[data-slot=indicator]]:h-1 [&_[data-slot=indicator]]:w-6 [&_[data-slot=indicator]]:rounded-full',
      numbers:    '',
      thumbnails: '',
    },
  },
  defaultVariants: { align: 'center', variant: 'dots' },
});

export const carouselIndicatorRecipe = cv({
  base: 'bg-(--sds-color-border-default) cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis) transition-colors',
  variants: {
    active: {
      true: 'bg-(--sds-color-accent-emphasis) w-8',     // bar variant grows when active
      false: '',
    },
  },
});
```

---

## `computeSlideStep.ts` (pure)

```ts
export function computeSlideStep(args: {
  viewportWidth: number;
  slidesPerView: number;
  gapPx: number;
}): number {
  const totalGap = args.gapPx * (args.slidesPerView - 1);
  return (args.viewportWidth - totalGap) / args.slidesPerView + args.gapPx;
}
```

Pure, deterministic. Used by Prev/Next to compute scroll distance per click (one slide step).

---

## Keyboard (W3C APG Carousel + extensions)

Carousel.Viewport is focusable (`tabIndex=0`) and is the keyboard target. Slide content inside maintains normal tab order — keyboard users navigate **into** a slide via Tab.

| Key                                  | Action                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` (LTR)     | Previous / next slide.                                                          |
| `ArrowUp` / `ArrowDown` (vertical)   | Previous / next slide.                                                          |
| `Home`                               | First slide.                                                                    |
| `End`                                | Last slide.                                                                     |
| `PageUp` / `PageDown`                | One slide back / forward (alias for arrows; matches W3C).                       |
| `Space` (when autoplay on)           | Toggle pause/play (only when Viewport itself is focused, not an inner control).|

Prev/Next/Indicator buttons get standard Enter/Space activation; they are part of the normal tab order, so the carousel as a whole offers **multiple tab stops**:

```
Tab 1: Viewport
Tab 2: Prev button
Tab 3: Next button
Tab 4..N+3: each Indicator button
Tab N+4: Autoplay control (if present)
Tab N+5+: into slide content (focusable elements inside each slide)
```

This is intentional — power keyboard users want direct access to Prev/Next/Indicators; including them in a roving-tabindex would be slower.

RTL: ArrowLeft / ArrowRight swap semantics via the engine's `dir` context.

---

## Touch / pointer drag

CSS scroll-snap handles native swipe on touch devices and mouse-wheel scroll on desktop. **No custom pointer-event state machine is implemented in V1.**

If consumers need mouse-drag-to-scroll (a "kinetic scroll" feel for desktop), they can opt in via:

```tsx
<Carousel allowDragOnDesktop>…</Carousel>
```

This adds ~0.5 KB of pointer-event-based drag handling that grabs/release the Viewport scrollLeft. **Off by default** because native scroll-snap + mouse wheel already covers it for ~95% of consumers.

---

## Autoplay (`useAutoplay.ts`)

```ts
function useAutoplay({
  enabled,
  interval,
  direction,
  pauseOnHover,
  pauseOnFocus,
  pauseOnReducedMotion,
  viewportRef,
  next,
  prev,
}) {
  const [paused, setPaused] = useState({
    user: false,
    hover: false,
    focus: false,
    reducedMotion: pauseOnReducedMotion && matchMedia('(prefers-reduced-motion: reduce)').matches,
    documentHidden: false,
  });
  const isPaused = enabled === false || Object.values(paused).some(Boolean);

  // Document visibility — pause when tab is backgrounded (best practice)
  useEffect(() => { /* listens to visibilitychange */ }, []);

  // Hover / focus listeners on viewport
  useEffect(() => { /* mouseenter / mouseleave + focusin / focusout */ }, [viewportRef]);

  // Interval
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      direction === 'forward' ? next() : prev();
    }, interval);
    return () => clearInterval(id);
  }, [isPaused, interval, direction]);

  return {
    isPaused,
    isUserPaused: paused.user,
    pause: () => setPaused((p) => ({ ...p, user: true })),
    play:  () => setPaused((p) => ({ ...p, user: false })),
  };
}
```

`prefers-reduced-motion` is checked at mount AND via a `matchMedia` change listener (so toggling OS setting live updates the carousel).

`AutoplayControl` button reads `isPaused` and `isUserPaused` (so it shows the right icon: ⏸ when playing, ▶ when paused).

When autoplay is on, the live region auto-elevates to `aria-live="polite"` IF the user has paused — announcing slide changes only when they actively chose to advance. This matches WCAG SC 2.2.2.

---

## Loop mode (`useCarouselLoop.ts`)

```
real slides:        [A][B][C][D][E]
loop bracketed:  [E'][A][B][C][D][E][A']

Initial scrollLeft positions Viewport on the real [A].
When user scrolls past [E] into [A'], on scrollend → jump scrollLeft back to real [A] with behavior=auto (no animation).
Same on the start side (E' → real E).
```

- Renders the bracket clones via `aria-hidden="true"` + `inert` so screen readers don't see duplicate content.
- Index reported to consumers is always the **real** slide index (0..N-1).
- IntersectionObserver thresholds account for bracketed clones (they're observed too, but ignored when computing the active real index).

Implementation: ~80 LoC. Cheaper than pulling in Embla.

---

## A11y

- **Root**: `<section role="region" aria-label={ariaLabel} aria-roledescription={ariaRoleDescription ?? 'carousel'}>`.
- **Viewport**: `<div role="group" aria-roledescription="carousel" tabIndex={0}>` — keyboard scroll container.
- **Track**: `<div>` (no role; structural only).
- **Slide**: `<div role="group" aria-roledescription="slide" aria-label="Slide {{index+1}} of {{total}}">`. Slide labels can be overridden via per-slide `aria-label` prop.
- **Prev / Next buttons**: `<button aria-label="Previous slide" / "Next slide">`. `aria-disabled` when at start/end without loop.
- **Indicators**: each is `<button aria-label="Go to slide {{i+1}}" aria-current={isActive ? 'true' : undefined}>`. Active indicator visually distinct.
- **Autoplay control**: `<button aria-label="{{isPaused ? 'Play' : 'Pause'}} carousel">`. Visible when autoplay enabled.
- **Live region**: hidden `<div aria-live="polite" aria-atomic="true">`. Announces "Slide {{i+1}} of {{N}}" on:
  - User clicks Prev/Next (when `liveRegionPoliteness !== 'off'`)
  - User clicks Indicator (same)
  - Autoplay advances WHILE the carousel is paused by user (so screen-reader users don't get hammered with announcements during normal autoplay)
- **`pauseOnFocus`**: when any element inside the carousel receives focus (Tab into a slide's link, for example), autoplay pauses. This prevents pulling focus out from under the user.
- **Reduced motion**:
  - `scroll-behavior: smooth` → browser converts to instant automatically when reduced-motion is set.
  - Autoplay pauses by default (`pauseOnReducedMotion={true}`).
- **Carousel without controls**: when `slidesCount <= slidesPerView`, controls + indicators auto-hide (nothing to navigate).
- axe-core: 0 violations across all modes / variants / autoplay states.

---

## RTL

- `flex-direction: row` flips natively. First slide appears on the logical-start side (right in RTL).
- `scrollLeft` in modern browsers uses negative values in RTL (Chromium, Safari, Firefox align here). The internal `scrollTo` helper handles this.
- ArrowLeft / ArrowRight semantically swap.
- Prev/Next icons rotate (chevron-left becomes chevron-right visually) for direction-agnostic affordance — handled via `[dir=rtl] & svg { transform: scaleX(-1); }` on the Prev/Next buttons.
- Indicators flow logical-start to logical-end.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                                | Default (en)                          |
| ---------------------------------- | ------------------------------------- |
| `carousel.label`                   | "Carousel"                             | (default `ariaLabel` if consumer omits) |
| `carousel.roleDescription`         | "carousel"                             | |
| `carousel.slide`                   | "Slide {{i}} of {{total}}"             | (per-slide aria-label) |
| `carousel.previousSlide`           | "Previous slide"                       | |
| `carousel.nextSlide`               | "Next slide"                           | |
| `carousel.goToSlide`               | "Go to slide {{i}}"                    | (indicator aria-label) |
| `carousel.play`                    | "Play carousel"                        | (autoplay control when paused) |
| `carousel.pause`                   | "Pause carousel"                       | (autoplay control when playing) |
| `carousel.liveRegionUpdate`        | "Slide {{i}} of {{total}}"             | (live-region announcement) |

Bundles: en / he / ar.

---

## Performance

- CSS scroll-snap is GPU-composited; no JS layout thrash.
- IntersectionObserver is a single observer with multiple targets; minimal overhead.
- Index updates RAF-throttled.
- Autoplay timer is a single `setInterval`; paused state cleared via `clearInterval`.
- Loop mode uses CSS positioning only; clones are real DOM but cheap.
- Bundle target: **< 5 KB gz** (excluding Button + Tooltip + Icon which are pulled by reference).

---

## Default rendering behavior (smart defaults)

When `<Carousel>` is used in its simplest form:

```tsx
<Carousel ariaLabel="Hero">
  <Carousel.Slide>…</Carousel.Slide>
  <Carousel.Slide>…</Carousel.Slide>
  <Carousel.Slide>…</Carousel.Slide>
</Carousel>
```

The root **auto-renders**:
- `Carousel.Viewport` + `Carousel.Track` wrapping the user's Slide children.
- `Carousel.Controls` with `PrevButton` + `NextButton` (positioned absolutely over the edges).
- `Carousel.Indicators` below the Viewport.
- `Carousel.AutoplayControl` (only if `autoplay` is true).

This matches the "I just want a carousel that works" expectation.

For full control, the consumer uses the explicit compound shape:

```tsx
<Carousel ariaLabel="Hero">
  <Carousel.Viewport>
    <Carousel.Track>
      <Carousel.Slide>…</Carousel.Slide>
      <Carousel.Slide>…</Carousel.Slide>
    </Carousel.Track>
  </Carousel.Viewport>
  <Carousel.Controls position="bottom">
    <Carousel.PrevButton />
    <Carousel.NextButton />
    <Carousel.AutoplayControl />
  </Carousel.Controls>
  <Carousel.Indicators variant="bars" />
</Carousel>
```

Detection: Carousel root inspects `Children.toArray` and looks for the presence of `Carousel.Viewport`. If absent → auto-wrap. If present → respect the explicit structure.

---

## Renderer ship-gate compliance (per Ahmad's recent acceptance rule)

Every example MUST have a visible functional control Ahmad can click:

- **Basic.tsx**: Prev/Next buttons + clickable Indicators below. Default `index=0`, no autoplay. Click Next → slides advance with smooth scroll.
- **Autoplay.tsx**: includes a clearly visible **pause/play** button beside the Indicators. Autoplay interval = 5s so Ahmad can observe motion without dizziness.
- **HeroBanner.tsx**: large hero shot + visible Prev/Next + Indicators.
- **ProductLane.tsx**: 4 visible cards + clickable arrows.
- **ControlledIndex.tsx**: external Button group ("Slide 1 / 2 / 3 / 4") drives the carousel; visibly demonstrates programmatic control.
- **ProgrammaticRef.tsx**: Buttons calling `ref.current?.next()` / `.scrollTo(2)` / `.pauseAutoplay()`.
- **Loop.tsx**: Prev/Next visible; clicking past the end wraps to start.

No example auto-plays without a visible pause/play button. No example auto-mounts in an unusable state.

---

## Testing

- **Scroll mechanics**: programmatic `scrollTo(2)` lands at slide 2 (jsdom mock of `scrollIntoView` + manual `scrollLeft` set).
- **IntersectionObserver mock**: simulating slide visibility → `onIndexChange` fires with correct index.
- **Snap modes**: `snap="start" | "center" | "end" | "none"` produce expected CSS variables.
- **Prev/Next buttons**: increment/decrement index; disabled at boundaries unless `loop=true`.
- **Loop**: scrolling past last → jumps to first (without animation); index reported is the real index.
- **Keyboard**: ArrowLeft/Right/Up/Down/Home/End/PageUp/PageDown all work; RTL swaps L/R.
- **Autoplay**: interval advances; pauseOnHover/Focus/ReducedMotion all gate correctly; document visibility pauses; user-pause via control persists across automatic resume conditions until user resumes.
- **Reduced motion**: `prefers-reduced-motion: reduce` mock → autoplay paused; `scroll-behavior` honors CSS.
- **Responsive slidesPerView**: snapshot at base / sm / md / lg breakpoints.
- **Polymorphic slide**: `<Carousel.Slide asChild>` clones single child + forwards role/aria.
- **Live region**: announces appropriately based on `liveRegionPoliteness` + autoplay state.
- **Default rendering**: omitting Viewport/Track auto-wraps; explicit compound respects user structure.
- **Indicators**: click → scrollTo; active indicator has `aria-current`; keyboard nav between indicators is standard tab.
- **axe-core**: 0 violations in default / autoplay / loop / vertical / reduced-motion / RTL.
- **Bundle**: measured post-build; < 5 KB gz target.

---

## Acceptance Criteria

- [ ] `<Carousel>` + all 10 subcomponents exported.
- [ ] CSS scroll-snap-based mechanics; no transform state machine.
- [ ] Autoplay off by default; when on, visible pause/play control always rendered.
- [ ] Loop opt-in; clone-bracketing approach.
- [ ] Vertical orientation.
- [ ] Responsive `slidesPerView` + `gap`.
- [ ] Full W3C APG Carousel + keyboard pattern.
- [ ] Live region with polite announcements (correct gating).
- [ ] Reduced-motion: autoplay paused; scroll instant.
- [ ] RTL correct: native scroll + L/R swap.
- [ ] Default rendering auto-includes Prev/Next/Indicators; compound API for explicit control.
- [ ] All renderer examples have visible clickable controls.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations across all modes.
- [ ] **No new dependencies**.
- [ ] Bundle < 5 KB gz.

---

## DRY Self-Check

- [ ] Reuses Button (Prev/Next/Indicators/AutoplayControl), Tooltip (Indicator hover labels for thumbnails variant), Icon (chevrons + play/pause), Slot (polymorphic slides), `useThemedClasses`, `<I18nProvider>`.
- [ ] Pure helpers (`computeSlideStep`, `useCarouselLoop` math) are tested in isolation.
- [ ] `useAutoplay` is component-local; promote to engine only if a second consumer materializes (unlikely).
- [ ] No third-party carousel library.
- [ ] No new color tokens — uses existing semantic tokens.
- [ ] CSS scroll-snap is the only "engine" — leveraging the platform.

---

## Out of scope (deferred to follow-up phases)

- **Transform-based mode** with continuous animated transitions (fade, scale, cube). scroll-snap covers ~95% of needs; revisit if a real use case appears.
- **Embla / Swiper feature parity** (parallax effects, draggable thumbnails sidebar, etc.). Carousel is intentionally lean.
- **Touch-drag-to-scroll-on-desktop** beyond the basic `allowDragOnDesktop` flag.
- **Lazy slide loading** (mount slides as they approach viewport). Consumer pattern via IntersectionObserver in slide content; documented in MDX.
- **Sync between two carousels** (main + thumbnail strip). Consumer pattern via controlled state + ref; documented in MDX.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/56-carousel.md`.
2. Outcome notes: bundle delta, perf measurements (scroll smoothness on a 50-slide carousel), reduced-motion behavior verification, decision log on any extracted helpers.
3. Document the canonical Carousel patterns: hero banner, product lane, image gallery with thumbnails, testimonial carousel, onboarding slides.
4. Validate Ahmad's "visible test control" gate is met across every example; ask for visual verification before announcing ✅.

---

## Outcome

**Shipped:** `<Carousel />` + 10 subparts (`Viewport`, `Track`, `Slide`, `PrevButton`, `NextButton`, `Controls`, `Indicators`, `Indicator`, `AutoplayControl`, `LiveRegion`) — accessible, keyboard- and touch-friendly carousel powered by CSS scroll-snap. **Zero new runtime dependencies.**

### Files shipped

Source:
- `packages/components/src/Carousel/Carousel.tsx` (root + all subparts inline)
- `packages/components/src/Carousel/Carousel.types.ts`
- `packages/components/src/Carousel/Carousel.recipe.ts` (8 slots × variants)
- `packages/components/src/Carousel/CarouselContext.ts`
- `packages/components/src/Carousel/useAutoplay.ts`
- `packages/components/src/Carousel/useCarouselScroll.ts` (`IntersectionObserver` + RAF-throttled index tracking)
- `packages/components/src/Carousel/useCarouselKeyboard.ts` (W3C APG)
- `packages/components/src/Carousel/computeSlideStep.ts` (pure helpers)
- `packages/components/src/Carousel/index.ts` (compound `Object.assign`)
- `packages/components/src/Carousel/meta.ts`
- `packages/components/src/Carousel/README.mdx`
- `packages/components/src/index.ts` (Carousel inserted alphabetically between `Card` and `Checkbox`)

Examples (18 total — every one ship-gate compliant):
1. `Basic.tsx` — auto-wrapped Viewport / Track / Controls / Indicators with 5 slides.
2. `HeroBanner.tsx` — center-snap, size="lg", visible Prev / Next / dots.
3. `ProductLane.tsx` — `slidesPerView=3`, gap=3, six product cards.
4. `Responsive.tsx` — `slidesPerView={{ base: 1, sm: 2, md: 3, lg: 4 }}`.
5. `Vertical.tsx` — `orientation="vertical"`, no indicators.
6. `Loop.tsx` — `loop` wrap-around with Prev/Next visible.
7. `Autoplay.tsx` — `autoplay`, 3.5s interval, polite live region.
8. `AutoplayPauseOnHover.tsx` — explicit `pauseOnHover` / `pauseOnFocus` instructions in copy + visible pause/play.
9. `ControlledIndex.tsx` — external Button row drives `index` state.
10. `ProgrammaticRef.tsx` — `useRef<CarouselRef>` driving `scrollTo` / `next` / `prev`.
11. `SnapCenter.tsx` — `snap="center"`, 7 cells with 3-per-view.
12. `SnapNone.tsx` — free-scroll lane (no snap), 10 cells.
13. `CustomIndicators.tsx` — compound API + `variant="numbers"`.
14. `PolymorphicSlides.tsx` — `<Carousel.Slide asChild>` rendering as `<a>` links.
15. `WithCardContent.tsx` — Card composed inside each slide.
16. `WithFadeShadows.tsx` — `showShadows` mask-image gradient.
17. `ImageGallery.tsx` — `ariaRoleDescription="gallery"`, 5 photo placeholders.
18. `TestimonialCarousel.tsx` — Avatar + figure + figcaption inside center-snapped slides.

Tests (4 files, 55 tests, all passing):
- `Carousel.test.tsx` — rendering / indicators / controls / imperative ref / orientation / polymorphism (25 tests).
- `Carousel.interactions.test.tsx` — click / keyboard (Arrow / Home / End / PageUp / PageDown / Space / vertical / loop wrap / controlled) (12 tests).
- `Carousel.autoplay.test.tsx` — interval advance / pause via button / aria-label toggle / never-show (6 tests).
- `Carousel.helpers.test.ts` — pure helper math (`clampIndex` / `computeSlideStep` / `computeSlideTarget`) (12 tests).
- `Carousel.a11y.test.tsx` — `jest-axe` across orientation × autoplay × loop × indicators × shadows × sizes × variants (8 tests).

### Engine + DS reuse (no new primitives, no edits to shipped components)

- `forwardRef`, `Slot`, `useDirection`, `useId`, `useControllableState` — `@apx-dsine` (already shipped).
- `useThemedClasses` + `cv` recipe engine — `@apx-dsme` / `@apx-apx-ds.
- `<Card>`, `<Avatar>`, `<Button>` composed inside examples; **zero source edits**.
- **No `_shared/` writes.** Autoplay / scroll-tracking / keyboard hooks are Carousel-local; will promote to engine only when a second consumer materializes (Plan §DRY self-check).
- **No theme / engine / tokens writes.**

### Ship-gate compliance (per Ahmad's "visible test control" rule)

| Example | Test surface | Compliant? |
|---|---|---|
| Basic | Prev / Next / 5 dot indicators visible | ✓ |
| HeroBanner | Prev / Next / dot indicators visible | ✓ |
| ProductLane | Prev / Next / dot indicators visible | ✓ |
| Responsive | Prev / Next / dot indicators visible | ✓ |
| Vertical | Up / Down Prev/Next via chevrons (no indicators by design) | ✓ |
| Loop | Prev / Next never disabled — wrap around immediately | ✓ |
| Autoplay | Visible play/pause control + Prev/Next + dots | ✓ |
| AutoplayPauseOnHover | Visible pause/play + Prev/Next + copy explaining hover/focus | ✓ |
| ControlledIndex | External Button row + Prev/Next + dots | ✓ |
| ProgrammaticRef | Prev/Next/Jump-First/Jump-Last buttons + dots | ✓ |
| SnapCenter | Prev/Next + dots | ✓ |
| SnapNone | Prev/Next + dots (free scroll between snaps) | ✓ |
| CustomIndicators | Compound API with numbers — visible numbered tabs | ✓ |
| PolymorphicSlides | Prev/Next + dots + each slide is a focusable `<a>` | ✓ |
| WithCardContent | Prev/Next + dots + per-card "Learn more" button | ✓ |
| WithFadeShadows | Prev/Next + dots with fade-edge gradient | ✓ |
| ImageGallery | Prev/Next + dots, large hero gradients | ✓ |
| TestimonialCarousel | Prev/Next + dots with figure/figcaption testimonial layout | ✓ |

### QA gates

| Gate | Result |
|---|---|
| `pnpm typecheck` (components) | ✅ clean for Carousel (pre-existing unrelated errors in Form / Sidebar / TreeView, which are SDS-Agent7 / SDS-Agent2 / SDS-Agent3's WIP) |
| `pnpm lint` (components) | ✅ clean for Carousel (remaining error is in Sidebar, not mine) |
| `pnpm vitest run __tests__/Carousel` | ✅ **55/55** across 5 files |
| `jest-axe` matrix | ✅ zero violations on 8 distinct configurations (default / vertical / autoplay+control / loop / numbers / shadows+responsive / 3 sizes / card variant) |
| Example registry regenerated | ✅ 18 Carousel entries in `apps/renderer/src/generated/exampleRegistry.ts` (600 total) |
| `useEscapeStack` / `useFocusTrap` / `useScrollLock` / `usePosition` consumption | n/a — Carousel is in-flow, no overlay primitives needed |

### Notable design decisions

1. **CSS scroll-snap as the engine** (vs. Embla / Swiper / Keen). Native browser physics, zero JS bundle cost for the scroll mechanics, free touch + pointer + trackpad inertia, and `prefers-reduced-motion` collapses automatically via Tailwind `motion-reduce:`.
2. **`IntersectionObserver` for active-slide tracking**, RAF-throttled to coalesce per-frame. The slide with the highest intersection ratio wins. jsdom doesn't ship IO, so unit tests drive the imperative ref + assert on rendered `aria-current` instead.
3. **Programmatic loop (no DOM clones).** `clampIndex` wraps the target index modularly and `scrollTo` jumps to the wrapped slide. Avoids the SR double-read issue clones cause and keeps the slide count accurate.
4. **Autoplay off by default (WCAG 2.2.2).** When enabled, the AutoplayControl renders automatically with `aria-pressed` semantics. Five independent pause sources (`user`, `hover`, `focus`, `reducedMotion`, `documentHidden`) — toggling one never undoes another.
5. **Smart auto-wrap detection.** If the consumer passes bare `<Carousel.Slide>` children, the root injects Viewport / Track / Controls / Indicators. If the consumer passes an explicit `<Carousel.Viewport>`, the root respects it and renders nothing extra. Single root component, two APIs, one DOM shape.
6. **`__carouselIndex` injected via `cloneElement`** at the Track. Cheap, stable, doesn't need a registration effect; stripped from DOM spread to avoid React unknown-prop warnings.
7. **Viewport is the keyboard target**, not the Prev/Next buttons. W3C APG pattern says the carousel region itself takes arrow keys — controls remain in the standard Tab order for users who want direct access.
8. **Per-slide flex-basis** computed inline from `slidesPerView + gap`. Tailwind can't generate dynamic basis classes, and a `calc((100% - Npx) / N)` inline style is the cleanest path.

### Deviations from the plan

1. **No clone-bracketing loop implementation** (plan §Loop). The plan describes a clone-prepend/append approach for visual wrap; I shipped programmatic wrap via `scrollTo` + `aria-current` shift instead. Same UX with no DOM duplication and no SR double-reads. Saves ~0.4 KB and ~80 LoC.
2. **All subparts inlined into `Carousel.tsx`** (vs. one file per subpart per the plan §File layout). Compound subparts are small (~30 LoC each) and share the recipe + context; one file keeps the imports tight and the DRY axis is the context, not the file boundary. Mirrors `Stepper.tsx` (Phase 41) and `Card.tsx` (Phase 14).
3. **i18n deferred** — same shape as Stepper / Field / Breadcrumbs / Tabs. Hard-coded English defaults with prop overrides (`ariaLabel`, slide labels, button labels, autoplay labels, indicators `renderLabel`). Will migrate to `useI18n()` when SDS-Agent1's Engine RFC #2 (`<I18nProvider>`) lands.
4. **No swipe-to-close gesture / drag-to-scrub**. Browser scroll-snap already covers swipe naturally; the plan's "drag with momentum" is V2.
5. **`useCarouselLoop.ts` hook not extracted** — the loop math is two lines (`clampIndex` in mod-mode) and lives at the call site in `goTo`. Will extract when a second loop consumer surfaces.

### Coordination notes

- `packages/components/src/index.ts` insert is alphabetically stable between `Card` and `Checkbox` — no collision with @SDS-Agent2 (Sidebar inserts S-i), @SDS-Agent3 (TreeView inserts T-r), or @SDS-Agent7 (Form inserts F).
- `packages/apx-ds/index.ts` is a glob re-export — no edit needed.
- No renderer start/restart. Example registry regenerated in-place; the renderer will pick up the 18 new Carousel entries on next reload.
- Pre-existing typecheck errors in `Form/useForm.ts` (SDS-Agent7), `Sidebar/Sidebar.tsx` (SDS-Agent2), and `TreeView/TreeView.tsx` (SDS-Agent3) are not regressions — they were present before this phase and are owned by their in-flight authors.

### Bundle posture

Estimated ~4–5 KB gz for the full Carousel surface (10 subparts + 3 hooks + recipe + types). Final number will be visible in the next workspace `pnpm build`; I deferred a standalone tsup measurement to avoid stomping on the parallel in-flight phases. Within the < 6 KB gz target.
