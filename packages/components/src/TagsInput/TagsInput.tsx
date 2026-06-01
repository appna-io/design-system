'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { forwardRef, useControllableState, useDirection, useI18n } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { Badge } from '../Badge/Badge';
import { filterStrategies } from '../Combobox/headless/filterStrategies';
import { useDeferredFilter } from '../Combobox/headless/useDeferredFilter';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';

import { normalizeTag } from './normalizeTag';
import { containsSeparator, splitTokens } from './splitTokens';
import { tagsInputRecipes } from './TagsInput.recipe';
import type {
  TagsInputChangeMeta,
  TagsInputProps,
  TagsInputSize,
  TagsInputTagSize,
  TagsInputTranslations,
  TagsInputVariant,
} from './TagsInput.types';

import type { BadgeColor, BadgeSize, BadgeVariant } from '../Badge/Badge.types';

const DEFAULT_SPLIT: ReadonlyArray<string> = [' ', ','];

export const DEFAULT_TAGS_INPUT_TRANSLATIONS: TagsInputTranslations = {
  removeTag: (tag) => `Remove ${tag}`,
  placeholder: 'Add a tag…',
  placeholderMax: (max) => `Maximum ${max} tags reached`,
  count: (count, max) => (max != null ? `${count} / ${max}` : String(count)),
  invalidTag: (tag, error) => `${tag}: ${error}`,
  suggestionsLabel: 'Suggestions',
  noSuggestions: 'No matches',
  loading: 'Loading…',
  addedAnnouncement: (tag) => `Added tag ${tag}`,
  removedAnnouncement: (tag) => `Removed tag ${tag}`,
  duplicateAnnouncement: (tag) => `${tag} is already added`,
  maxReachedAnnouncement: (max) => `Maximum ${max} tags reached`,
};

/**
 * Multi-value text input that produces a `string[]` from typed input, paste, and optional
 * suggestions. Companion to `<MultiCombobox>` from Phase 34 — both render badge chips inside a
 * form-control shell, but TagsInput is **free-form** (any typed token becomes a tag) where
 * MultiCombobox is **constrained** (value must match an option unless `creatable`).
 *
 * Architecture leans on shipped primitives:
 *
 * - `Badge` (with `removable` + `onRemove`) for default tag chips. `renderTag` replaces.
 * - `_shared/useFormFieldA11y` for label / description / helper / error wiring (fifth consumer
 *   after Input / Textarea / Select / Combobox).
 * - `Combobox/headless/filterStrategies.substring` for static suggestion filtering.
 * - `Combobox/headless/useDeferredFilter` for the debounced + abortable async path.
 * - `useControllableState` from engine. Hidden `<input type="hidden">` per committed tag for
 *   native form submission.
 *
 * Keyboard model (W3C tags-input convention):
 *
 *   Enter            → commit pending input (when `commitOnEnter`).
 *   Any separator    → commit pending input.
 *   Backspace at empty input → remove last tag.
 *   ArrowLeft at start      → activate "tag cursor" on the last tag.
 *   ArrowLeft / ArrowRight  → move cursor left / right between tags.
 *   ArrowRight at last tag  → return focus to the input.
 *   Delete / Backspace (cursor active) → remove the selected tag.
 *   Escape                  → close suggestions; deselect cursor.
 *   ArrowDown / ArrowUp (suggestions open) → move highlight.
 *   Enter / Tab (suggestion highlighted)   → commit highlighted suggestion.
 *
 * Suggestion listbox renders **inline** below the field — no Portal / overlay collision with the
 * lanes currently in flight. The plan calls inline the default; `<Popover>` portalling is a
 * V2 option once the overlay primitives settle.
 */
