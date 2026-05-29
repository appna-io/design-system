import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { BadgeColor, BadgeVariant } from '../Badge/Badge.types';

export type TagsInputVariant = 'filled' | 'outline' | 'ghost';
export type TagsInputSize = 'sm' | 'md' | 'lg';
export type TagsInputTagSize = 'xs' | 'sm' | 'md';

/** Tag-creation source — useful for analytics + announce wording. */
export type TagsInputAddSource = 'enter' | 'separator' | 'paste' | 'blur' | 'suggestion';

/** Tag-removal source — `'backspace'` vs `'remove-button'` differ in AT announcement. */
export type TagsInputRemoveSource = 'backspace' | 'cursor-delete' | 'remove-button';

export interface TagsInputChangeMeta {
  /** What just happened. `'add'` / `'remove'` / `'clear'` / `'reject-duplicate'` / `'reject-invalid'` / `'reject-max'`. */
  action:
    | 'add'
    | 'remove'
    | 'clear'
    | 'reject-duplicate'
    | 'reject-invalid'
    | 'reject-max';
  /** The tag value the action targeted (for adds + removes + rejects). */
  tag?: string | undefined;
  /** Provenance, populated for `add` / `remove`. */
  source?: TagsInputAddSource | TagsInputRemoveSource | undefined;
  /** When `action: 'reject-invalid'`, the validator-returned message (or default). */
  error?: string | undefined;
}

export type TagsInputChangeHandler = (
  next: ReadonlyArray<string>,
  meta: TagsInputChangeMeta,
) => void;

/**
 * Per-tag validator return:
 *  - `true` — tag is valid.
 *  - `false` — tag is invalid; the consumer-supplied `errorMessage` (or default) is shown.
 *  - `string` — tag is invalid; the returned string is the inline error message.
 */
export type TagsInputValidator = (tag: string) => boolean | string;

/**
 * Slot props handed to `renderTag`. `removeProps` is fully wired (click + keyboard + aria-label)
 * and should be spread onto the consumer's remove `<button>`.
 */
export interface TagsInputRenderTagContext {
  /** The tag's index in the current value array. */
  index: number;
  /** True when the tag failed `validate(tag)`. Style accordingly. */
  invalid: boolean;
  /** True when the tag is currently selected by the "tag cursor" (Backspace-ready). */
  selected: boolean;
  /** Props to spread onto the remove button. Includes `onClick`, `onKeyDown`, `aria-label`. */
  removeProps: {
    type: 'button';
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    'aria-label': string;
    tabIndex: -1;
  };
  /** True when the entire control is disabled / read-only — typically suppresses the remove button. */
  disabled: boolean;
}

export type TagsInputRenderTag = (
  tag: string,
  ctx: TagsInputRenderTagContext,
) => ReactNode;

export type TagsInputRenderSuggestion<T> = (
  item: T,
  ctx: { active: boolean; index: number; query: string },
) => ReactNode;

export interface TagsInputTranslations {
  removeTag: (tag: string) => string;
  placeholder: string;
  placeholderMax: (max: number) => string;
  count: (count: number, max: number | undefined) => string;
  invalidTag: (tag: string, error: string) => string;
  suggestionsLabel: string;
  noSuggestions: string;
  loading: string;
  addedAnnouncement: (tag: string) => string;
  removedAnnouncement: (tag: string) => string;
  duplicateAnnouncement: (tag: string) => string;
  maxReachedAnnouncement: (max: number) => string;
}

export interface TagsInputProps<T = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'color'> {
  /** Controlled value. Pair with `onChange`. */
  value?: ReadonlyArray<string> | undefined;
  /** Uncontrolled initial value. @default [] */
  defaultValue?: ReadonlyArray<string> | undefined;
  /** Fires on every committed mutation (add / remove / clear / reject). */
  onChange?: TagsInputChangeHandler | undefined;

