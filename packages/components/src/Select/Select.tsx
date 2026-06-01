'use client';

import {
  useControllableState,
  useEscapeStack,
  useOutsideClick,
} from '@apx-ui/engine';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type RefCallback,
} from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';

import { SelectContext } from './SelectContext';
import type {
  SelectContextValue,
  SelectItemRecord,
  SelectItemRegistration,
  SelectProps,
} from './Select.types';

/**
 * `<Select>` is the compound root and the single owner of:
 *
 *  - **Value state** — controllable string, defaulting to `''`. The shape matches `<select>`
 *    (single string value); multi-select is a separate component.
 *  - **Open state** — controllable boolean, defaulting to `false`. Same `useControllableState`
 *    discipline as Menu / Popover.
 *  - **Item registry** — every `<Select.Item>` registers its DOM node + value + label + textValue
 *    + disabled flag. The Trigger reads the registry to render the label for the selected value;
 *    the Content's keyboard hook reads it for arrow nav + type-ahead.
 *  - **Highlight state** — `highlightedId` for `aria-activedescendant` on the listbox. Same
 *    "highlight, don't focus" discipline Menu uses.
 *  - **Trigger / content refs** — captured for outside-click + Floating UI anchoring.
 *  - **Escape / outside-click** — `useEscapeStack` + `useOutsideClick` from the engine, both
 *    gated on `open` so closed selects pay zero listener cost.
 *  - **Form-control a11y** — `useFormFieldA11y` resolves the id + ARIA bridge once; Trigger
 *    spreads the result. Forms see the hidden `<input>` we render here.
 *
 * Why a hidden `<input type="hidden">` rather than a real `<select>`? Because Select renders an
 * arbitrary listbox surface (theming, motion, icons, groups) — a real `<select>` can't reproduce
 * any of that and would compete with our portal. The hidden input gives `<form>` submissions the
 * value without owning the visual chrome.
 *
 * Why visual axes (variant/size/color/fullWidth) live on the root rather than Trigger: the
 * consumer almost never wants Trigger styling to disagree with Content sizing, and the form-control
 * family established the "one root, one style" contract in Phase 7. Trigger reads the axes via
 * context; Content reads its own `variant` / `placement` / `offset` from its own props (those ARE
 * surface-level decisions and consumers may want them themed independently).
 */
