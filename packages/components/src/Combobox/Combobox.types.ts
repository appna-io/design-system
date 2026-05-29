import type {
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { PopoverPlacement } from '../Popover/Popover.types';

/**
 * Visual chrome for the input shell. Same four-variant vocabulary as Input / Textarea / Select —
 * Combobox IS a form-control, so the form-control variant set applies even though the underlying
 * element is an `<input>` plus a portaled listbox. Lock-step with Phase 7 / 8 / 23.
 */
export type ComboboxVariant = 'outline' | 'solid' | 'ghost' | 'underline';

export type ComboboxSize = 'sm' | 'md' | 'lg';

export type ComboboxColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Reuse Popover's placement vocabulary — every overlay primitive in the DS aliases from this
 * single source (Tooltip → Popover → Menu → Select → Combobox).
 */
export type ComboboxPlacement = PopoverPlacement;

/**
 * Built-in filter strategies. `'custom'` defers to the consumer's `filterOption` prop. 90% of
 * consumers want `substring`; 9% want `fuzzy`; 1% want full custom — the matchStrategy short-hand
 * keeps the common path one prop instead of three.
 */
export type ComboboxMatchStrategy = 'substring' | 'startsWith' | 'fuzzy' | 'custom';

/** Mode discriminator — used internally to share one implementation across single + multi. */
export type ComboboxMode = 'single' | 'multiple';

/**
 * The canonical option record. `value` is the form-submitted identifier; `label` is what gets
 * rendered (and the default `textValue` for substring/fuzzy matching). Consumers can extend the
 * record shape via `O` — `renderOption` + `filterOption` receive the original `O`, so an option
 * can carry an avatar URL, an email, etc. without leaking into the public type.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Override the text used for substring/fuzzy matching. Default: `label`. */
  textValue?: string;
}

/**
 * A named group of options. Rendered with a sticky-style `<Group.Label>` followed by the group's
 * children — purely visual + ARIA grouping.
 */
export interface ComboboxGroup<O extends ComboboxOption = ComboboxOption> {
  type: 'group';
  label: ReactNode;
  children: O[];
}

/** Union: either a leaf option or a group. Consumed by `options` + flattened internally. */
export type ComboboxOptionOrGroup<O extends ComboboxOption = ComboboxOption> =
  | O
  | ComboboxGroup<O>;

/** Async-state flavor used by the deferred filter + the loading/error/empty render slots. */
export type ComboboxLoadingState = 'idle' | 'loading' | 'error' | 'empty' | 'ready';

/**
 * Render context handed to `renderOption`. Receives the original option `O` (so consumers can
 * read extra fields) plus the live highlight + selection flags.
 */
export interface ComboboxRenderOptionContext<O extends ComboboxOption = ComboboxOption> {
  option: O;
  isActive: boolean;
  isSelected: boolean;
  query: string;
}

/**
 * The English translation defaults bundled with Combobox. Consumers pass `translations={...}` to
 * override individual strings — no `<I18nProvider>` dependency in V1 (the provider doesn't exist
 * yet; Combobox accepts inline overrides instead, matching `<Toast>`'s pattern).
 */
export interface ComboboxTranslations {
  openOptions: string;
  closeOptions: string;
  clearSelection: string;
  removeTag: (label: string) => string;
  loading: string;
  loadingError: string;
  empty: string;
  emptyForQuery: (query: string) => string;
  createOption: (label: string) => string;
}

/**
 * Common props shared between `<Combobox>` and `<MultiCombobox>`. Both modes consume the same
 * implementation; the only difference is the `mode` axis + the shape of `value` / `onChange`.
 */
