import type { NavigationMenuTranslations } from './NavigationMenu.types';

/**
 * Default English translation bundle. Mirrors the DataGrid / Combobox / Calendar
 * pattern — the canonical bundle ships next to the component, the I18nProvider
 * lookup falls back to it when a key is missing or no provider is mounted.
 *
 * Consumers override individual keys via `<NavigationMenu translations={…}>` or
 * via `<I18nProvider messages={{ navigationMenu: { … } }}>`. The provider path
 * is preferred for app-wide locale switching.
 */
export const DEFAULT_NAVIGATION_MENU_TRANSLATIONS: NavigationMenuTranslations = {
  label: 'Main navigation',
  toggleSection: 'Toggle {label} menu',
  activeItem: 'current page',
};

/** Hebrew translations. Direction handled by the engine `<DirectionProvider dir="rtl">`. */
export const HE_NAVIGATION_MENU_TRANSLATIONS: NavigationMenuTranslations = {
  label: 'ניווט ראשי',
  toggleSection: 'החלף תפריט {label}',
  activeItem: 'דף נוכחי',
};

/** Arabic translations. Direction handled by the engine `<DirectionProvider dir="rtl">`. */
export const AR_NAVIGATION_MENU_TRANSLATIONS: NavigationMenuTranslations = {
  label: 'التنقل الرئيسي',
  toggleSection: 'تبديل قائمة {label}',
  activeItem: 'الصفحة الحالية',
};

/**
 * Merge consumer overrides onto the default English bundle. Mirrors the
 * `mergeDataGridTranslations` / `mergeCalendarTranslations` shape so consumers
 * see one consistent merge helper across the DS.
 */
export function mergeNavigationMenuTranslations(
  base: NavigationMenuTranslations,
  override: Partial<NavigationMenuTranslations> | undefined,
): NavigationMenuTranslations {
  if (!override) return base;
  return {
    label: override.label ?? base.label,
    toggleSection: override.toggleSection ?? base.toggleSection,
    activeItem: override.activeItem ?? base.activeItem,
  };
}

/**
 * Tiny `{token}` interpolator. The standard DS i18n path uses the engine's
 * `interpolate()` helper, but for a 3-key bundle whose only template is
 * `{label}` we can avoid the dependency edge and ship a 4-line helper.
 */
export function interpolateNavMenu(
  template: string,
  params: Record<string, string | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? '');
}
