/**
 * Public surface for the Sidebar family.
 *
 * Compound primitive — the root and 6 subparts are merged via `Object.assign` so consumers
 * write `<Sidebar.Item>` / `<Sidebar.Section>` / etc. with no extra imports. Mirrors the Card /
 * Toolbar / Tabs convention; see `Card/index.ts` for the full rationale.
 *
 * The pure helper `isActiveHref` is exported separately so it can be reused by future siblings
 * (NavigationMenu auto-active, Breadcrumb URL highlighting). Its truth-table is unit-tested.
 */
import { SidebarRoot } from './Sidebar';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { SidebarSpacer } from './SidebarSpacer';
import { SidebarSubItems } from './SidebarSubItems';

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Footer: SidebarFooter,
  Section: SidebarSection,
  Item: SidebarItem,
  SubItems: SidebarSubItems,
  Spacer: SidebarSpacer,
});

export { isActiveHref } from './isActiveHref';

export type {
  SidebarActiveMatchStrategy,
  SidebarContextValue,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarItemSize,
  SidebarItemVariant,
  SidebarPosition,
  SidebarProps,
  SidebarSectionProps,
  SidebarSize,
  SidebarSpacerProps,
  SidebarSubItemsProps,
  SidebarVariant,
} from './Sidebar.types';