interface ComboboxBaseProps<O extends ComboboxOption = ComboboxOption> {
  /** Static option list. Ignored when `loadOptions` is provided. */
  options?: ComboboxOptionOrGroup<O>[];
  /**
   * Async option loader. When provided, replaces the static list; debounced + AbortController-aware
   * via the bundled `useDeferredFilter`. Resolves with the option list to display for `query`.
   */
  loadOptions?: (query: string, ctx: { signal: AbortSignal }) => Promise<O[]>;
  /** Controlled query (input value). */
  inputValue?: string;
  /** Uncontrolled initial query. Default: `''`. */
  defaultInputValue?: string;
  /** Fires whenever the query changes. */
  onInputValueChange?: (value: string) => void;
  /** Placeholder for the input. Default: `'Search…'`. */
  placeholder?: string;
  /** Built-in filter shortcut. `'custom'` defers to `filterOption`. Default: `'substring'`. */
  matchStrategy?: ComboboxMatchStrategy;
  /** Per-option predicate. Wins over `matchStrategy` when provided. */
  filterOption?: (option: O, query: string) => boolean;
  /** Allow creating a new option from the current query. */
  creatable?: boolean;
  /**
   * Called when the user activates "Create '{query}'" via Enter or click. Should return the new
   * option (sync or async). The returned option's `value` is then added to the selection.
   */
  onCreateOption?: (label: string) => O | Promise<O>;
  /** Render a clear-all "×" button on the right edge of the input. Default: `true`. */
  clearable?: boolean;
  /** Single mode: close on select. Multi: stay open. Override per prop. */
  closeOnSelect?: boolean;
  /** Open the listbox the moment the input gains focus. Default: `false`. */
  openOnFocus?: boolean;
  /** Async fetch debounce in ms. Default: `300`. */
  debounceMs?: number;
  /**
   * Explicit loading override. When set, takes precedence over the internal `useDeferredFilter`
   * state — useful when the consumer is driving the fetch lifecycle themselves.
   */
  loadingState?: ComboboxLoadingState;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open. Default: `false`. */
  defaultOpen?: boolean;
  /** Fires when the listbox opens / closes. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement of the listbox. Default: `'bottom-start'`. */
  placement?: ComboboxPlacement;
  /** Sync the listbox width to the input's width. Default: `true`. */
  matchTriggerWidth?: boolean;
  /** Custom item renderer. Receives `{ option, isActive, isSelected, query }`. */
  renderOption?: (ctx: ComboboxRenderOptionContext<O>) => ReactNode;
  /** Empty-state body (no results for the current query). Receives the current query. */
  renderEmpty?: (query: string) => ReactNode;
  /** Loading-state body. */
  renderLoading?: () => ReactNode;
  /** Error-state body. Receives the rejected error. */
  renderError?: (error: Error) => ReactNode;
  /** "Create '{label}'" row renderer. Default: a translated label inside an option-styled row. */
  renderCreateOption?: (label: string) => ReactNode;
  /** Visual chrome for the input shell. Default: `'outline'`. */
  variant?: ResponsiveValue<ComboboxVariant>;
  /** Size axis. Matches Input height per size. Default: `'md'`. */
  size?: ResponsiveValue<ComboboxSize>;
  /** Palette role. Default: `'primary'`. */
  color?: ResponsiveValue<ComboboxColor>;
  /** Stretch the input shell to fill its container. Default: `true`. */
  fullWidth?: ResponsiveValue<boolean>;
  /** Disable interaction. */
  disabled?: boolean;
  /** `aria-invalid` + danger border / ring. */
  invalid?: boolean;
  /** Mirrors native `required`. */
  required?: boolean;
  /** Form name. When set, a hidden `<input type="hidden" name value>` participates in form submission. */
  name?: string;
  /** Override the portal container for the listbox. */
  portalContainer?: HTMLElement | null;
  /** Translation overrides. Defaults to bundled English. */
  translations?: Partial<ComboboxTranslations>;
  /** Explicit id for the input element. */
  id?: string;
  /** `aria-label` for the input. */
  'aria-label'?: string;
  /** `aria-labelledby` for the input. */
  'aria-labelledby'?: string;
  /** `aria-describedby` for the input. */
  'aria-describedby'?: string;
  /** Forwarded to the wrapper. */
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
  /**
   * Native `<input>` props that pass through (e.g. `autoFocus`, `readOnly`, `inputMode`). We
   * explicitly **keep** `onChange` / `onFocus` / `onKeyDown` callable here so consumers can
   * observe + decorate them; Combobox composes its own handlers on top and only short-circuits
   * when the consumer calls `event.preventDefault()`.
   */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'role' | 'aria-activedescendant'
  >;
}

