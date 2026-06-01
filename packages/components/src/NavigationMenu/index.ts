/**
 * Public surface for the NavigationMenu family.
 *
 * Compound primitive — the root and 7 subparts are merged via `Object.assign` so
 * consumers write `<NavigationMenu.Item>` / `<NavigationMenu.Trigger>` / etc.
 * with no extra imports. Mirrors the Sidebar / Card / Toolbar / Tabs convention;
 * see `Sidebar/index.ts` for the full rationale.
 *
 * The pure helper `isActiveHref` is **not** re-exported here — Sidebar already
 * owns that export and re-exporting it would create two import paths for the
 * same function. NavigationMenu uses it internally (relative import) and
 * consumers import it from `apx-ds`'s top-level export (where it's already
 * exposed via the Sidebar barrel).
 */
import { NavigationMenuRoot } from './NavigationMenu';
import { NavigationMenuContent } from './NavigationMenuContent';
import { NavigationMenuFeatured } from './NavigationMenuFeatured';
import { NavigationMenuGroup } from './NavigationMenuGroup';
import { NavigationMenuIndicator } from './NavigationMenuIndicator';
import { NavigationMenuItem } from './NavigationMenuItem';
import { NavigationMenuLink } from './NavigationMenuLink';
import { NavigationMenuTrigger } from './NavigationMenuTrigger';

export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Link: NavigationMenuLink,
  Content: NavigationMenuContent,
  Group: NavigationMenuGroup,
  Featured: NavigationMenuFeatured,
  Indicator: NavigationMenuIndicator,
});

export {
  AR_NAVIGATION_MENU_TRANSLATIONS,
  DEFAULT_NAVIGATION_MENU_TRANSLATIONS,
  HE_NAVIGATION_MENU_TRANSLATIONS,
  mergeNavigationMenuTranslations,
} from './NavigationMenu.i18n';

export {
  navMenuChevronRecipe,
  navMenuContentRecipe,
  navMenuFeaturedRecipe,
  navMenuGroupLabelRecipe,
  navMenuGroupRecipe,
  navMenuIndicatorRecipe,
  navMenuItemRecipe,
  navMenuMegaRecipe,
  navMenuPanelLinkRecipe,
  navMenuRootRecipe,
  navMenuTriggerRecipe,
} from './NavigationMenu.recipe';

export type {
  NavigationMenuActiveMatchStrategy,
  NavigationMenuColumns,
  NavigationMenuContentProps,
  NavigationMenuContentVariant,
  NavigationMenuContextValue,
  NavigationMenuFeaturedProps,
  NavigationMenuGroupProps,
  NavigationMenuIndicatorProps,
  NavigationMenuIndicatorVariant,
  NavigationMenuItemProps,
  NavigationMenuItemRecord,
  NavigationMenuLinkProps,
  NavigationMenuMobileBreakpoint,
  NavigationMenuOrientation,
  NavigationMenuProps,
  NavigationMenuSize,
  NavigationMenuTranslations,
  NavigationMenuTriggerMode,
  NavigationMenuTriggerProps,
  NavigationMenuVariant,
} from './NavigationMenu.types';