export function Select(props: SelectProps): ReactElement {
  const {
    name,
    value: valueProp,
    defaultValue,
    onValueChange,
    required = false,
    invalid,
    disabled = false,
    variant,
    size,
    color,
    fullWidth,
    placeholder,
    open: openProp,
    defaultOpen,
    onOpenChange,
    id,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    children,
  } = props;

  const [valueRaw, setValueInternal] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange ?? undefined,
  });
  const value = valueRaw ?? '';

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      // Disabled selects ignore programmatic open requests too — matches `<button disabled>`.
      if (disabled && next) return;
      setOpenInternal(next);
    },
    [setOpenInternal, disabled],
  );

  const a11y = useFormFieldA11y({
    id,
    invalid,
    required,
  });

  // Trigger DOM node — callback ref so the value is live (no re-render on attach). Outside-click
  // + Floating UI's `setReference` both consume this via the SelectContext.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const triggerRef = useCallback<RefCallback<HTMLElement | null>>((node) => {
    triggerNodeRef.current = node;
  }, []);

  // Floating (listbox) node — captured for `useOutsideClick`.
  const floatingNodeRef = useRef<HTMLElement | null>(null);
  const registerContent = useCallback((node: HTMLElement | null) => {
    floatingNodeRef.current = node;
  }, []);

  // Item registry — `Map<id, SelectItemRecord>` walked in DOM order. Insertion order is the
  // registration order, which for items rendered top-to-bottom in JSX *is* DOM order. We re-sort
  // with `compareDocumentPosition` as a safety net for dynamically reordered lists.
  const itemsRef = useRef<Map<string, SelectItemRecord>>(new Map());
  // Persistent value→label cache. The item registry above tracks DOM nodes for keyboard nav and
  // type-ahead; those records disappear the moment the listbox closes (items live inside a
  // portaled Content that AnimatePresence unmounts on exit). The Trigger, however, has to keep
  // rendering the selected item's label across the close — otherwise the trigger would flip
  // from "France" back to the raw `"fr"` value the moment the user picks it. So we keep a
  // separate cache that survives unmounts and is only ever updated, never cleared.
  const valueLabelCacheRef = useRef<Map<string, SelectItemRegistration['label']>>(new Map());
  // We bump this counter on every register / unregister so consumers reading the registry via
  // context can re-render when items appear or disappear (matters for the Trigger's label
  // rendering when the selected item mounts later than the Trigger, and for cache updates).
  const [itemsVersion, setItemsVersion] = useState(0);
  const bumpItemsVersion = useCallback(() => {
    setItemsVersion((v) => v + 1);
  }, []);

  const registerItem = useCallback(
    (
      itemId: string,
      node: HTMLElement | null,
      opts: SelectItemRegistration,
      itemValue: string,
    ) => {
      const map = itemsRef.current;
      if (node === null) {
        if (map.delete(itemId)) bumpItemsVersion();
        return;
      }
      map.set(itemId, {
        id: itemId,
        value: itemValue,
        node,
        textValue: opts.textValue,
        label: opts.label,
        disabled: opts.disabled,
      });
      // Update the persistent label cache. We re-write on every register so a re-render that
      // changes the rendered label (e.g. localized strings flipping) is reflected the next time
      // the trigger reads the cache.
      valueLabelCacheRef.current.set(itemValue, opts.label);
      bumpItemsVersion();
    },
    [bumpItemsVersion],
  );

  // Cache reader for the Trigger — preferred to walking the live registry because the registry
  // empties when the Content unmounts.
  const getLabelForValue = useCallback(
    (val: string): SelectItemRegistration['label'] | undefined => {
      return valueLabelCacheRef.current.get(val);
    },
    [],
  );

  // Sorted accessor. `getAllItems` returns every registration (incl. disabled — needed by the
  // Trigger to render labels for disabled-but-preselected values). `getEnabledItems` is the
  // navigation-and-type-ahead view fed to the shared keyboard hook.
  const getAllItems = useCallback((): SelectItemRecord[] => {
    const list: SelectItemRecord[] = [];
    for (const rec of itemsRef.current.values()) list.push(rec);
    try {
      list.sort((a, b) => {
        const pos = a.node.compareDocumentPosition(b.node);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
    } catch {
      // ignore; insertion order remains.
    }
    return list;
    // We depend on itemsVersion so the memoized identity flips when the registry changes — this
    // is what causes the Trigger to re-render with the resolved label.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsVersion]);

  const getEnabledItems = useCallback((): SelectItemRecord[] => {
    return getAllItems().filter((it) => !it.disabled);
  }, [getAllItems]);

  // Highlight: `aria-activedescendant` target. The shared keyboard hook drives it; items render
  // `data-highlighted="true"` when their id matches.
  const [highlightedId, setHighlightedIdState] = useState<string | null>(null);
  const setHighlightedId = useCallback((id: string | null) => {
    setHighlightedIdState(id);
  }, []);

  // When the listbox opens, seed the highlight to the currently-selected item (or the first
  // enabled item if nothing is selected). Mirrors native `<select>` behavior: ArrowDown from a
  // closed select with a selection lands on that selection.
  useEffect(() => {
    if (!open) {
      setHighlightedIdState(null);
      return;
    }
    // Defer one tick so items registered during the same mount cycle are in the registry.
    const handle = setTimeout(() => {
      const all = getAllItems();
      if (all.length === 0) return;
      const selected = value ? all.find((it) => it.value === value && !it.disabled) : undefined;
      const firstEnabled = all.find((it) => !it.disabled);
      const next = selected ?? firstEnabled;
      if (next) setHighlightedIdState(next.id);
    }, 0);
    return () => clearTimeout(handle);
  }, [open, value, getAllItems]);

  // Esc closes — escape-stack ordering means nested overlays (a Tooltip inside an item, for
  // example) get the press first.
  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape });

  // Outside-click. Trigger + content are both "inside" — pointer-down on either is an in-Select
  // interaction. Hook is paused entirely when closed.
  useOutsideClick({
    active: open && closeOnOutsideClick,
    refs: [triggerNodeRef, floatingNodeRef],
    onOutside: () => setOpen(false),
  });

  // Pairing ids for `aria-controls` / `aria-labelledby`. `useId` keeps SSR-safe. The trigger id
  // comes from useFormFieldA11y (consumer-provided or generated) so external `<label htmlFor>` and
  // form integrations stay coherent.
  const contentId = useId();
  const triggerId = a11y.id;

  // `setValue` commits the new value + closes the listbox. We intentionally do NOT short-circuit
  // when `next === value` — a same-value select is still a user intent to dismiss, and the
  // `onValueChange` callback should NOT fire (useControllableState handles that internally by
  // skipping equal updates).
  const setValue = useCallback(
    (next: string) => {
      setValueInternal(next);
      setOpenInternal(false);
    },
    [setValueInternal, setOpenInternal],
  );

  const ctxValue = useMemo<SelectContextValue>(
    () => ({
      value,
      setValue,
      open,
      setOpen,
      triggerRef,
      triggerNodeRef,
      floatingNodeRef,
      registerContent,
      registerItem,
      getEnabledItems,
      getAllItems,
      getLabelForValue,
      highlightedId,
      setHighlightedId,
      triggerId,
      contentId,
      variant,
      size,
      color,
      fullWidth,
      a11y,
      placeholder,
      name,
      disabled,
      required,
      itemsVersion,
    }),
    [
      value,
      setValue,
      open,
      setOpen,
      triggerRef,
      registerContent,
      registerItem,
      getEnabledItems,
      getAllItems,
      getLabelForValue,
      highlightedId,
      setHighlightedId,
      triggerId,
      contentId,
      variant,
      size,
      color,
      fullWidth,
      a11y,
      placeholder,
      name,
      disabled,
      required,
      itemsVersion,
    ],
  );

  return (
    <SelectContext.Provider value={ctxValue}>
      {children}
      {name !== undefined ? (
        // Hidden input participates in `<form>` submission. `required` here is intentional —
        // when the consumer marks Select required and submits an empty value, native form
        // validation flags the form (the trigger displays the matching invalid state via
        // useFormFieldA11y's aria-invalid bridge).
        <input
          type="hidden"
          name={name}
          value={value}
          required={required || undefined}
          aria-hidden="true"
        />
      ) : null}
    </SelectContext.Provider>
  );
}

Select.displayName = 'Select';