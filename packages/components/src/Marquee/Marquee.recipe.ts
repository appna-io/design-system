import { cv } from '@apx-ui/engine';

/**
 * Two slots — the clipping container and the moving track.
 *
 * The seamless loop is pure CSS: the track holds the children **twice** and translates by
 * exactly `-50%` of its own size, so the moment the first copy has fully exited, the second copy
 * sits precisely where the first started and the animation restarts on an identical frame. No JS
 * frame loop, no `requestAnimationFrame`, nothing to schedule — which is why a marquee can sit in
 * a hero without costing anything on the main thread.
 *
 * `-50%` (not a pixel value) is what makes it content-agnostic: the offset is resolved against
 * the track's own width, so adding a logo re-times the loop automatically.
 */
export const marqueeRootRecipe = cv({
  base: 'relative overflow-hidden',
  variants: {
    /**
     * The reduced-motion presentation. The track stops being an animation and becomes a plain
     * scroll container — the user can still reach every item, by drag / wheel / keyboard, which a
     * *paused* animation would not allow. This is the whole reason the reduced-motion branch
     * can't just be `animation: none`.
     */
    reduced: {
      true: 'overflow-x-auto overscroll-x-contain',
      false: '',
    },
    axis: {
      horizontal: '',
      vertical: '',
    },
  },
  compoundVariants: [
    { reduced: 'true', axis: 'vertical', class: 'overflow-x-hidden overflow-y-auto overscroll-y-contain' },
  ],
  defaultVariants: { reduced: 'false', axis: 'horizontal' },
});

export const marqueeTrackRecipe = cv({
  base: 'flex w-max shrink-0 items-center',
  variants: {
    axis: {
      horizontal: 'flex-row',
      vertical: 'h-max w-full flex-col',
    },
    /**
     * `animation-direction: reverse` rather than a mirrored keyframe: one keyframe pair covers
     * all four directions, and reversing keeps the `-50%` seam identical, so `'right'` loops as
     * cleanly as `'left'` with no second set of classes to keep in sync.
     */
    reverse: {
      true: '[animation-direction:reverse]',
      false: '',
    },
    /**
     * Paused via the group on the root, so the pointer target is the whole band and not just the
     * items — a cursor between two logos still pauses, which is what a user expects when they stop
     * to read one.
     *
     * Opt-in, because it is a *design* decision: a hover that pauses a purely decorative logo band
     * is an affordance that leads nowhere.
     */
    pauseOnHover: {
      true: 'group-hover/marquee:[animation-play-state:paused]',
      false: '',
    },
    /**
     * `running` also carries the **focus** pause, and that one is deliberately NOT tied to
     * `pauseOnHover`.
     *
     * Pausing for a pointer is a design choice; pausing for a keyboard is not. Tabbing into a link
     * inside a moving track leaves that link travelling out from under the focus ring — so the one
     * user who *cannot* chase it with a pointer is the one the track would keep moving for. Gating
     * that behind an opt-in means the accessible behaviour is only present when someone happened
     * to want a hover affordance too, which is unrelated.
     *
     * It costs nothing on a band with nothing focusable in it: `focus-within` simply never
     * matches.
     */
    running: {
      true: 'group-focus-within/marquee:[animation-play-state:paused]',
      false: '',
    },
    gap: {
      '0': 'gap-0',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '6': 'gap-6',
      '8': 'gap-8',
      '12': 'gap-12',
      '16': 'gap-16',
    },
  },
  compoundVariants: [
    { axis: 'horizontal', running: 'true', class: 'animate-marquee-x' },
    { axis: 'vertical', running: 'true', class: 'animate-marquee-y' },
  ],
  defaultVariants: {
    axis: 'horizontal',
    reverse: 'false',
    pauseOnHover: 'false',
    running: 'true',
    gap: '8',
  },
});

/**
 * The per-copy group. Both the visible copy and the `aria-hidden` clone use it, so the gap
 * rhythm continues *across* the seam — without this the join between the two copies would show
 * as a double-width gap once per cycle.
 */
export const marqueeGroupRecipe = cv({
  base: 'flex shrink-0 items-center',
  variants: {
    axis: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    gap: {
      '0': 'gap-0',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '6': 'gap-6',
      '8': 'gap-8',
      '12': 'gap-12',
      '16': 'gap-16',
    },
  },
  defaultVariants: { axis: 'horizontal', gap: '8' },
});
