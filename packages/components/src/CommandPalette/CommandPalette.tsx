'use client';

import {
  useControllableState,
  useI18n,
  useId,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useListKeyboard, type ListKeyboardItem } from '../_shared/useListKeyboard';
import { Modal } from '../Modal';

import {
  commandPaletteCategoryRecipe,
  commandPaletteContentRecipe,
  commandPaletteEmptyRecipe,
  commandPaletteFooterRecipe,
  commandPaletteListRecipe,
  commandPalettePageHeaderRecipe,
  commandPaletteRowRecipe,
  commandPaletteSearchInputRecipe,
  commandPaletteSearchRecipe,
  commandPaletteShortcutRecipe,
} from './CommandPalette.recipe';
import {
  DEFAULT_COMMAND_PALETTE_TRANSLATIONS,
  type CommandPaletteProps,
  type CommandPaletteTranslations,
  type RenderCommandContext,
} from './CommandPalette.types';
import {
  commands as commandStore,
  palette as paletteController,
  type Command,
} from './headless/commandStore';
import { filterCommands, flattenSections } from './headless/filterCommands';
import { useGlobalHotkey } from './headless/useGlobalHotkey';
import { useRecentCommands } from './headless/useRecentCommands';
import { Kbd } from './Kbd';

// ── Active-owner registry ───────────────────────────────────────────────────────────────────
//
// Tracks the stack of mounted `<CommandPalette>` instances so the most-recently-mounted one
// owns the module-level `paletteController` binding. Non-owners run in pure local-state mode
// and ignore the global controller, which prevents a single `palette.open()` (or any local
// open) from cascade-opening every peer instance on the page — the exact failure mode that
// triggered the original "command palette crashes the renderer" report (10 stacked focus
// traps fighting for `document.activeElement` line-116-looped `useFocusTrap`).
const ownerStack: number[] = [];
const ownerListeners: Set<() => void> = new Set();
let nextOwnerId = 0;

function getActiveOwnerId(): number | null {
  return ownerStack.length > 0 ? ownerStack[ownerStack.length - 1]! : null;
}

function subscribeToOwnerChanges(fn: () => void): () => void {
  ownerListeners.add(fn);
  return () => ownerListeners.delete(fn);
}

function emitOwnerChange(): void {
  ownerListeners.forEach((fn) => fn());
}

const EMPTY_PAGE_STACK: string[] = [];

/**
 * `<CommandPalette>` — the ⌘K command launcher. Modal-styled overlay containing a search
 * input, filterable result list, optional sub-pages, recent-command surfacing, and a global
 * hotkey to toggle visibility.
 *
 * Internal architecture:
 *
 *  - **Open state** is dual-sourced: the consumer's `open` prop (controlled / uncontrolled
 *    via `useControllableState`) is the primary source, while the module-level
 *    `palette.open() / close() / toggle()` writes route through the same setter so imperative
 *    calls from anywhere in the app stay in sync. The `<Modal>` itself receives the resolved
 *    boolean and renders accordingly.
 *
 *  - **Commands** are merged from three streams: the `commands` prop (declarative), the
 *    module-level `commandStore` (populated by `useRegisterCommand` + `commands.register`),
 *    and the active page's `commands` array (when inside a sub-page). The declarative prop
 *    wins on id collision because it's the most explicit signal.
 *
 *  - **Keyboard nav** delegates to `_shared/useListKeyboard` — fourth consumer (Menu → Select
 *    → Combobox → CommandPalette). Type-ahead is **disabled** because the input itself is
 *    consuming printable keys for filtering; the hook just handles arrows / Home / End /
 *    Enter / Esc.
 *
 *  - **A11y** follows the W3C "Combobox in a Modal" pattern:
 *      • Modal: `role="dialog"` (from `<Modal.Content>`) + `aria-label`.
 *      • Input: `role="combobox"` + `aria-expanded="true"` + `aria-controls={listId}` +
 *        `aria-autocomplete="list"` + `aria-activedescendant={highlightedId}`.
 *      • List: `role="listbox"`.
 *      • Rows: `role="option"` + `aria-selected`.
 */