/**
 * Single-select Combobox. `value` is `string | null`; `onChange` receives the new value (or
 * `null` when cleared).
 */
export interface ComboboxProps<O extends ComboboxOption = ComboboxOption>
  extends ComboboxBaseProps<O> {
  /** Controlled value. */
  value?: string | null;
  /** Uncontrolled initial value. Default: `null`. */
  defaultValue?: string | null;
  /** Fires when the selection changes. */
  onChange?: (value: string | null) => void;
}

/**
 * Multi-select Combobox. `value` is `string[]`; selecting an already-selected value toggles it
 * off. Renders selected items as removable `<Badge>` chips before the input.
 */
export interface MultiComboboxProps<O extends ComboboxOption = ComboboxOption>
  extends ComboboxBaseProps<O> {
  /** Controlled value list. */
  value?: string[];
  /** Uncontrolled initial value list. Default: `[]`. */
  defaultValue?: string[];
  /** Fires when the selection changes. */
  onChange?: (value: string[]) => void;
  /** Optional cap on selected items; selection past this is a no-op. */
  maxSelections?: number;
}

/**
 * Internal item record used by `useListKeyboard`. Generated from `flattenOptions` + filtered;
 * exposes the props the keyboard hook needs (id + textValue + disabled) plus the original option
 * so the dispatcher can call `onChange` with the value.
 */
export interface ComboboxItemRecord<O extends ComboboxOption = ComboboxOption> {
  /** DOM id of the rendered option element — fed to `aria-activedescendant`. */
  id: string;
  /** Option's `value` — what gets committed when selected. */
  value: string;
  /** Type-ahead / filter text. */
  textValue: string;
  /** When `true`, skipped during arrow nav + ignored by Enter / Space. */
  disabled: boolean;
  /** The original option record — handed back via `onChange` / `renderOption`. */
  option: O;
  /** Optional group label this option belongs to (drives rendering only — flat for keyboard nav). */
  group?: ReactNode;
}

/**
 * Special "create new" pseudo-item. Rendered at the tail of the list when `creatable` is on +
 * the current query doesn't match any existing option. Has the same `id` + `textValue` shape
 * as `ComboboxItemRecord` so it slots into the keyboard hook without a separate code path.
 */
export interface ComboboxCreateItemRecord {
  id: string;
  textValue: string;
  disabled: false;
  isCreate: true;
  /** Label to create — the current query. */
  label: string;
}

/** Discriminated union of items the listbox actually renders. */
export type ComboboxListItem<O extends ComboboxOption = ComboboxOption> =
  | ({ kind: 'option' } & ComboboxItemRecord<O>)
  | ({ kind: 'create' } & ComboboxCreateItemRecord);

/**
 * Default English strings. Exported so tests + Storybook can assert against them. Merged with
 * `props.translations` via a shallow spread at the call site.
 */
export const DEFAULT_COMBOBOX_TRANSLATIONS: ComboboxTranslations = {
  openOptions: 'Show options',
  closeOptions: 'Hide options',
  clearSelection: 'Clear selection',
  removeTag: (label: string) => `Remove ${label}`,
  loading: 'Loading…',
  loadingError: 'Could not load options.',
  empty: 'No options.',
  emptyForQuery: (query: string) => `No results for "${query}".`,
  createOption: (label: string) => `Create "${label}"`,
};

/**
 * Internal-only convenience type used by the shared `<ComboboxImpl>` to discriminate single vs
 * multi without two duplicated component files. The public exports erase this back to the
 * `Combobox` / `MultiCombobox` props above.
 */
export type ComboboxImplProps<O extends ComboboxOption = ComboboxOption> =
  | ({ mode: 'single' } & ComboboxProps<O>)
  | ({ mode: 'multiple' } & MultiComboboxProps<O>);

/** Helper alias for the listbox's `<ul>`-style container — re-exported for power consumers. */
export type ComboboxListProps = HTMLAttributes<HTMLDivElement>;
