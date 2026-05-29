export interface ComputeSlideStepArgs {
  viewportSize: number;
  slidesPerView: number;
  gapPx: number;
}

/**
 * Pure helper — returns the px distance the viewport must scroll to advance by one slide step.
 * Same formula works for horizontal (viewportSize = clientWidth) and vertical (clientHeight).
 *
 * Derivation: each slide's basis is `(viewportSize - totalGap) / slidesPerView`. Advancing one
 * slide means scrolling by one slide width plus one gap (so the next slide lines up under the
 * leading edge).
 */
export function computeSlideStep(args: ComputeSlideStepArgs): number {
  const { viewportSize, slidesPerView, gapPx } = args;
  if (slidesPerView <= 0) return 0;
  const totalGap = gapPx * (slidesPerView - 1);
  const slideSize = (viewportSize - totalGap) / slidesPerView;
  return slideSize + gapPx;
}

export interface ComputeSlideTargetArgs {
  index: number;
  slideStepPx: number;
}

/**
 * Pure helper — returns the px scroll offset for a given 0-based slide index. Multiplies
 * `slideStepPx` by `index`. Loop-aware callers should map their logical index to the offset
 * index first.
 */
export function computeSlideTarget(args: ComputeSlideTargetArgs): number {
  return Math.max(0, args.slideStepPx * args.index);
}

export interface ClampIndexArgs {
  index: number;
  count: number;
  loop: boolean;
}

/**
 * Pure helper — clamps or wraps a target index based on `loop` mode. In loop mode the index
 * wraps around (e.g. -1 → count - 1, count → 0). In non-loop mode it clamps to [0, count - 1].
 */
export function clampIndex(args: ClampIndexArgs): number {
  const { index, count, loop } = args;
  if (count <= 0) return 0;
  if (loop) {
    return ((index % count) + count) % count;
  }
  return Math.max(0, Math.min(count - 1, index));
}
