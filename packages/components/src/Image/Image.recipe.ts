import { cv } from '@apx-ui/engine';

/**
 * Single-slot recipe for `<Image />`. Every axis maps 1:1 onto token-backed utilities so a
 * theme swap re-skins imagery (radius scale, shadow scale) with zero component changes.
 *
 * `aspectRatio` is deliberately NOT a recipe axis: it's a continuous value ('4/3', '16/9',
 * '1/1', …) that comes straight from content, so the component sets it via the style engine
 * instead of enumerating a class per ratio (which the JIT scanner could never see).
 */
export const imageRecipe = cv({
  base: 'block max-w-full object-center select-none',
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
});

/**
 * The frame that wraps the image when a hover treatment is active.
 *
 * A zoom **has** to happen inside a fixed, `overflow-hidden` box. Scaling the `<img>` on its own
 * grows the element, which pushes its neighbours around — in a product grid that means every card
 * to the right of the cursor shifts, on every hover. The frame holds the layout size and the
 * image scales inside it, so nothing outside the frame moves and there is no reflow at all.
 *
 * The frame therefore owns the box properties (`radius`, `shadow`, `aspectRatio`, `fullWidth`) and
 * the image inside becomes a plain fill. `overflow-hidden` on the frame is also what clips the
 * scaled image back to the rounded corners — without it a zoom bleeds square corners over a
 * rounded frame.
 */
export const imageFrameRecipe = cv({
  base: 'group/image relative block overflow-hidden isolate',
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
    /**
     * `lift` moves the whole frame; `zoom` moves only the image inside it (see `imageMediaRecipe`).
     *
     * The hover elevation is `shadow-ambient`, not `shadow-lg`. The plain scale is black-alpha, so
     * a lift on a dark band casts a dark shadow onto a dark ground and is simply invisible;
     * `ambient` tints from `foreground-default`, which follows the ground on its own. Not `glow`
     * — that tints from `primary-main` and is for a deliberate accent lift, not for every image
     * in a grid.
     *
     * The touch guard is no longer written here. It used to be a hand-rolled
     * `[@media(hover:hover)_and_(pointer:fine)]:` prefix, because without it a tapped product card
     * stays lifted and zoomed for the rest of the session — `:hover` latches on touch and there is
     * no pointer-leave event to end it. That is now handled for every component at once by
     * `future.hoverOnlyWhenSupported` in the consuming app's Tailwind config, so a bare `hover:`
     * is already guarded.
     *
     * The `(pointer: fine)` half was dropped deliberately rather than kept alongside it: a stylus,
     * and a desktop browser in touch-emulation, both report a coarse pointer while still having
     * real hover, so requiring a fine pointer withholds the affordance from people who have it.
     *
     * Motion is gated with `motion-safe:` (apply when motion is welcome) rather than a
     * `motion-reduce:` rule that undoes it. An undo rule has the SAME specificity as the rule it
     * is trying to beat, so which one wins comes down to Tailwind's variant ordering in the
     * generated stylesheet — and it loses. That was a real bug here: a reduced-motion user still
     * got the full 1.04 zoom, and nothing in jsdom could see it because both classes were present
     * on the element exactly as intended. `motion-safe:` never emits the rule at all, so there is
     * no race to lose.
     *
     * What survives reduced motion is deliberate: the `lift`'s elevation change and the `hoverSrc`
     * swap still happen, because they carry information. They simply arrive instantly.
     */
    hoverEffect: {
      none: '',
      zoom: '',
      lift: [
        'motion-safe:transition-[transform,box-shadow] duration-fast ease-standard',
        // The elevation change is NOT gated on motion-safe: a reduced-motion user still gets the
        // hover feedback, it just arrives instantly instead of easing in.
        'hover:shadow-ambient',
        'motion-safe:hover:-translate-y-1',
        'motion-safe:will-change-transform',
      ].join(' '),
    },
  },
  defaultVariants: {
    radius: 'none',
    shadow: 'none',
    fullWidth: 'true',
    hoverEffect: 'none',
  },
});

/**
 * The image itself, once it sits inside a frame. It fills the frame and carries the zoom.
 *
 * `scale-[1.04]` is the specified value and the number matters: 1.1 reads as a stock-photo
 * carousel, while anything under ~1.02 is invisible. 1.04 is the step that registers as the image
 * responding without announcing itself.
 */
export const imageMediaRecipe = cv({
  base: 'block h-full w-full select-none',
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
    },
    hoverEffect: {
      none: '',
      lift: '',
      zoom: [
        'motion-safe:transition-transform duration-fast ease-standard',
        'motion-safe:group-hover/image:scale-[1.04]',
        'motion-safe:will-change-transform',
      ].join(' '),
    },
  },
  defaultVariants: { fit: 'cover', hoverEffect: 'none' },
});

/**
 * The `hoverSrc` overlay — a second image stacked on the first, cross-fading in on hover.
 *
 * Cross-fade rather than swapping `src`: changing the attribute shows the frame's background for
 * however long the second image takes to decode, which reads as a flicker. Two stacked elements
 * fade between two already-decoded frames.
 */
export const imageHoverSrcRecipe = cv({
  base: [
    'absolute inset-0 block h-full w-full select-none',
    // The swap itself still happens under reduced motion — it's information, not decoration — but
    // it cuts rather than fades.
    'opacity-0 motion-safe:transition-opacity duration-fast ease-standard',
    'group-hover/image:opacity-100',
  ].join(' '),
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
    },
  },
  defaultVariants: { fit: 'cover' },
});
