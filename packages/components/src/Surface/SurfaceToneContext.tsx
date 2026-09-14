import { createContext, useContext } from 'react';

import type { SurfaceTone } from './Surface.types';

/**
 * The tone of the nearest enclosing `Surface`.
 *
 * ## Why a context and not a prop
 *
 * Some components genuinely need to know what ground they are sitting on. `SectionHeading`'s
 * badge eyebrow is the first: `color="primary"` is right on a page, and on a `tone="primary"`
 * band it paints the brand on itself and disappears — on exactly the band the tone exists to make
 * easy.
 *
 * The obvious fix is a prop, and it is the wrong one. That prop is `onDark` under a new name, and
 * we have already watched it fail: three templates invented it independently, each faked it
 * differently, and the one that shipped a contrast bug did so because someone had to remember to
 * pass it and the value they passed was `opacity-80`. A prop that lets a component *ask* what it
 * is sitting on is a prop that gets forgotten on the one band where it mattered.
 *
 * So the surface tells its descendants instead. Nothing at the call site changes, nothing can be
 * forgotten, and a component that does not care never reads it.
 *
 * This is deliberately **not** a general styling channel. Components should get their colours
 * from the palette roles the tone already remaps; this is only for the small number of decisions
 * that cannot be expressed that way, because they choose *between* roles rather than reading one.
 */
export const SurfaceToneContext = createContext<SurfaceTone>('default');

/** The tone of the nearest enclosing `Surface`, or `'default'` outside of one. */
export function useSurfaceTone(): SurfaceTone {
  return useContext(SurfaceToneContext);
}

/**
 * True when the surface has established its own ground — so the brand roles no longer contrast
 * with it and `neutral`, which every tone map remaps to track the ground, is the role to reach
 * for instead.
 */
export function toneOwnsItsGround(tone: SurfaceTone): boolean {
  return tone !== 'default';
}