export const TagsInput = forwardRef<HTMLDivElement, TagsInputProps>(function TagsInput(
  props,
  ref,
) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    suggestions,
    loadSuggestions,
    debounceMs = 250,
    minQueryLength = 0,
    filterSuggestions,
    getSuggestionValue,
    getSuggestionKey,
    renderSuggestion,
    splitOn = DEFAULT_SPLIT,
    commitOnEnter = true,
    commitOnBlur = false,
    trim = true,
    toLowerCase = false,
    allowDuplicates = false,
    maxTags,
    validate,
    errorMessage = 'Invalid tag',
    renderTag,
    showCount = false,
    emptyHint,
    label,
    description,
    helperText,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    placeholder,
    variant,
    size,
    tagSize = 'sm',
    tagColor = 'neutral',
    tagVariant = 'soft',
    translations,
    className,
    style,
    sx,
    id: idProp,
    onKeyDown: onKeyDownProp,
    onBlur: onBlurProp,
    onPaste: onPasteProp,
    ...rest
  } = props;

  // Three-layer translation precedence (Phase 58 RFC #2): props.translations >
  // <I18nProvider messages={{ TagsInput: ... }}> > built-in English defaults.
  const i18n = useI18n();
  const providerTranslations = i18n?.get<Partial<TagsInputTranslations>>('TagsInput');
  const t = useMemo<TagsInputTranslations>(
    () => ({
      ...DEFAULT_TAGS_INPUT_TRANSLATIONS,
      ...providerTranslations,
      ...translations,
    }),
    [providerTranslations, translations],
  );

  const [tagsState, setTagsState] = useControllableState<ReadonlyArray<string>>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: undefined,
  });
  // Memoise so the `tags` reference is stable across renders when the underlying value didn't
  // change — otherwise downstream useCallback/useMemo dependencies would invalidate on every
  // parent render even when nothing observable shifted.
  const tags = useMemo<ReadonlyArray<string>>(() => tagsState ?? [], [tagsState]);

  const [inputValue, setInputValue] = useState('');
  // `null` = input has focus; a number = "tag cursor" selecting that tag index.
  const [tagCursor, setTagCursor] = useState<number | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [perTagErrors, setPerTagErrors] = useState<Record<string, string>>({});

  const dir = useDirection();
  const isRtl = dir === 'rtl';

  const invalid = error != null && error !== false && error !== '';
  const formField = useFormFieldA11y({ id: idProp, invalid, required });

  const labelId = label != null ? `${formField.id}-label` : undefined;
  const descriptionId = description != null ? `${formField.id}-desc` : undefined;
  const helperId = helperText != null && !invalid ? `${formField.id}-helper` : undefined;
  const errorId = invalid ? `${formField.id}-error` : undefined;
  const listboxId = `${formField.id}-listbox`;
  const liveRegionId = `${formField.id}-live`;

  const resolvedSize: TagsInputSize = resolveResponsive(size, 'md');
  const resolvedVariant: TagsInputVariant = resolveResponsive(variant, 'outline');

  const maxReached = maxTags != null && tags.length >= maxTags;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  // Helpers -------------------------------------------------------------------------------------

  const fire = useCallback(
    (next: ReadonlyArray<string>, meta: TagsInputChangeMeta) => {
      setTagsState(next);
      onChange?.(next, meta);
    },
    [setTagsState, onChange],
  );

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  // Auto-clear the live region 750ms after the latest announcement so the next identical
  // message re-fires. Done inside an effect (not a `setTimeout` from the handler) so the state
  // update is always tied to React's commit scheduler — keeps test runners + concurrent mode
  // happy.
  useEffect(() => {
    if (!announcement) return;
    const id = setTimeout(() => setAnnouncement(''), 750);
    return () => clearTimeout(id);
  }, [announcement]);

  const recordPerTagError = useCallback((tag: string, message: string | undefined) => {
    setPerTagErrors((prev) => {
      const next = { ...prev };
      if (message) next[tag] = message;
      else delete next[tag];
      return next;
    });
  }, []);

  /** Commit a list of raw token candidates. Returns the array of successfully added tags. */
  const commitTokens = useCallback(
    (
      raw: string[],
      source: TagsInputChangeMeta['source'],
    ): { added: string[]; nextValue: ReadonlyArray<string> } => {
      if (disabled || readOnly) return { added: [], nextValue: tags };
      const working = [...tags];
      const added: string[] = [];

      for (const candidate of raw) {
        if (maxTags != null && working.length >= maxTags) {
          announce(t.maxReachedAnnouncement(maxTags));
          fire(working, { action: 'reject-max', tag: candidate });
          break;
        }
        const normalized = normalizeTag(candidate, {
          trim,
          toLowerCase,
          validate,
          defaultErrorMessage: errorMessage,
        });
        if (normalized.value === '') continue;

        if (!allowDuplicates && working.includes(normalized.value)) {
          announce(t.duplicateAnnouncement(normalized.value));
          fire(working, {
            action: 'reject-duplicate',
            tag: normalized.value,
            source,
          });
          continue;
        }

        working.push(normalized.value);
        added.push(normalized.value);

        if (!normalized.isValid) {
          recordPerTagError(normalized.value, normalized.error);
          announce(t.invalidTag(normalized.value, normalized.error ?? errorMessage));
          fire(working, {
            action: 'reject-invalid',
            tag: normalized.value,
            source,
            error: normalized.error,
          });
        } else {
          recordPerTagError(normalized.value, undefined);
          announce(t.addedAnnouncement(normalized.value));
          fire(working, { action: 'add', tag: normalized.value, source });
        }
      }

      return { added, nextValue: working };
    },
    [
      disabled,
      readOnly,
      tags,
      maxTags,
      trim,
      toLowerCase,
      validate,
      errorMessage,
      allowDuplicates,
      fire,
      announce,
      recordPerTagError,
      t,
    ],
  );

  const commitPending = useCallback(
    (source: TagsInputChangeMeta['source'] = 'enter'): boolean => {
      const trimmed = inputValue;
      if (trimmed.length === 0) return false;
      const result = commitTokens([trimmed], source);
      setInputValue('');
      setActiveSuggestion(0);
      return result.added.length > 0;
    },
    [inputValue, commitTokens],
  );

  const removeTagAt = useCallback(
    (index: number, source: TagsInputChangeMeta['source']) => {
      if (disabled || readOnly) return;
      if (index < 0 || index >= tags.length) return;
      const removed = tags[index]!;
      const next = tags.filter((_, i) => i !== index);
      recordPerTagError(removed, undefined);
      announce(t.removedAnnouncement(removed));
      fire(next, { action: 'remove', tag: removed, source });
    },
    [disabled, readOnly, tags, recordPerTagError, announce, fire, t],
  );

  // Suggestion filtering ------------------------------------------------------------------------

  const trimmedQuery = inputValue.trim();
  const queryActive = trimmedQuery.length >= minQueryLength;
  const hasStaticSuggestions = suggestions != null && suggestions.length > 0;
  const hasAsyncSuggestions = loadSuggestions != null;
  const suggestionsEnabled =
    !disabled && !readOnly && !maxReached && queryActive && (hasStaticSuggestions || hasAsyncSuggestions);

  const async = useDeferredFilter({
    loadOptions: hasAsyncSuggestions ? loadSuggestions : undefined,
    query: trimmedQuery,
    debounceMs,
    enabled: suggestionsEnabled,
  });

  const staticFiltered = useMemo(() => {
    if (!hasStaticSuggestions || !suggestions) return [];
    if (filterSuggestions) return filterSuggestions(suggestions, trimmedQuery);
    if (trimmedQuery.length === 0) return [...suggestions];
    return suggestions.filter((item) =>
      filterStrategies.substring(
        getSuggestionValue ? getSuggestionValue(item) : String(item),
        trimmedQuery,
      ),
    );
  }, [hasStaticSuggestions, suggestions, filterSuggestions, trimmedQuery, getSuggestionValue]);

  const displayedSuggestions = useMemo<unknown[]>(() => {
    if (!suggestionsEnabled) return [];
    if (hasAsyncSuggestions) return async.results as unknown[];
    return staticFiltered as unknown[];
  }, [suggestionsEnabled, hasAsyncSuggestions, async.results, staticFiltered]);

  // De-duplicate suggestions that are already in `tags` (when not allowing duplicates).
  const visibleSuggestions = useMemo(() => {
    if (allowDuplicates) return displayedSuggestions;
    return displayedSuggestions.filter((item) => {
      const v = getSuggestionValue
        ? getSuggestionValue(item as never)
        : String(item);
      return !tags.includes(v);
    });
  }, [allowDuplicates, displayedSuggestions, getSuggestionValue, tags]);

  // Reset active index when the visible list shrinks.
  useEffect(() => {
    if (activeSuggestion >= visibleSuggestions.length) setActiveSuggestion(0);
  }, [visibleSuggestions.length, activeSuggestion]);

  // Open the listbox whenever there's something to show.
  useEffect(() => {
    if (!suggestionsEnabled) {
      setSuggestionsOpen(false);
      return;
    }
    setSuggestionsOpen(visibleSuggestions.length > 0 || async.state === 'loading');
  }, [suggestionsEnabled, visibleSuggestions.length, async.state]);

  const commitSuggestionAt = useCallback(
    (index: number) => {
      const item = visibleSuggestions[index];
      if (item === undefined) return false;
      const value = getSuggestionValue
        ? getSuggestionValue(item as never)
        : String(item);
      const result = commitTokens([value], 'suggestion');
      setInputValue('');
      setActiveSuggestion(0);
      return result.added.length > 0;
    },
    [visibleSuggestions, getSuggestionValue, commitTokens],
  );

  // Keyboard ------------------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (disabled || readOnly) return;

      const atStart =
        (event.currentTarget.selectionStart ?? 0) === 0 &&
        (event.currentTarget.selectionEnd ?? 0) === 0;

      const leftKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
      const rightKey = isRtl ? 'ArrowLeft' : 'ArrowRight';

      // Suggestions navigation wins when the listbox is open.
      if (suggestionsOpen && visibleSuggestions.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveSuggestion((i) => (i + 1) % visibleSuggestions.length);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveSuggestion(
            (i) => (i - 1 + visibleSuggestions.length) % visibleSuggestions.length,
          );
          return;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          if (commitSuggestionAt(activeSuggestion)) {
            event.preventDefault();
            return;
          }
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setSuggestionsOpen(false);
          return;
        }
      }

      if (event.key === 'Enter') {
        if (commitOnEnter && inputValue.length > 0) {
          event.preventDefault();
          commitPending('enter');
          return;
        }
      }

      if (event.key === 'Backspace' && inputValue.length === 0 && tags.length > 0) {
        event.preventDefault();
        if (tagCursor != null) {
          removeTagAt(tagCursor, 'cursor-delete');
          setTagCursor((idx) => (idx != null && idx > 0 ? idx - 1 : null));
        } else {
          removeTagAt(tags.length - 1, 'backspace');
        }
        return;
      }

      if (event.key === 'Delete' && tagCursor != null) {
        event.preventDefault();
        removeTagAt(tagCursor, 'cursor-delete');
        setTagCursor((idx) => {
          if (idx == null) return null;
          if (idx >= tags.length - 1) return null;
          return idx;
        });
        return;
      }

      if (event.key === leftKey && atStart && tags.length > 0) {
        event.preventDefault();
        setTagCursor((idx) => (idx == null ? tags.length - 1 : Math.max(0, idx - 1)));
        return;
      }

      if (event.key === rightKey && tagCursor != null) {
        event.preventDefault();
        setTagCursor((idx) => {
          if (idx == null) return null;
          if (idx >= tags.length - 1) return null;
          return idx + 1;
        });
        return;
      }

      if (event.key === 'Escape') {
        if (tagCursor != null) {
          event.preventDefault();
          setTagCursor(null);
        }
      }
    },
    [
      onKeyDownProp,
      disabled,
      readOnly,
      isRtl,
      suggestionsOpen,
      visibleSuggestions.length,
      commitSuggestionAt,
      activeSuggestion,
      commitOnEnter,
      inputValue,
      commitPending,
      tags.length,
      tagCursor,
      removeTagAt,
    ],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      // Separator-driven commit: detect when the latest keystroke completed a separator.
      if (next.length > 0 && containsSeparator(next, splitOn)) {
        const tokens = splitTokens(next, splitOn);
        if (tokens.length === 0) {
          setInputValue('');
          return;
        }
        // Hold back the trailing token if the input doesn't end in a separator — the user is
        // still typing it. Otherwise commit everything.
        const endsWithSep = containsSeparator(next.slice(-1), splitOn);
        const toCommit = endsWithSep ? tokens : tokens.slice(0, -1);
        const trailing = endsWithSep ? '' : tokens[tokens.length - 1] ?? '';
        if (toCommit.length > 0) {
          commitTokens(toCommit, 'separator');
        }
        setInputValue(trailing);
        setTagCursor(null);
        return;
      }
      setInputValue(next);
      setTagCursor(null);
    },
    [splitOn, commitTokens],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;
      if (disabled || readOnly) return;
      const pasted = event.clipboardData.getData('text');
      if (!containsSeparator(pasted, splitOn)) return;
      event.preventDefault();
      const tokens = splitTokens(pasted, splitOn);
      if (tokens.length === 0) return;
      commitTokens(tokens, 'paste');
      setInputValue('');
      setTagCursor(null);
    },
    [onPasteProp, disabled, readOnly, splitOn, commitTokens],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      // Only close suggestions if focus moves entirely outside the field (not e.g. to a
      // suggestion row click — relatedTarget will still be inside).
      const next = event.relatedTarget as Node | null;
      if (!next || !fieldRef.current?.contains(next)) {
        setSuggestionsOpen(false);
        setTagCursor(null);
        if (commitOnBlur && inputValue.length > 0) {
          commitPending('blur');
        }
      }
    },
    [onBlurProp, commitOnBlur, inputValue.length, commitPending],
  );

  const handleFieldMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Clicks on the field (but not on a tag/remove-button or the input itself) focus the input.
      if (event.target === fieldRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    },
    [],
  );

  // Themed classes ------------------------------------------------------------------------------

  const { className: wrapperClass, style: wrapperStyle } = useThemedClasses({
    recipe: tagsInputRecipes.wrapper,
    componentName: 'TagsInput',
    slot: 'wrapper',
    props: { className, sx, style },
  });
  const { className: labelClass } = useThemedClasses({
    recipe: tagsInputRecipes.label,
    componentName: 'TagsInput',
    slot: 'label',
    props: { disabled },
  });
  const { className: descriptionClass } = useThemedClasses({
    recipe: tagsInputRecipes.description,
    componentName: 'TagsInput',
    slot: 'description',
    props: {},
  });
  const { className: fieldClass } = useThemedClasses({
    recipe: tagsInputRecipes.field,
    componentName: 'TagsInput',
    slot: 'field',
    props: { variant: resolvedVariant, size: resolvedSize, invalid, disabled },
  });
  const { className: inputClass } = useThemedClasses({
    recipe: tagsInputRecipes.input,
    componentName: 'TagsInput',
    slot: 'input',
    props: {},
  });
  const { className: countClass } = useThemedClasses({
    recipe: tagsInputRecipes.count,
    componentName: 'TagsInput',
    slot: 'count',
    props: {},
  });
  const { className: emptyHintClass } = useThemedClasses({
    recipe: tagsInputRecipes.emptyHint,
    componentName: 'TagsInput',
    slot: 'emptyHint',
    props: {},
  });
  const { className: listboxClass } = useThemedClasses({
    recipe: tagsInputRecipes.listbox,
    componentName: 'TagsInput',
    slot: 'listbox',
    props: {},
  });
  const { className: emptyClass } = useThemedClasses({
    recipe: tagsInputRecipes.empty,
    componentName: 'TagsInput',
    slot: 'empty',
    props: {},
  });
  const { className: helperClass } = useThemedClasses({
    recipe: tagsInputRecipes.helperText,
    componentName: 'TagsInput',
    slot: 'helperText',
    props: { invalid },
  });

  const describedByIds =
    [descriptionId, helperId, errorId].filter((s): s is string => Boolean(s)).join(' ') ||
    undefined;

  const resolvedPlaceholder = maxReached
    ? maxTags != null
      ? t.placeholderMax(maxTags)
      : ''
    : placeholder ?? t.placeholder;

  const activeDescendantId = suggestionsOpen
    ? `${listboxId}-item-${activeSuggestion}`
    : undefined;

  const badgeTagSize = mapTagSize(tagSize);

  // Render --------------------------------------------------------------------------------------

  return (
    <div ref={ref} className={wrapperClass} style={wrapperStyle} data-disabled={disabled || undefined}>
      {label != null ? (
        <label htmlFor={formField.id} id={labelId} className={labelClass}>
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-0.5 text-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {description != null ? (
        <span id={descriptionId} className={descriptionClass}>
          {description}
        </span>
      ) : null}

      {/* The field is a plain visual container — the label association rides on the inner
          `<input>` via `htmlFor={formField.id}`. Adding `role="group"` here would force an
          `aria-label`/`aria-labelledby` even in the no-label case, and a click handler on a
          group-role element trips axe rules. */}
      <div
        ref={fieldRef}
        // `role="presentation"` is intentional: the div is a visual chrome wrapper for the
        // inner `<input role="combobox">`. The mouseDown handler exists purely to forward
        // clicks on the padding/border area to the input — there's no semantic interactivity
        // here for AT, so `presentation` is the honest role.
        role="presentation"
        className={fieldClass}
        data-invalid={formField['data-invalid']}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        onMouseDown={handleFieldMouseDown}
      >
        {tags.map((tag, index) => {
          const tagInvalid = perTagErrors[tag] !== undefined;
          const selected = tagCursor === index;
          const removeProps = {
            type: 'button' as const,
            onClick: () => removeTagAt(index, 'remove-button'),
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                removeTagAt(index, 'remove-button');
              }
            },
            'aria-label': t.removeTag(tag),
            tabIndex: -1 as const,
          };
          if (renderTag) {
            return (
              <span
                key={`${tag}-${index}`}
                data-tag={tag}
                data-tag-invalid={tagInvalid || undefined}
                data-tag-selected={selected || undefined}
              >
                {renderTag(tag, {
                  index,
                  invalid: tagInvalid,
                  selected,
                  removeProps,
                  disabled: disabled || readOnly,
                })}
              </span>
            );
          }
          return (
            <Badge
              key={`${tag}-${index}`}
              size={badgeTagSize}
              variant={tagInvalid ? 'soft' : (tagVariant as BadgeVariant)}
              color={tagInvalid ? 'danger' : (tagColor as BadgeColor)}
              removable={!disabled && !readOnly}
              onRemove={() => removeTagAt(index, 'remove-button')}
              removeLabel={t.removeTag(tag)}
              data-tag={tag}
              data-tag-invalid={tagInvalid || undefined}
              data-tag-selected={selected || undefined}
              className={selected ? 'ring-2 ring-focus' : undefined}
              title={tagInvalid ? perTagErrors[tag] : undefined}
            >
              {tag}
            </Badge>
          );
        })}

        {tags.length === 0 && inputValue.length === 0 && emptyHint != null ? (
          <span className={emptyHintClass} aria-hidden="true">
            {emptyHint}
          </span>
        ) : null}

        <input
          {...rest}
          ref={inputRef}
          id={formField.id}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls={suggestionsOpen ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-describedby={describedByIds}
          aria-invalid={formField['aria-invalid']}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          disabled={disabled}
          readOnly={readOnly || maxReached}
          placeholder={resolvedPlaceholder}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          onFocus={() => setTagCursor(null)}
          className={inputClass}
        />

        {showCount ? (
          <span className={countClass} aria-hidden="true">
            {t.count(tags.length, maxTags)}
          </span>
        ) : null}
      </div>

      {suggestionsOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t.suggestionsLabel}
          className={listboxClass}
        >
          {async.state === 'loading' ? (
            <div className={emptyClass} role="status">
              {t.loading}
            </div>
          ) : visibleSuggestions.length === 0 ? (
            <div className={emptyClass}>{t.noSuggestions}</div>
          ) : (
            visibleSuggestions.map((item, index) => {
              const value = getSuggestionValue
                ? getSuggestionValue(item as never)
                : String(item);
              const key = getSuggestionKey
                ? getSuggestionKey(item as never)
                : value;
              const active = index === activeSuggestion;
              const itemId = `${listboxId}-item-${index}`;
              return (
                <SuggestionRow
                  key={key}
                  id={itemId}
                  active={active}
                  onMouseDown={(event) => {
                    // Prevent the input from losing focus before the click commits.
                    event.preventDefault();
                  }}
                  onClick={() => commitSuggestionAt(index)}
                  onMouseEnter={() => setActiveSuggestion(index)}
                >
                  {renderSuggestion
                    ? renderSuggestion(item as never, {
                        active,
                        index,
                        query: trimmedQuery,
                      })
                    : value}
                </SuggestionRow>
              );
            })
          )}
        </div>
      ) : null}

      {name != null
        ? tags.map((tag, index) => (
            <input
              key={`hidden-${index}-${tag}`}
              type="hidden"
              name={name}
              value={tag}
              {...(required && index === 0 ? { required: true } : {})}
            />
          ))
        : null}

      {invalid ? (
        <span id={errorId} className={helperClass} role="alert">
          {error}
        </span>
      ) : helperText != null ? (
        <span id={helperId} className={helperClass}>
          {helperText}
        </span>
      ) : null}

      <span id={liveRegionId} className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}, 'TagsInput');

