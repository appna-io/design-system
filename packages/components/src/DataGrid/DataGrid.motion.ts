import {
  motionPresets,
  transitionTokens,
  type SimpleVariant,
} from '@apx-ui/engine';

/**
 * Motion presets used by DataGrid subparts.
 *
 * PR 3 ships the minimal set — most chrome (row hover, focus ring) is driven by CSS
 * `transition-colors` so we avoid pulling Motion into the critical render path. PR 4
 * uses `selectionBarSlideIn` for the sticky `<DataGrid.SelectionBar>`; PR 5 uses
 * `expandRow` for `<DataGrid.ExpansionRow>`.
 */
export const dataGridMotion = {
  /**
   * Sticky selection-bar slide-in. Bottom-anchored, fast (250ms) emphasized easing to
   * read as "purposeful, snappy" rather than "decorative". Reused by PR 4.
   */
  selectionBarSlideIn: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
  } satisfies SimpleVariant,

  /**
   * Expand row reveal. CSS grid-rows trick (0fr → 1fr) at the DOM level avoids
   * measuring; this preset exists for the optional Motion overlay (consumer can opt
   * in via PR 5's `animateExpand` prop).
   */
  expandRow: motionPresets.fadeIn,

  /**
   * Row enter/exit when data changes — off by default for perf on large tables. PR 5
   * opt-in via `animateRows={true}`.
   */
  rowFade: motionPresets.fadeIn,
} as const;

export const dataGridTransition = {
  selectionBar: {
    duration: transitionTokens.duration.slow,
    ease: transitionTokens.ease.emphasized,
  },
  expandRow: {
    duration: transitionTokens.duration.fast,
    ease: transitionTokens.ease.standard,
  },
};