export function CommandPalette(props: CommandPaletteProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    commands: declarativeCommands,
    pages,
    recentCommandIds,
    maxRecentItems = 5,
    hotkey = '$mod+K',
    disableGlobalHotkey = false,
    filterStrategy = 'substring',
    filterCommand,
    matchKeywords = true,
    renderCommand,
    renderEmpty,
    renderFooter,
    variant = 'solid',
    size = 'md',
    color = 'primary',
    placeholder,
    translations,
    ariaLabel,
    className,
    style,
    sx,
    portalContainer,
    trackRecents = true,
  } = props;

  // ── Translations ────────────────────────────────────────────────────────────────────────
  // Three-layer precedence (Phase 58 RFC #2):
  //   1. `translations={...}` per-instance prop (highest)
  //   2. `<I18nProvider messages={{ CommandPalette: ... }}>` provider value
  //   3. Built-in English defaults (`DEFAULT_COMMAND_PALETTE_TRANSLATIONS`)
  // The `footerHints` sub-object is deep-merged so consumers can override individual hint keys
  // without restating the whole catalogue.
  const i18n = useI18n();
  const providerTranslations = i18n?.get<Partial<CommandPaletteTranslations>>('CommandPalette');
  const t: CommandPaletteTranslations = useMemo(() => {
    return {
      ...DEFAULT_COMMAND_PALETTE_TRANSLATIONS,
      ...providerTranslations,
      ...translations,
      footerHints: {
        ...DEFAULT_COMMAND_PALETTE_TRANSLATIONS.footerHints,
        ...(providerTranslations?.footerHints ?? {}),
        ...(translations?.footerHints ?? {}),
      },
    };
  }, [providerTranslations, translations]);

  // ── Open / close state (controlled + imperative `palette.open()` synced) ────────────────
  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const isOpen = openRaw ?? false;

  // ── Module-level controller binding ─────────────────────────────────────────────────────
  //
  // `paletteController` is a singleton — there is conceptually one "the command palette" in an
  // app. When multiple `<CommandPalette>` instances are mounted (e.g. a docs page rendering
  // many examples), only the most-recently-mounted instance owns the controller binding. All
  // others run in pure local-state mode so their imperative state can't cascade-open every
  // peer on the page. This mirrors the singleton ownership we apply to `useGlobalHotkey`.
  const isControllerOwner = useIsActivePaletteOwner();
  const externalPaletteState = useSyncExternalStore(
    paletteController.subscribe,
    paletteController.getSnapshot,
    paletteController.getSnapshot,
  );

  // Two-way bridge between the local controlled state and the module-level palette controller.
  // The local state is the rendering source of truth (because React's render cycle is the only
  // way to draw the dialog); the controller is the imperative entry point (anyone in the app
  // can call `palette.open()`). Both must stay synced or `palette.close()` after `defaultOpen`
  // becomes a no-op (external thinks it was already closed).
  const lastExternalOpenRef = useRef(externalPaletteState.open);
  useEffect(() => {
    if (!isControllerOwner) return;
    if (externalPaletteState.open !== lastExternalOpenRef.current) {
      lastExternalOpenRef.current = externalPaletteState.open;
      setOpenInternal(externalPaletteState.open);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPaletteState.open, isControllerOwner]);

  // On mount + whenever local open changes, mirror to the controller so imperative reads /
  // subsequent close() calls see the right baseline. This covers the `defaultOpen` case where
  // the local state starts `true` but the controller starts `false`.
  useEffect(() => {
    if (!isControllerOwner) return;
    const externalOpen = paletteController.getState().open;
    if (isOpen !== externalOpen) {
      lastExternalOpenRef.current = isOpen;
      if (isOpen) paletteController.open();
      else paletteController.close();
    }
  }, [isOpen, isControllerOwner]);

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // ── Page stack ───────────────────────────────────────────────────────────────────────────
  // Page stacks are only meaningful for the controller-owning instance — other instances run
  // in local-state-only mode and never consult the module store, so they always see a fresh
  // root page. This avoids non-owners showing a stale sub-page that was pushed via the
  // imperative API by another mounted instance.
  const pageStack = isControllerOwner ? externalPaletteState.pageStack : EMPTY_PAGE_STACK;
  const currentPageId = pageStack.length > 0 ? pageStack[pageStack.length - 1] ?? null : null;
  const currentPage = currentPageId && pages ? pages[currentPageId] ?? null : null;

  const pushPage = useCallback((pageId: string) => paletteController.pushPage(pageId), []);
  const popPage = useCallback(() => paletteController.popPage(), []);

  // ── Query state ─────────────────────────────────────────────────────────────────────────
  // Local input value is the source of truth for the input element; we also sync to the
  // module store so an imperative `palette.setQuery('foo')` updates the field — but only when
  // this instance owns the controller, to keep non-owner instances independent.
  const [query, setQuery] = useState('');
  const externalQuery = externalPaletteState.query;
  useEffect(() => {
    if (!isControllerOwner) return;
    if (externalQuery !== query && externalQuery !== '') {
      setQuery(externalQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery, isControllerOwner]);

  // Reset query on close + page push (matches Linear / Raycast UX — a fresh palette has a
  // fresh search box).
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      if (isControllerOwner) paletteController.setQuery('');
    }
  }, [isOpen, isControllerOwner]);
  useEffect(() => {
    setQuery('');
    if (isControllerOwner) paletteController.setQuery('');
  }, [currentPageId, isControllerOwner]);

  // ── Command list resolution ─────────────────────────────────────────────────────────────
  // Subscribe to the module-level command store so hook-registered commands flow in
  // automatically.
  const storeCommands = useSyncExternalStore(
    commandStore.subscribe,
    commandStore.getSnapshot,
    commandStore.getSnapshot,
  );

  const allCommands: Command[] = useMemo(() => {
    if (currentPage) {
      // Sub-pages are scoped — they don't merge with the root command set.
      return currentPage.commands;
    }
    const declarative = declarativeCommands ?? [];
    if (declarative.length === 0) return storeCommands;
    if (storeCommands.length === 0) return declarative;
    // Merge: declarative wins on id collision.
    const seen = new Set(declarative.map((c) => c.id));
    const merged: Command[] = [...declarative];
    for (const c of storeCommands) {
      if (!seen.has(c.id)) merged.push(c);
    }
    return merged;
  }, [declarativeCommands, storeCommands, currentPage]);

  // ── Recents ─────────────────────────────────────────────────────────────────────────────
  const { recents, push: pushRecent } = useRecentCommands({
    max: maxRecentItems,
    ...(recentCommandIds !== undefined ? { controlled: recentCommandIds } : {}),
    enabled: trackRecents,
  });

  // ── Filter + sections ───────────────────────────────────────────────────────────────────
  const sections = useMemo(() => {
    // Recents bucket only at root, with empty query, when we actually have recents to show.
    if (!currentPage && !query.trim() && recents.length > 0) {
      const byId = new Map(allCommands.map((c) => [c.id, c]));
      const recentCommands = recents
        .map((id) => byId.get(id))
        .filter((c): c is Command => Boolean(c));
      const recentIds = new Set(recentCommands.map((c) => c.id));
      const rest = allCommands.filter((c) => !recentIds.has(c.id));
      const restSections = filterCommands(rest, {
        query: '',
        strategy: filterStrategy,
        ...(filterCommand !== undefined ? { filterCommand } : {}),
        matchKeywords,
      });
      if (recentCommands.length > 0) {
        return [
          { category: t.recentLabel, commands: recentCommands },
          ...restSections,
        ];
      }
      return restSections;
    }
    return filterCommands(allCommands, {
      query: query.trim(),
      strategy: filterStrategy,
      ...(filterCommand !== undefined ? { filterCommand } : {}),
      matchKeywords,
    });
  }, [
    allCommands,
    query,
    filterStrategy,
    filterCommand,
    matchKeywords,
    recents,
    currentPage,
    t.recentLabel,
  ]);

  const flatCommands = useMemo(() => flattenSections(sections), [sections]);

  // ── Highlight state ─────────────────────────────────────────────────────────────────────
  const [highlightedId, setHighlightedIdRaw] = useState<string | null>(null);

  // Reset highlight whenever the filtered list changes — point at the first enabled command.
  useEffect(() => {
    if (flatCommands.length === 0) {
      setHighlightedIdRaw(null);
      return;
    }
    // Keep the current highlight if it still exists in the flattened list. Otherwise reset to
    // the first non-disabled command.
    if (highlightedId && flatCommands.some((c) => c.id === highlightedId)) {
      return;
    }
    const firstEnabled = flatCommands.find((c) => !c.disabled);
    setHighlightedIdRaw(firstEnabled?.id ?? flatCommands[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatCommands]);

  // ── IDs ─────────────────────────────────────────────────────────────────────────────────
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const itemId = (cmdId: string): string => `${baseId}-item-${cmdId}`;

  // ── Execute a command ───────────────────────────────────────────────────────────────────
  const executeCommand = useCallback(
    async (cmd: Command) => {
      if (cmd.disabled) return;
      const ctx = {
        command: cmd,
        palette: {
          open: () => setOpen(true),
          close: () => setOpen(false),
          toggle: () => setOpen(!isOpen),
          pushPage,
          popPage,
          setQuery: (q: string) => {
            setQuery(q);
            paletteController.setQuery(q);
          },
        },
      };
      if (trackRecents) pushRecent(cmd.id);
      // Snapshot the page stack BEFORE invoking the command — `onSelect` is allowed to push
      // a sub-page synchronously, and we use the delta to decide whether to auto-close.
      const pageStackBefore = paletteController.getState().pageStack.length;
      const maybePromise = cmd.onSelect(ctx);
      // Default behavior: if the command didn't push a page, close the palette. Async
      // commands keep the palette open until they resolve, then close (so the user gets
      // feedback that the action ran).
      if (maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function') {
        try {
          await maybePromise;
        } finally {
          const pageStackAfter = paletteController.getState().pageStack.length;
          if (pageStackAfter <= pageStackBefore) setOpen(false);
        }
        return;
      }
      const pageStackAfter = paletteController.getState().pageStack.length;
      if (pageStackAfter <= pageStackBefore) setOpen(false);
    },
    [isOpen, pushPage, popPage, setOpen, pushRecent, trackRecents],
  );

  // ── Keyboard handler (shared) ───────────────────────────────────────────────────────────
  const flatCommandsRef = useRef(flatCommands);
  useEffect(() => {
    flatCommandsRef.current = flatCommands;
  }, [flatCommands]);
  const highlightedIdRef = useRef(highlightedId);
  useEffect(() => {
    highlightedIdRef.current = highlightedId;
  }, [highlightedId]);

  const keyboardItems = useMemo<ListKeyboardItem[]>(
    () =>
      flatCommands.map((c) => ({
        id: c.id,
        textValue: c.label,
        disabled: Boolean(c.disabled),
      })),
    [flatCommands],
  );
  const keyboardItemsRef = useRef(keyboardItems);
  useEffect(() => {
    keyboardItemsRef.current = keyboardItems;
  }, [keyboardItems]);

  const onKeyDown = useListKeyboard({
    getItems: () => keyboardItemsRef.current,
    getHighlightedId: () => highlightedIdRef.current,
    setHighlightedId: (id) => setHighlightedIdRaw(id),
    loop: true,
    // CRITICAL: the input element consumes printable keys for filtering. If we let the hook
    // also type-ahead, every keystroke would compete for the highlight. Same opt-out
    // Combobox uses.
    typeAhead: false,
    onClose: () => {
      // Esc inside a sub-page pops back; at root it closes.
      if (paletteController.getState().pageStack.length > 0) {
        popPage();
      } else {
        setOpen(false);
      }
    },
    onSelect: (id) => {
      const cmd = flatCommandsRef.current.find((c) => c.id === id);
      if (cmd) void executeCommand(cmd);
    },
  });

  // Backspace at start of empty input pops a page (matches Linear / Raycast UX). Escape on a
  // sub-page also pops and **must** stop propagation so Modal's own `useEscapeStack` doesn't
  // also fire and close the entire dialog — we want Esc to be a per-layer "back" gesture.
  const onInputKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && query === '' && pageStack.length > 0) {
        event.preventDefault();
        popPage();
        return;
      }
      if (event.key === 'Escape' && pageStack.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        // The native DOM listener that Modal's `useEscapeStack` registers fires on the
        // bubbled-up DOM event, not the React synthetic. We need to stop propagation on the
        // native event too so the document-level listener sees `defaultPrevented`.
        (event.nativeEvent as Event).stopImmediatePropagation?.();
        popPage();
        return;
      }
      onKeyDown(event as ReactKeyboardEvent<HTMLElement>);
    },
    [query, pageStack.length, popPage, onKeyDown],
  );

  // ── Global hotkey ───────────────────────────────────────────────────────────────────────
  useGlobalHotkey({
    hotkey,
    enabled: !disableGlobalHotkey,
    onTrigger: () => setOpen(!isOpen),
  });

  // ── Themed classes ──────────────────────────────────────────────────────────────────────
  const { className: contentCls, style: contentStyleResolved } = useThemedClasses({
    recipe: commandPaletteContentRecipe,
    componentName: 'CommandPalette',
    slot: 'content',
    props: { size, variant, className, sx, style },
  });
  const { className: searchCls } = useThemedClasses({
    recipe: commandPaletteSearchRecipe,
    componentName: 'CommandPalette',
    slot: 'search',
    props: { size },
  });
  const { className: searchInputCls } = useThemedClasses({
    recipe: commandPaletteSearchInputRecipe,
    componentName: 'CommandPalette',
    slot: 'searchInput',
    props: { size },
  });
  const { className: listCls } = useThemedClasses({
    recipe: commandPaletteListRecipe,
    componentName: 'CommandPalette',
    slot: 'list',
    props: { size },
  });
  const { className: footerCls } = useThemedClasses({
    recipe: commandPaletteFooterRecipe,
    componentName: 'CommandPalette',
    slot: 'footer',
    props: {},
  });
  const { className: emptyCls } = useThemedClasses({
    recipe: commandPaletteEmptyRecipe,
    componentName: 'CommandPalette',
    slot: 'empty',
    props: {},
  });
  const { className: pageHeaderCls } = useThemedClasses({
    recipe: commandPalettePageHeaderRecipe,
    componentName: 'CommandPalette',
    slot: 'pageHeader',
    props: {},
  });

  // Bare row & category recipe accessors (used inside the list mapper).
  const renderRow = (cmd: Command, index: number): ReactNode => {
    const isActive = cmd.id === highlightedId;
    if (renderCommand) {
      const ctx: RenderCommandContext = {
        command: cmd,
        index,
        isActive,
        query: query.trim(),
        t,
      };
      return (
        <CommandRow
          key={cmd.id}
          id={itemId(cmd.id)}
          isActive={isActive}
          disabled={Boolean(cmd.disabled)}
          onClick={() => void executeCommand(cmd)}
          onMouseEnter={() => setHighlightedIdRaw(cmd.id)}
          size={size}
          color={color}
        >
          {renderCommand(ctx)}
        </CommandRow>
      );
    }
    return (
      <CommandRow
        key={cmd.id}
        id={itemId(cmd.id)}
        isActive={isActive}
        disabled={Boolean(cmd.disabled)}
        onClick={() => void executeCommand(cmd)}
        onMouseEnter={() => setHighlightedIdRaw(cmd.id)}
        size={size}
        color={color}
      >
        {cmd.icon ? (
          <span className="shrink-0 inline-flex items-center justify-center" aria-hidden="true">
            {cmd.icon}
          </span>
        ) : null}
        <span className="flex-1 min-w-0 truncate">{cmd.label}</span>
        {cmd.shortcut ? (
          <span className={commandPaletteShortcutRecipe()}>
            {renderShortcut(cmd.shortcut)}
          </span>
        ) : null}
      </CommandRow>
    );
  };

  // ── Initial focus ref for Modal ─────────────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement | null>(null);

  const dialogLabel = ariaLabel ?? (currentPage ? currentPage.title : t.paletteLabel);

  // We use Modal as the dialog shell; pass our own contentClass via className override and a
  // fitting size. Modal's `size="lg"` gives us a `max-w-lg` (32rem), but we then layer our own
  // size-specific max-width via the recipe. The result is exact pixel control.
  return (
    <Modal
      open={isOpen}
      onOpenChange={setOpen}
      closeOnEscape
      closeOnBackdropClick
      trapFocus
      preventScroll
      initialFocus={inputRef}
    >
      <Modal.Content
        size="lg"
        placement="top"
        overlay={variant === 'minimal' ? 'transparent' : 'dimmed'}
        portalContainer={portalContainer}
        className={contentCls}
        style={contentStyleResolved as CSSProperties | undefined}
        aria-label={dialogLabel}
        data-cp-variant={variant}
        data-cp-size={size}
        data-cp-color={color}
      >
        {currentPage ? (
          <div className={pageHeaderCls}>
            <button
              type="button"
              onClick={popPage}
              aria-label={t.pageBackLabel}
              className="inline-flex items-center justify-center size-6 rounded text-fg-muted hover:text-fg-default hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <span className="text-fg-default font-medium">{currentPage.title}</span>
          </div>
        ) : null}

        <div className={searchCls}>
          <span className="shrink-0 text-fg-muted" aria-hidden="true">
            {/* Search glyph — inline SVG keeps us icon-library-free. */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              paletteController.setQuery(next);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={(currentPage?.placeholder ?? placeholder) ?? t.searchPlaceholder}
            className={searchInputCls}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={highlightedId ? itemId(highlightedId) : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label={dialogLabel}
          className={listCls}
        >
          {flatCommands.length === 0 ? (
            <div className={emptyCls}>
              {renderEmpty
                ? renderEmpty(query.trim())
                : query.trim()
                  ? t.noResultsForQuery(query.trim())
                  : t.noResults}
            </div>
          ) : (
            sections.map((section, sIdx) => (
              // Section identity is by category name; `null` is the uncategorized bucket.
              <div key={section.category ?? `_uncategorized_${sIdx}`}>
                {section.category ? (
                  <div
                    className={commandPaletteCategoryRecipe()}
                    role="presentation"
                  >
                    {section.category}
                  </div>
                ) : sections.length > 1 ? (
                  // Only render the "Other" label when there's at least one named section
                  // above — otherwise the bucket is the whole list and a label adds noise.
                  <div
                    className={commandPaletteCategoryRecipe()}
                    role="presentation"
                  >
                    {t.uncategorizedLabel}
                  </div>
                ) : null}
                {section.commands.map((cmd) => {
                  const index = flatCommands.indexOf(cmd);
                  return renderRow(cmd, index);
                })}
              </div>
            ))
          )}
        </div>

        {renderFooter === null ? null : (
          <div className={footerCls} aria-hidden="true">
            {renderFooter ? (
              renderFooter({ close: () => setOpen(false), t })
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <Kbd size="sm">↑</Kbd>
                  <Kbd size="sm">↓</Kbd>
                  <span>{t.footerHints.navigate}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Kbd size="sm">↵</Kbd>
                  <span>{t.footerHints.select}</span>
                  <span className="opacity-60">·</span>
                  <Kbd size="sm">esc</Kbd>
                  <span>{pageStack.length > 0 ? t.footerHints.back : t.footerHints.close}</span>
                </span>
              </>
            )}
          </div>
        )}

        {/* aria-live: announce result count, debounced by React's render scheduling. */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {query.trim() ? t.resultsCount(flatCommands.length) : ''}
        </div>
      </Modal.Content>
    </Modal>
  );
}

CommandPalette.displayName = 'CommandPalette';

/**
 * Register this instance in the module-level owner stack and return `true` when it is the
 * topmost (most-recently-mounted) palette — meaning it should bridge with the singleton
 * `paletteController`. All other mounted instances return `false` and run in local-state-only
 * mode. The "topmost wins" convention matches Modal / Popover z-stacking semantics and the
 * twin behaviour in `useGlobalHotkey`.
 */
function useIsActivePaletteOwner(): boolean {
  const idRef = useRef<number | null>(null);
  if (idRef.current === null) {
    nextOwnerId += 1;
    idRef.current = nextOwnerId;
  }

  useEffect(() => {
    const id = idRef.current!;
    ownerStack.push(id);
    emitOwnerChange();
    return () => {
      const idx = ownerStack.indexOf(id);
      if (idx >= 0) ownerStack.splice(idx, 1);
      emitOwnerChange();
    };
  }, []);

  return useSyncExternalStore(
    subscribeToOwnerChanges,
    () => getActiveOwnerId() === idRef.current,
    () => false,
  );
}

/**
 * Internal row component. Pulled out so we can reuse it for the default-render and custom-
 * render paths without duplicating the className / ARIA / event wiring.
 */
function CommandRow(props: {
  id: string;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  size: 'sm' | 'md' | 'lg';
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';
  children: ReactNode;
}): ReactElement {
  const { id, isActive, disabled, onClick, onMouseEnter, size, color, children } = props;
  const { className: cls } = useThemedClasses({
    recipe: commandPaletteRowRecipe,
    componentName: 'CommandPalette',
    slot: 'row',
    props: {
      size,
      color,
      state: disabled ? 'disabled' : isActive ? 'active' : 'idle',
    },
  });
  return (
    // Listbox option pattern: the input owns focus + arrow-nav via aria-activedescendant.
    // Rows are mouse-clickable + hover-highlightable, but never receive real focus.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      data-state={isActive ? 'active' : 'idle'}
      className={cls}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}

/**
 * Render a shortcut string into a row of `<Kbd>` chips. Accepts plus-separated tokens
 * (`'⌘+K'`, `'Ctrl+Shift+P'`) and individual glyphs. Keeps the rendering consistent across
 * commands without forcing consumers to wrap every shortcut in `<Kbd>` themselves.
 */
function renderShortcut(shortcut: string): ReactNode {
  const tokens = shortcut.split('+').map((s) => s.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  return (
    <>
      {tokens.map((tok, i) => (
        <Kbd key={`${i}-${tok}`} size="sm">
          {tok}
        </Kbd>
      ))}
    </>
  );
}
