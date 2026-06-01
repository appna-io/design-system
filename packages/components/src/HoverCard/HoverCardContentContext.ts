import { createContext } from 'react';
import type { RefCallback } from 'react';

import type { HoverCardPlacement, HoverCardSize } from './HoverCard.types';

/**
 * Private context published by `<HoverCard.Content>` to its `<HoverCard.Arrow>` descendant. Same
 * shape as Popover's content-context — keeps positioning data scoped to the Content tree without
 * polluting the public root context.
 */
export interface HoverCardContentContextValue {
  arrowRef: RefCallback<HTMLElement | null>;
  arrowData: { x?: number; y?: number; centerOffset?: number } | undefined;
  placement: HoverCardPlacement;
  size: HoverCardSize;
}

export const HoverCardContentContext =
  createContext<HoverCardContentContextValue | null>(null);