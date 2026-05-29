/**
 * Compound-component assembly for `<Tabs>` — follows the canonical pattern documented in
 * `Card/index.ts`. The root is `<Tabs>`; subparts are reachable via dot syntax
 * (`<Tabs.List>`, `<Tabs.Trigger>`, `<Tabs.Panel>`).
 */
import { TabsRoot } from './Tabs';
import { TabsList } from './TabsList';
import { TabsPanel } from './TabsPanel';
import { TabsTrigger } from './TabsTrigger';

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});

export { useTabsContext } from './TabsContext';

export type {
  TabsActivation,
  TabsAlignment,
  TabsColor,
  TabsContextValue,
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsProps,
  TabsSize,
  TabsTriggerProps,
  TabsVariant,
} from './Tabs.types';