  /** Static suggestion list. Use `loadSuggestions` for async. */
  suggestions?: ReadonlyArray<T> | undefined;
  /** Async suggestion fetcher (debounced + abortable). */
  loadSuggestions?:
    | ((query: string, ctx: { signal: AbortSignal }) => Promise<T[]>)
    | undefined;
  /** Debounce window for `loadSuggestions`. @default 250 */
  debounceMs?: number | undefined;
  /** Min characters typed before suggestions appear. @default 0 */
  minQueryLength?: number | undefined;
  /** Override the default substring-match filter for static suggestions. */
  filterSuggestions?: ((items: ReadonlyArray<T>, query: string) => T[]) | undefined;
  /** Map a suggestion item to its tag string. Defaults to `String(item)`. */
  getSuggestionValue?: ((item: T) => string) | undefined;
  /** Map a suggestion item to a stable React key. Defaults to the suggestion value. */
  getSuggestionKey?: ((item: T) => string) | undefined;
  /** Render slot for each suggestion row. Defaults to the suggestion value as plain text. */
  renderSuggestion?: TagsInputRenderSuggestion<T> | undefined;

  /** Separators that commit the pending input as tags. @default [' ', ','] */
  splitOn?: ReadonlyArray<string> | RegExp | undefined;
  /** Commit on Enter. @default true */
  commitOnEnter?: boolean | undefined;
  /** Commit pending text when the input blurs. @default false */
  commitOnBlur?: boolean | undefined;
  /** Trim whitespace before validating + storing. @default true */
  trim?: boolean | undefined;
  /** Lowercase the tag before validating + storing. @default false */
  toLowerCase?: boolean | undefined;
  /** Allow duplicate tags. @default false */
  allowDuplicates?: boolean | undefined;
  /** Hard cap on the number of tags. */
  maxTags?: number | undefined;
  /** Per-tag validator. */
  validate?: TagsInputValidator | undefined;
  /** Default error message when `validate` returns `false`. @default 'Invalid tag' */
  errorMessage?: string | undefined;

  /** Custom tag renderer. Defaults to `<Badge removable>`. */
  renderTag?: TagsInputRenderTag | undefined;
  /** Show a "n / max" count chip to the right of the input. @default false */
  showCount?: boolean | undefined;
  /** Hint rendered inside the field when no tags + no input text yet. */
  emptyHint?: ReactNode | undefined;

  /** Visible label above the field. */
  label?: ReactNode | undefined;
  /** Hint below the label. */
  description?: ReactNode | undefined;
  /** Bottom helper. Hidden when `error` is set. */
  helperText?: ReactNode | undefined;
  /** Bottom error. Sets `aria-invalid="true"` on the input + danger ring on the wrapper. */
  error?: ReactNode | undefined;
  /** Sets `aria-required="true"` + cascades `required` onto the hidden inputs. */
  required?: boolean | undefined;
  /** Removes interaction; field grays out. */
  disabled?: boolean | undefined;
  /** Static display: no add, no remove, no suggestions. */
  readOnly?: boolean | undefined;
  /** Hidden-input name. Each committed tag posts a `<input type="hidden" name=…>` entry. */
  name?: string | undefined;

  /** Placeholder for the inner `<input>`. Falls back to the i18n string. */
  placeholder?: string | undefined;

  /** Visual variant of the wrapper (mirrors Input). @default 'outline' */
  variant?: ResponsiveValue<TagsInputVariant> | undefined;
  /** Field height + typography. @default 'md' */
  size?: ResponsiveValue<TagsInputSize> | undefined;
  /** Tag chip size. @default 'sm' */
  tagSize?: TagsInputTagSize | undefined;
  /** Tag chip color (Badge palette). @default 'neutral' */
  tagColor?: BadgeColor | undefined;
  /** Tag chip variant (Badge variant family). @default 'soft' */
  tagVariant?: BadgeVariant | undefined;

  /** Replace any subset of the English default strings. */
  translations?: Partial<TagsInputTranslations> | undefined;

  /** Theme-aware inline style object (resolves palette/spacing/radius tokens to CSS vars). */
  sx?: Sx | undefined;
  style?: CSSProperties | undefined;
}