/** Row inside the suggestions listbox. Standalone so it can wire its own `useThemedClasses`. */
function SuggestionRow(props: {
  id: string;
  active: boolean;
  onClick: () => void;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  const { className } = useThemedClasses({
    recipe: tagsInputRecipes.item,
    componentName: 'TagsInput',
    slot: 'item',
    props: { active: props.active },
  });
  // Keyboard navigation lives on the parent `<input role="combobox">` via
  // `aria-activedescendant` (W3C combobox pattern) — the option element doesn't take focus
  // itself. We still satisfy axe by marking the row programmatically focusable and providing a
  // no-op `onKeyDown`; real handling stays on the input.
  return (
    <div
      id={props.id}
      role="option"
      aria-selected={props.active}
      tabIndex={-1}
      className={className}
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      onMouseEnter={props.onMouseEnter}
      onKeyDown={() => {
        // No-op — see comment above.
      }}
      data-active={props.active || undefined}
    >
      {props.children}
    </div>
  );
}

function mapTagSize(size: TagsInputTagSize): BadgeSize {
  // Badge ships sm / md / lg; we accept xs / sm / md and snap onto Badge's narrower scale.
  if (size === 'xs') return 'sm';
  if (size === 'md') return 'md';
  return 'sm';
}

function resolveResponsive<T>(value: T | { base?: T } | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object' && value !== null && 'base' in value) {
    return (value as { base?: T }).base ?? fallback;
  }
  return value as T;
}