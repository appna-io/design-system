import { createContext } from 'react';
import type { RefCallback } from 'react';

import type { PopoverPlacement, PopoverSize } from './Popover.types';

/**
 * Private context published by `<Popover.Content>` to its arrow descendant. Carries the
 * positioning data the arrow needs without exposing it on the public Popover context (which
 * would tempt consumers to read `placement` / `arrowRef` from outside the Content tree).
 */
export interface PopoverContentContextValue {
  arrowRef: RefCallback<HTMLElement | null>;
  arrowData: { x?: number; y?: number; centerOffset?: number } | undefined;
  placement: PopoverPlacement;
  size: PopoverSize;
}

export const PopoverContentContext = createContext<PopoverContentContextValue | null>(null);