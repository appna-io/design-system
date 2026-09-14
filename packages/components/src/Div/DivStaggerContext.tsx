'use client';

import { createContext, useContext } from 'react';

/**
 * Signals to a descendant `<Div animation="…">` that an ancestor `<Div stagger={…}>` is driving
 * the animation, so the descendant must render as a *variant participant* rather than as a
 * self-contained animation.
 *
 * ## Why a context is unavoidable here
 *
 * Motion cascades an animation to descendants by propagating a **variant label** (`"hidden"` →
 * `"visible"`) down through `MotionContext`. A child only picks that label up if it declares
 * `variants` and does **not** declare `initial` / `animate` of its own — an explicit `animate`
 * prop wins over the inherited label and severs the child from the parent's timeline.
 *
 * `<Div>` normally *does* set `initial` / `animate` directly from its preset. That is correct in
 * isolation and fatal inside a stagger: every child would start immediately, in parallel, and
 * `staggerChildren` would appear to do nothing at all. The child therefore has to know whether an
 * orchestrating ancestor exists, and React context is the only channel that carries that across
 * arbitrary intervening markup.
 *
 * Because `MotionContext` is React context rather than DOM state, the cascade survives plain
 * (non-motion) elements in between — so a stagger parent still reaches its `<Div>` grandchildren
 * through ordinary layout wrappers, which is what makes the API usable in real page sections.
 */
export interface DivStaggerContextValue {
  /** True when an ancestor `<Div>` is orchestrating children through variants. */
  orchestrating: boolean;
}

const DivStaggerContext = createContext<DivStaggerContextValue | null>(null);

export const DivStaggerProvider = DivStaggerContext.Provider;

/**
 * Returns `true` when an ancestor `<Div stagger>` is driving this subtree's animation.
 *
 * A stagger parent renders its own children inside the provider, so the *parent itself* reads
 * whatever context sits above it — which is what lets stagger groups nest: an inner group both
 * inherits its label from the outer group and orchestrates its own children with its own delay.
 */
export function useDivOrchestrated(): boolean {
  return useContext(DivStaggerContext)?.orchestrating ?? false;
}

/** Variant labels shared by the orchestrating parent and every participating descendant. */
export const DIV_VARIANT_LABELS = {
  hidden: 'apx-hidden',
  visible: 'apx-visible',
  exit: 'apx-exit',
} as const;
