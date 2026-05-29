/**
 * `<Combobox>` + `<MultiCombobox>` — searchable-select primitive. The two exports share one
 * implementation that branches on an internal `mode` discriminator; consumers get the right
 * `value` / `onChange` typing without a discriminated-union prop.
 */
export { Combobox, MultiCombobox } from './Combobox';

export {
  DEFAULT_COMBOBOX_TRANSLATIONS,
  type ComboboxColor,
  type ComboboxCreateItemRecord,
  type ComboboxGroup,
  type ComboboxItemRecord,
  type ComboboxListItem,
  type ComboboxListProps,
  type ComboboxLoadingState,
  type ComboboxMatchStrategy,
  type ComboboxMode,
  type ComboboxOption,
  type ComboboxOptionOrGroup,
  type ComboboxPlacement,
  type ComboboxProps,
  type ComboboxRenderOptionContext,
  type ComboboxSize,
  type ComboboxTranslations,
  type ComboboxVariant,
  type MultiComboboxProps,
} from './Combobox.types';

// Pure headless helpers — exported publicly so future Combobox-like components (CommandPalette,
// search-dropdowns) and consumer apps can reuse them without depending on the React component.
export { flattenOptions } from './headless/flattenOptions';
export type { FlattenedOptions } from './headless/flattenOptions';
export { filterStrategies, fuzzyMatch } from './headless/filterStrategies';
export type { FilterStrategyFn } from './headless/filterStrategies';
export { highlightMatch } from './headless/highlightMatch';
export { useDeferredFilter } from './headless/useDeferredFilter';
export type {
  UseDeferredFilterOptions,
  UseDeferredFilterReturn,
} from './headless/useDeferredFilter';
