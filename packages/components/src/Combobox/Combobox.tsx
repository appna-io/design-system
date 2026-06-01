'use client';

import {
  mergeRefs,
  Portal,
  useControllableState,
  useEscapeStack,
  useI18n,
  useId,
  useOutsideClick,
  usePosition,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Check, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { Badge } from '../Badge/Badge';
import { selectContentRecipe, selectItemRecipe } from '../Select/Select.recipe';
import { selectMotion } from '../Select/Select.motion';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { useListKeyboard } from '../_shared/useListKeyboard';

import {
  comboboxClearButtonRecipe,
  comboboxCreateRowRecipe,
  comboboxEmptyRecipe,
  comboboxErrorRecipe,
  comboboxGroupLabelRecipe,
  comboboxInputRecipe,
  comboboxLoadingRecipe,
  comboboxWrapperRecipe,
} from './Combobox.recipe';
import { filterStrategies } from './headless/filterStrategies';
import { flattenOptions } from './headless/flattenOptions';
import { useDeferredFilter } from './headless/useDeferredFilter';
import {
  DEFAULT_COMBOBOX_TRANSLATIONS,
  type ComboboxImplProps,
  type ComboboxItemRecord,
  type ComboboxListItem,
  type ComboboxOption,
  type ComboboxPlacement,
  type ComboboxProps,
  type ComboboxTranslations,
  type MultiComboboxProps,
} from './Combobox.types';

/**
 * `<Combobox>` — the canonical searchable-select primitive. A `<Select>` with a typeable input
 * that filters its option list as the user types. Sits at the intersection of three families:
 *
 *  - **Form-control** — same `controlBase` + `variantColorMatrix` shell as Input / Textarea /
 *    Select. The wrapper is the **fourth consumer** of the matrix.
 *  - **Overlay** — reuses Select's listbox recipe (`selectContentRecipe`) and item recipe
 *    (`selectItemRecipe`) verbatim. Same `usePosition` (`matchTriggerWidth` middleware), same
 *    `<Portal>`, same `selectMotion` slide+fade.
 *  - **List keyboard** — reuses `_shared/useListKeyboard.ts`. Combobox is the **third consumer**
 *    (Menu → Select → Combobox), validating the second-consumer extraction we did during
 *    Phase 23.
 *
 * One component handles both single and multi modes via the internal `mode` discriminator. The
 * public exports (`Combobox`, `MultiCombobox`) are thin shims that pin `mode` so consumers get
 * the right `value` / `onChange` typing without unions in their props.
 *
 * **Why one implementation, not two**: 90% of the behavior is identical — input + listbox +
 * keyboard + async + creatable + form integration. The only delta is "single value vs array"
 * and "single mode closes on select, multi mode stays open + removes tag on backspace." Splitting
 * those branches across two files would have triplicated the keyboard hook + filter pipeline.
 *
 * The implementation is deliberately a single function (not a compound) because the plan calls
 * for a props-driven API (`options`, `renderOption`, `loadOptions`, `filterOption`) — matching
 * Mantine / MUI / Headless UI's autocomplete shape. A subpart-based API would have added 8+
 * exports without any per-subpart customization value (the input + listbox + items are always
 * rendered as a tight unit).
 */
function ComboboxImplInner<O extends ComboboxOption>(
  props: ComboboxImplProps<O>,
  forwardedRef: ForwardedRef<HTMLInputElement>,
): ReactElement {
  const {
    mode,
    options: optionsProp,
    loadOptions,
    inputValue: inputValueProp,
    defaultInputValue,
    onInputValueChange,
    placeholder,
    matchStrategy = 'substring',
    filterOption,
    creatable = false,
    onCreateOption,
    clearable = true,
    closeOnSelect,
    openOnFocus = false,
    debounceMs = 300,
    loadingState: loadingStateOverride,
    open: openProp,
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    matchTriggerWidth = true,
    renderOption,
    renderEmpty,
    renderLoading,
    renderError,
    renderCreateOption,
    variant,
    size,
    color,
    fullWidth,
    disabled = false,
    invalid = false,
    required = false,
    name,
    portalContainer,
    translations: translationsProp,
    id: providedId,
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledbyProp,
    'aria-describedby': ariaDescribedbyProp,
    className,
    style,
    sx,
    inputProps: inputPropsProp,
  } = props;

  const isMulti = mode === 'multiple';
  const effectiveCloseOnSelect = closeOnSelect ?? !isMulti;
  // Three-layer translation precedence (Phase 58 RFC #2):
  //   1. `translations={...}` per-instance prop (highest)
  //   2. `<I18nProvider messages={{ Combobox: { ... } }}>` provider value
  //   3. Built-in English defaults (`DEFAULT_COMBOBOX_TRANSLATIONS`)
  // No provider → behaves identically to pre-RFC code: defaults + prop only.
  const i18n = useI18n();
  const providerTranslations = i18n?.get<Partial<ComboboxTranslations>>('Combobox');
  const t = useMemo(
    () => ({
      ...DEFAULT_COMBOBOX_TRANSLATIONS,
      ...providerTranslations,
      ...translationsProp,
    }),
    [providerTranslations, translationsProp],
  );

  // ── state ──────────────────────────────────────────────────────────────────
  const singleProps = !isMulti ? (props as ComboboxProps<O>) : undefined;
  const multiProps = isMulti ? (props as MultiComboboxProps<O>) : undefined;

  // Controlled-vs-uncontrolled detection in `useControllableState` is presence-based: a defined
  // value (even `null`) means controlled; `undefined` means uncontrolled. We must NOT collapse
  // `null` to `undefined` with `?? undefined` here — that would flip a `value={null}` clear from
  // controlled to uncontrolled mid-life and trigger the engine warning. Same goes for multi mode.
  const [singleValue, setSingleValueInternal] = useControllableState<string | null>({
    value: singleProps && 'value' in singleProps ? singleProps.value : undefined,
    defaultValue: singleProps?.defaultValue ?? null,
    onChange: singleProps?.onChange ?? undefined,
  });
  const [multiValueRaw, setMultiValueInternal] = useControllableState<string[]>({
    value: multiProps && 'value' in multiProps ? multiProps.value : undefined,
    defaultValue: multiProps?.defaultValue ?? [],
    onChange: multiProps?.onChange ?? undefined,
  });
  // Stabilize identity — `multiValueRaw ?? []` would produce a fresh array on every render,
  // causing every dependent useCallback to re-create and downstream React.memo subtrees to
  // re-render unnecessarily. The useMemo collapses the OR-default to a stable empty array.
  const multiValue = useMemo(() => multiValueRaw ?? [], [multiValueRaw]);
  const maxSelections = multiProps?.maxSelections;

  const [inputValueRaw, setInputValueInternal] = useControllableState<string>({
    value: inputValueProp,
    defaultValue: defaultInputValue ?? '',
    onChange: onInputValueChange ?? undefined,
  });
  const inputValue = inputValueRaw ?? '';

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled && next) return;
      setOpenInternal(next);
    },
    [setOpenInternal, disabled],
  );

  // ── refs ───────────────────────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const floatingNodeRef = useRef<HTMLElement | null>(null);
  // Maps option `value` → its rendered label, so we can paint the chip/single-mode label even
  // when the listbox is unmounted (async loader case: results disappear on close).
  const valueLabelCacheRef = useRef<Map<string, O>>(new Map());

  // ── ids ────────────────────────────────────────────────────────────────────
  const a11y = useFormFieldA11y({
    id: providedId,
    invalid,
    required,
    'aria-describedby': ariaDescribedbyProp,
  });
  const inputId = a11y.id;
  const listboxId = useId();

  // ── async loading ──────────────────────────────────────────────────────────
  const deferred = useDeferredFilter<O>({
    loadOptions,
    query: inputValue,
    debounceMs,
    enabled: Boolean(loadOptions) && open,
  });
  const effectiveLoadingState =
    loadingStateOverride ?? (loadOptions ? deferred.state : 'idle');

  // ── option list resolution ─────────────────────────────────────────────────
  // When `loadOptions` is provided, the deferred results win; static `options` is the fallback.
  const baseOptions = useMemo(() => {
    if (loadOptions) {
      return { options: deferred.results, groupLabels: deferred.results.map(() => undefined) };
    }
    return flattenOptions<O>(optionsProp);
  }, [loadOptions, deferred.results, optionsProp]);

  // Filter the static list. Async results are pre-filtered by the loader, so we leave them be.
  const filteredOptions = useMemo(() => {
    if (loadOptions) return baseOptions;
    if (!inputValue) return baseOptions;
    const customFilter = filterOption;
    const predicate = customFilter
      ? (opt: O) => customFilter(opt, inputValue)
      : (opt: O) => {
          const txt = opt.textValue ?? opt.label;
          if (matchStrategy === 'custom') return true;
          return filterStrategies[matchStrategy](txt, inputValue);
        };
    const filtered: O[] = [];
    const labels: typeof baseOptions.groupLabels = [];
    for (let i = 0; i < baseOptions.options.length; i++) {
      const opt = baseOptions.options[i];
      if (!opt) continue;
      if (predicate(opt)) {
        filtered.push(opt);
        labels.push(baseOptions.groupLabels[i]);
      }
    }
    return { options: filtered, groupLabels: labels };
  }, [loadOptions, baseOptions, inputValue, filterOption, matchStrategy]);

  // Update the value→label cache whenever an option crosses our path. Survives filter narrowing
  // and async result swaps so the chips/single-mode label always have an O to render from.
  useEffect(() => {
    const map = valueLabelCacheRef.current;
    for (const opt of baseOptions.options) {
      map.set(opt.value, opt);
    }
  }, [baseOptions.options]);

  // Build the keyboard-nav item list. Each option gets a stable id so `aria-activedescendant`
  // and React keys both line up. We rebuild on every filter change — that's fine, the list is
  // small (and virtualization would replace this for large lists, deferred to V2).
  const itemIdPrefix = `${inputId}-opt`;
  const items: ComboboxItemRecord<O>[] = useMemo(() => {
    return filteredOptions.options.map((opt, idx) => ({
      id: `${itemIdPrefix}-${idx}`,
      value: opt.value,
      textValue: opt.textValue ?? opt.label,
      disabled: Boolean(opt.disabled),
      option: opt,
      group: filteredOptions.groupLabels[idx],
    }));
  }, [filteredOptions, itemIdPrefix]);

  // Does the current query exactly match an existing option label? Drives whether the "Create
  // 'xyz'" row appears in creatable mode (we only offer creation when nothing already matches).
  const hasExactMatch = useMemo(() => {
    if (!inputValue) return false;
    const q = inputValue.toLowerCase();
    return baseOptions.options.some((o) => o.label.toLowerCase() === q);
  }, [baseOptions.options, inputValue]);

  const createId = `${inputId}-create`;
  const showCreateRow = creatable && Boolean(inputValue) && !hasExactMatch;

  // Combined list for the keyboard hook + renderer. The "create" pseudo-item is appended last.
  const listItems: ComboboxListItem<O>[] = useMemo(() => {
    const out: ComboboxListItem<O>[] = items.map((it) => ({ kind: 'option', ...it }));
    if (showCreateRow) {
      out.push({
        kind: 'create',
        id: createId,
        textValue: inputValue,
        disabled: false,
        isCreate: true,
        label: inputValue,
      });
    }
    return out;
  }, [items, showCreateRow, createId, inputValue]);

  // ── highlight state ────────────────────────────────────────────────────────
  const [highlightedId, setHighlightedIdState] = useState<string | null>(null);
  const setHighlightedId = useCallback((id: string | null) => setHighlightedIdState(id), []);

  // When the listbox opens (or the option list changes while open), seed the highlight to the
  // first enabled item so Enter is meaningful from the get-go. Mirrors native autocomplete UX.
  useEffect(() => {
    if (!open) {
      setHighlightedIdState(null);
      return;
    }
    setHighlightedIdState((current) => {
      if (current && listItems.some((it) => it.id === current)) return current;
      const first = listItems.find((it) => !it.disabled);
      return first?.id ?? null;
    });
  }, [open, listItems]);

  // ── selection ──────────────────────────────────────────────────────────────
  const isSelected = useCallback(
    (value: string): boolean => {
      if (isMulti) return multiValue.includes(value);
      return singleValue === value;
    },
    [isMulti, multiValue, singleValue],
  );

  const commitSingle = useCallback(
    (next: string | null) => {
      setSingleValueInternal(next);
      // Single mode: input shows the selected label after pick (preserves the "what did I pick"
      // affordance). Clearing resets to empty. Consumers using controlled `inputValue` override
      // this by holding their own value.
      if (inputValueProp === undefined) {
        if (next === null) {
          setInputValueInternal('');
        } else {
          const opt = valueLabelCacheRef.current.get(next);
          if (opt) setInputValueInternal(opt.label);
        }
      }
      if (effectiveCloseOnSelect) setOpenInternal(false);
    },
    [setSingleValueInternal, inputValueProp, setInputValueInternal, effectiveCloseOnSelect, setOpenInternal],
  );

  const commitMultiToggle = useCallback(
    (value: string) => {
      const exists = multiValue.includes(value);
      if (exists) {
        setMultiValueInternal(multiValue.filter((v) => v !== value));
      } else {
        if (maxSelections !== undefined && multiValue.length >= maxSelections) return;
        setMultiValueInternal([...multiValue, value]);
      }
      // Multi mode: clear the query after each selection so the next type-search starts fresh.
      // Consumers using controlled `inputValue` override this.
      if (inputValueProp === undefined) setInputValueInternal('');
      if (effectiveCloseOnSelect) setOpenInternal(false);
    },
    [
      multiValue,
      setMultiValueInternal,
      maxSelections,
      inputValueProp,
      setInputValueInternal,
      effectiveCloseOnSelect,
      setOpenInternal,
    ],
  );

  const handleCreate = useCallback(
    async (label: string) => {
      if (!onCreateOption || !label) return;
      const result = await Promise.resolve(onCreateOption(label));
      if (!result) return;
      // Cache the new option's label so the chip/single-mode label can resolve it even if the
      // consumer doesn't echo it back into `options`.
      valueLabelCacheRef.current.set(result.value, result);
      if (isMulti) {
        commitMultiToggle(result.value);
      } else {
        commitSingle(result.value);
      }
    },
    [onCreateOption, isMulti, commitMultiToggle, commitSingle],
  );

  const handleSelectId = useCallback(
    (id: string) => {
      const item = listItems.find((it) => it.id === id);
      if (!item) return;
      if (item.kind === 'create') {
        void handleCreate(item.label);
        return;
      }
      if (item.disabled) return;
      if (isMulti) commitMultiToggle(item.value);
      else commitSingle(item.value);
    },
    [listItems, handleCreate, isMulti, commitMultiToggle, commitSingle],
  );

  // ── keyboard ───────────────────────────────────────────────────────────────
  const onClose = useCallback(() => setOpen(false), [setOpen]);

  // The shared keyboard hook handles arrows / Home / End / Enter / Space / Esc / Tab / type-ahead.
  // We feed it the live listItems via `getItems` so filter changes are reflected on every press.
  // For Combobox, type-ahead is intentionally **disabled** — the input itself accepts text, and
  // typing routes through the input's onChange (which sets the query + re-filters). The shared
  // hook's type-ahead would intercept printable keys and prevent them from reaching the input.
  const handleListKeyboard = useListKeyboard<ComboboxListItem<O>>({
    getItems: () => listItems.filter((it) => !it.disabled),
    getHighlightedId: () => highlightedId,
    setHighlightedId,
    loop: true,
    typeAhead: false,
    onClose,
    onSelect: handleSelectId,
  });

  // Combobox-specific keys handled directly on the input element. We delegate everything else to
  // the shared hook so the four overlay components stay aligned on their nav model.
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      inputPropsProp?.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;

      const key = event.key;

      // ArrowDown / ArrowUp open the listbox even when closed (the shared hook needs items to
      // be present, which only happens when open). Once open, the shared hook handles them.
      if (!open && (key === 'ArrowDown' || key === 'ArrowUp')) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      // Multi mode: Backspace on an empty input removes the last tag — Mantine / react-select /
      // Headless UI all converge on this UX.
      if (isMulti && key === 'Backspace' && inputValue === '' && multiValue.length > 0) {
        event.preventDefault();
        setMultiValueInternal(multiValue.slice(0, -1));
        return;
      }

      // Hand the rest to the shared list keyboard hook.
      handleListKeyboard(event);
    },
    [
      inputPropsProp,
      disabled,
      open,
      setOpen,
      isMulti,
      inputValue,
      multiValue,
      setMultiValueInternal,
      handleListKeyboard,
    ],
  );

  // ── input events ───────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      inputPropsProp?.onChange?.(event);
      if (event.defaultPrevented) return;
      setInputValueInternal(event.target.value);
      if (!open) setOpen(true);
    },
    [inputPropsProp, setInputValueInternal, open, setOpen],
  );

  const handleInputFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      inputPropsProp?.onFocus?.(event);
      if (event.defaultPrevented) return;
      if (openOnFocus && !disabled) setOpen(true);
    },
    [inputPropsProp, openOnFocus, disabled, setOpen],
  );

  // Clicking the input opens the listbox. This matches Mantine / MUI / Headless UI — users
  // expect a single click on the field to reveal the options without having to type or press
  // ArrowDown first. Keeping focus-only open behind `openOnFocus` lets consumers opt in to the
  // even-more-aggressive "open the moment focus enters" flavor.
  const handleInputClick = useCallback(
    (event: MouseEvent<HTMLInputElement>) => {
      inputPropsProp?.onClick?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (!open) setOpen(true);
    },
    [inputPropsProp, disabled, open, setOpen],
  );

  const handleWrapperClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Clicking anywhere on the shell (e.g. an empty area between tags) focuses the input.
      if (disabled) return;
      if (event.target === wrapperRef.current) {
        inputRef.current?.focus();
      }
    },
    [disabled],
  );

  // ── escape + outside click ─────────────────────────────────────────────────
  useEscapeStack({ active: open, onEscape: () => setOpen(false) });
  useOutsideClick({
    active: open,
    refs: [wrapperRef, floatingNodeRef],
    onOutside: () => setOpen(false),
  });

  // ── floating positioning ───────────────────────────────────────────────────
  const { triggerRef: floatingTriggerRef, floatingRef, placement: actualPlacement, floatingStyles } =
    usePosition({
      placement: placement as ComboboxPlacement,
      offset: 4,
      matchTriggerWidth,
      open,
    });

  // Wire the wrapper into Floating UI on every open transition so re-renders don't desync the
  // anchor.
  useEffect(() => {
    const node = wrapperRef.current;
    if (node) (floatingTriggerRef as unknown as (el: unknown) => void)(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll the highlighted item into view — same guard Select uses for non-browser envs.
  useEffect(() => {
    if (!open || !highlightedId) return;
    const node = floatingNodeRef.current?.querySelector(`#${cssEscape(highlightedId)}`);
    if (node && typeof (node as HTMLElement).scrollIntoView === 'function') {
      (node as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedId, listItems]);

  // ── render classes ─────────────────────────────────────────────────────────
  const { className: wrapperClass, style: wrapperStyle } = useThemedClasses({
    recipe: comboboxWrapperRecipe,
    componentName: 'Combobox',
    slot: 'wrapper',
    props: { variant, size, color, fullWidth, className, sx, style },
  });
  const { className: inputClass } = useThemedClasses({
    recipe: comboboxInputRecipe,
    componentName: 'Combobox',
    slot: 'input',
    props: { size },
  });
  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: selectContentRecipe,
    componentName: 'Combobox',
    slot: 'content',
    props: { variant: 'solid', size, color },
  });
  const { className: itemClass } = useThemedClasses({
    recipe: selectItemRecipe,
    componentName: 'Combobox',
    slot: 'item',
    props: { size },
  });
  const { className: groupLabelClass } = useThemedClasses({
    recipe: comboboxGroupLabelRecipe,
    componentName: 'Combobox',
    slot: 'groupLabel',
    props: {},
  });
  const { className: emptyClass } = useThemedClasses({
    recipe: comboboxEmptyRecipe,
    componentName: 'Combobox',
    slot: 'empty',
    props: {},
  });
  const { className: loadingClass } = useThemedClasses({
    recipe: comboboxLoadingRecipe,
    componentName: 'Combobox',
    slot: 'loading',
    props: {},
  });
  const { className: errorClass } = useThemedClasses({
    recipe: comboboxErrorRecipe,
    componentName: 'Combobox',
    slot: 'error',
    props: {},
  });
  const { className: createRowClass } = useThemedClasses({
    recipe: comboboxCreateRowRecipe,
    componentName: 'Combobox',
    slot: 'createRow',
    props: {},
  });
  const { className: clearButtonClass } = useThemedClasses({
    recipe: comboboxClearButtonRecipe,
    componentName: 'Combobox',
    slot: 'clearButton',
    props: {},
  });

  // ── single-mode label resolution ───────────────────────────────────────────
  const singleSelectedOption = !isMulti && singleValue
    ? valueLabelCacheRef.current.get(singleValue)
    : undefined;

  // ── render ─────────────────────────────────────────────────────────────────
  const composedInputRef = mergeRefs<HTMLInputElement>(
    forwardedRef as Ref<HTMLInputElement>,
    inputRef as unknown as Ref<HTMLInputElement>,
  );

  const motionPreset = selectMotion(actualPlacement as ComboboxPlacement);
  const hiddenStyle: CSSProperties = open
    ? {}
    : { visibility: 'hidden', pointerEvents: 'none' };

  const showClearButton =
    clearable &&
    !disabled &&
    (isMulti ? multiValue.length > 0 : singleValue !== null && singleValue !== '');

  const handleClear = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (isMulti) {
        setMultiValueInternal([]);
      } else {
        commitSingle(null);
      }
      if (inputValueProp === undefined) setInputValueInternal('');
      inputRef.current?.focus();
    },
    [isMulti, setMultiValueInternal, commitSingle, inputValueProp, setInputValueInternal],
  );

  // Resolve `aria-label`. The input is the focusable, named element — same hook as Input/Textarea.
  // Falls back to placeholder when no consumer-supplied label exists so axe stays clean.
  const resolvedAriaLabel = ariaLabelProp ?? (ariaLabelledbyProp ? undefined : placeholder);

  return (
    <>
      {/* The wrapper isn't a focusable element — keystrokes route through the inner <input>, not
          the shell. The onClick handler exists purely to forward a click on empty padding area
          (between tags, etc.) to the input so the field "feels clickable" everywhere. No
          keyboard handler exists because the input is the keyboard surface — that's exactly the
          tab order we want. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        ref={wrapperRef}
        className={wrapperClass}
        style={wrapperStyle ?? undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={a11y['data-invalid']}
        data-open={open ? 'true' : undefined}
        onClick={handleWrapperClick}
      >
        {/* Multi-mode tag chips. Rendered before the input so they read left-to-right (logical
            start) and the input always sits at the end. Single mode skips this slot entirely. */}
        {isMulti && multiValue.length > 0 ? (
          <>
            {multiValue.map((val) => {
              const opt = valueLabelCacheRef.current.get(val);
              const label = opt?.label ?? val;
              return (
                <Badge
                  key={val}
                  size={resolveBaseSize(size)}
                  variant="soft"
                  color="neutral"
                  removable
                  removeLabel={t.removeTag(label)}
                  onRemove={() => {
                    setMultiValueInternal(multiValue.filter((v) => v !== val));
                    inputRef.current?.focus();
                  }}
                >
                  {label}
                </Badge>
              );
            })}
          </>
        ) : null}

        <input
          ref={composedInputRef}
          {...inputPropsProp}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
          value={inputValue}
          placeholder={
            isMulti
              ? multiValue.length === 0
                ? placeholder
                : undefined
              : singleSelectedOption
                ? undefined
                : placeholder
          }
          disabled={disabled}
          required={required}
          aria-label={resolvedAriaLabel}
          aria-labelledby={ariaLabelledbyProp}
          aria-describedby={a11y['aria-describedby']}
          aria-invalid={a11y['aria-invalid']}
          aria-required={a11y['aria-required']}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open ? highlightedId ?? undefined : undefined}
          aria-haspopup="listbox"
          data-state={open ? 'open' : 'closed'}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleInputKeyDown}
        />

        {showClearButton ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.clearSelection}
            className={clearButtonClass}
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}

        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? t.closeOptions : t.openOptions}
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center text-fg-muted"
          onClick={(e) => {
            e.preventDefault();
            if (disabled) return;
            setOpen(!open);
            inputRef.current?.focus();
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ChevronDown
            aria-hidden="true"
            className={`size-4 transition-transform duration-fast ease-standard ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Hidden form inputs. Single mode emits one; multi mode emits one per selected value so
          form serialization yields `name=a&name=b&name=c`. */}
      {name !== undefined ? (
        isMulti ? (
          multiValue.map((val) => (
            <input
              key={val}
              type="hidden"
              name={name}
              value={val}
              required={required && multiValue.length === 0 ? true : undefined}
              aria-hidden="true"
            />
          ))
        ) : (
          <input
            type="hidden"
            name={name}
            value={singleValue ?? ''}
            required={required || undefined}
            aria-hidden="true"
          />
        )
      ) : null}

      <Portal container={portalContainer}>
        <motion.div
          ref={mergeRefs<HTMLDivElement>(
            floatingRef as unknown as Ref<HTMLDivElement>,
            (node: HTMLDivElement | null) => {
              floatingNodeRef.current = node as HTMLElement | null;
            },
          )}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-multiselectable={isMulti || undefined}
          aria-labelledby={ariaLabelledbyProp}
          aria-label={ariaLabelledbyProp ? undefined : resolvedAriaLabel}
          aria-hidden={open ? undefined : true}
          data-state={open ? 'open' : 'closed'}
          data-placement={actualPlacement}
          className={contentClass}
          style={{
            ...(floatingStyles as CSSProperties),
            ...(contentStyle ?? {}),
            ...hiddenStyle,
          } as never}
          initial={motionPreset.initial}
          animate={open ? motionPreset.animate : motionPreset.initial}
          transition={motionPreset.transition}
        >
          {effectiveLoadingState === 'loading' ? (
            <div className={loadingClass} role="status" aria-live="polite">
              {renderLoading ? renderLoading() : t.loading}
            </div>
          ) : effectiveLoadingState === 'error' ? (
            <div className={errorClass} role="alert">
              {renderError ? renderError(deferred.error ?? new Error('Load failed')) : t.loadingError}
            </div>
          ) : listItems.length === 0 ? (
            <div className={emptyClass}>
              {renderEmpty
                ? renderEmpty(inputValue)
                : inputValue
                  ? t.emptyForQuery(inputValue)
                  : t.empty}
            </div>
          ) : (
            renderListItems({
              listItems,
              groupLabels: filteredOptions.groupLabels,
              itemClass,
              groupLabelClass,
              createRowClass,
              highlightedId,
              isSelected,
              isMulti,
              query: inputValue,
              renderOption,
              renderCreateOption,
              t,
              onItemClick: handleSelectId,
              onItemHover: (id) => setHighlightedId(id),
            })
          )}
        </motion.div>
      </Portal>
    </>
  );
}

/**
 * Pure renderer for the listbox body. Walks `listItems` in order, prepending group-label rows
 * whenever the group changes, and slotting the "create" pseudo-item at the tail. Extracted into
 * a helper so the main component body stays under the 600-line ceiling.
 */
interface RenderListItemsArgs<O extends ComboboxOption> {
  listItems: ComboboxListItem<O>[];
  groupLabels: (ReactNode | undefined)[];
  itemClass: string;
  groupLabelClass: string;
  createRowClass: string;
  highlightedId: string | null;
  isSelected: (value: string) => boolean;
  isMulti: boolean;
  query: string;
  renderOption: ((ctx: {
    option: O;
    isActive: boolean;
    isSelected: boolean;
    query: string;
  }) => ReactNode) | undefined;
  renderCreateOption: ((label: string) => ReactNode) | undefined;
  t: { createOption: (label: string) => string };
  onItemClick: (id: string) => void;
  onItemHover: (id: string) => void;
}

function renderListItems<O extends ComboboxOption>(args: RenderListItemsArgs<O>): ReactNode {
  const {
    listItems,
    groupLabels,
    itemClass,
    groupLabelClass,
    createRowClass,
    highlightedId,
    isSelected,
    isMulti,
    query,
    renderOption,
    renderCreateOption,
    t,
    onItemClick,
    onItemHover,
  } = args;
  const out: ReactNode[] = [];
  let lastGroup: ReactNode = undefined;
  let optionIndex = 0;
  for (const item of listItems) {
    if (item.kind === 'option') {
      const groupForThis = groupLabels[optionIndex];
      if (groupForThis !== lastGroup && groupForThis !== undefined) {
        out.push(
          <div
            key={`group-${optionIndex}`}
            role="presentation"
            className={groupLabelClass}
          >
            {groupForThis}
          </div>,
        );
        lastGroup = groupForThis;
      }
      const selected = isSelected(item.value);
      const highlighted = highlightedId === item.id;
      out.push(
        // Keyboard handling for items lives on the `<input>`'s onKeyDown via the shared
        // `useListKeyboard` hook (Enter / Space → onSelect(id), which dispatches selection). The
        // hook drives the active-descendant + selection without items being tab-focusable; that
        // matches the W3C Combobox + Listbox pattern (focus stays on the combobox, items are
        // active-descendant-tracked). The lint can't see across that indirection, so we disable
        // the rule that mistakenly demands local keyboard handlers.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
        <div
          key={item.id}
          id={item.id}
          role="option"
          tabIndex={-1}
          aria-selected={selected}
          aria-disabled={item.disabled || undefined}
          data-highlighted={highlighted ? 'true' : undefined}
          data-selected={selected ? 'true' : undefined}
          data-disabled={item.disabled ? 'true' : undefined}
          data-value={item.value}
          className={itemClass}
          onMouseDown={(e) => e.preventDefault()}
          onPointerMove={() => {
            if (!item.disabled) onItemHover(item.id);
          }}
          onClick={() => {
            if (!item.disabled) onItemClick(item.id);
          }}
        >
          {renderOption ? (
            renderOption({ option: item.option, isActive: highlighted, isSelected: selected, query })
          ) : (
            <span className="flex-1 truncate">{item.option.label}</span>
          )}
          {selected && !renderOption ? (
            <span aria-hidden="true" className="absolute end-2 inline-flex size-4 items-center justify-center">
              <Check className="size-4" />
            </span>
          ) : null}
          {isMulti && !selected && !renderOption ? null : null}
        </div>,
      );
      optionIndex++;
    } else {
      const highlighted = highlightedId === item.id;
      out.push(
        // Same a11y rationale as the option row above — keyboard handling routes through the
        // shared list keyboard hook on the input.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
        <div
          key={item.id}
          id={item.id}
          role="option"
          tabIndex={-1}
          aria-selected={false}
          data-highlighted={highlighted ? 'true' : undefined}
          className={createRowClass}
          onMouseDown={(e) => e.preventDefault()}
          onPointerMove={() => onItemHover(item.id)}
          onClick={() => onItemClick(item.id)}
        >
          {renderCreateOption ? renderCreateOption(item.label) : `+ ${t.createOption(item.label)}`}
        </div>,
      );
    }
  }
  return out;
}

/** Resolves a responsive `size` to its primitive value. Same helper Input / Badge use. */
function resolveBaseSize<T extends 'sm' | 'md' | 'lg'>(value: unknown): T {
  if (value === undefined || value === null) return 'md' as T;
  if (typeof value === 'string') return value as T;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, T>>;
    return (obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md') as T;
  }
  return 'md' as T;
}

/**
 * Tiny CSS-escape shim. Same pattern Input uses for `useLabelWarning` — modern browsers expose
 * `CSS.escape`; jsdom may not. The query is a React `useId` output, so the fallback only needs
 * to handle `:` (the common useId character that breaks bare selectors).
 */
function cssEscape(value: string): string {
  type Globals = { CSS?: { escape?: (v: string) => string } };
  const g = globalThis as unknown as Globals;
  if (g.CSS?.escape) return g.CSS.escape(value);
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

// ── public exports ───────────────────────────────────────────────────────────

const ComboboxImpl = forwardRef(ComboboxImplInner) as unknown as <O extends ComboboxOption>(
  props: ComboboxImplProps<O> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReactElement;

/**
 * Single-select combobox. `value` is `string | null`; selecting commits the new value and (by
 * default) closes the listbox.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps<ComboboxOption>>(
  function Combobox(props, ref) {
    return (
      <ComboboxImpl
        ref={ref}
        {...(props as ComboboxProps<ComboboxOption>)}
        mode="single"
      />
    );
  },
);
Combobox.displayName = 'Combobox';

/**
 * Multi-select combobox. `value` is `string[]`; selecting toggles values in/out. Renders
 * selected items as removable `<Badge>` chips before the input.
 */
export const MultiCombobox = forwardRef<HTMLInputElement, MultiComboboxProps<ComboboxOption>>(
  function MultiCombobox(props, ref) {
    return (
      <ComboboxImpl
        ref={ref}
        {...(props as MultiComboboxProps<ComboboxOption>)}
        mode="multiple"
      />
    );
  },
);
MultiCombobox.displayName = 'MultiCombobox';