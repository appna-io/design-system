/**
 * `<Icon>` — the DS icon primitive. Library-agnostic. Three render modes (`as` / `name` /
 * `children`). Companion `<IconProvider>` + `createIconRegistry` + `useIconRegistry` wire the
 * consumer's icon library to the DS via a stable string-name contract (`DS_ICON_NAMES`).
 *
 * Tier 1 primitive. Cross-cuts every interactive component but ships without forcing a
 * migration on any of them — existing `ReactNode` icon slots keep working.
 */
export { Icon } from './Icon';
export { IconProvider } from './IconProvider';
export {
  createIconRegistry,
  EMPTY_ICON_REGISTRY,
  type IconComponent,
  type IconRegistry,
  type IconRegistrySource,
  type CreateIconRegistryOptions,
} from './IconRegistry';
export { useIconRegistry, type UseIconRegistryReturn } from './useIconRegistry';

export { DS_ICON_NAMES, type DSIconName } from './DS_ICON_CATALOG';

export { resolveIconA11y } from './resolveIconA11y';
export type { ResolveIconA11yInput, ResolveIconA11yOutput } from './resolveIconA11y';
export {
  resolveIconSize,
  isIconSizeToken,
  type IconSize,
  type IconSizeToken,
  type ResolvedIconSize,
} from './resolveIconSize';
export {
  resolveIconColor,
  isIconColorToken,
  type IconColor,
  type IconColorToken,
  type ResolvedIconColor,
} from './resolveIconColor';

export type {
  IconFlip,
  IconProps,
  IconProviderProps,
  IconRotate,
  IconVariant,
} from './Icon.types';
