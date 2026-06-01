/**
 * Toggle / ToggleGroup public surface.
 *
 * Two named exports rather than a compound `Toggle.Group` pattern, because:
 *
 *  - `<Toggle>` is genuinely useful standalone (sidebar collapse, "show/hide" affordance).
 *  - `<ToggleGroup>` and `<ToggleGroup.Item>` only make sense together; assembling them as
 *    a compound on `ToggleGroup` keeps the discoverability story tight.
 *
 * Card / Alert / Accordion all assemble subparts on the root via `Object.assign`; we follow
 * that pattern for `<ToggleGroup>` so consumers reach for `<ToggleGroup.Item>` consistently.
 */
import { Toggle } from './Toggle';
import { ToggleGroup as ToggleGroupRoot } from './ToggleGroup';
import { ToggleGroupItem } from './ToggleGroupItem';

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});

export { Toggle };

export type {
  ToggleColor,
  ToggleGroupItemProps,
  ToggleGroupProps,
  ToggleOrientation,
  ToggleProps,
  ToggleSize,
  ToggleVariant,
} from './Toggle.types';