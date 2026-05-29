import type { CSSProperties, ReactNode } from 'react';

import type { Sx } from '@apx-ui/engine';

import type { Command } from './headless/commandStore';

/**
 * Visual treatments. `solid` is the Linear / Raycast default; `soft` reads more embedded;
 * `minimal` drops the backdrop entirely for an inline-overlay look (useful inside an existing
 * floating panel).
 */
export type CommandPaletteVariant = 'solid' | 'soft' | 'minimal';

/** Drives search font size, row height, max-width, and max-height of the result list. */
export type CommandPaletteSize = 'sm' | 'md' | 'lg';

/**
 * Accent color used by the active-row highlight (`bg-{color}-subtle` background +
 * `border-inline-start: 2px solid {color}-solid`). Mirrors the 7-color matrix used by every
 * other interactive primitive (Button, Menu, Select, Combobox).
 */
export type CommandPaletteColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * A sub-palette page. Pages stack via `pushPage(id)` and unwind via `popPage()` / Esc. Each
 * page has its own command list (typically scoped, e.g. "Pick a theme") and an optional
 * title + placeholder override.
 */
export interface CommandPalettePage {
  /** Shown in the page-header chip above the search input. */
  title: string;
  /** Overrides the root-level placeholder while the page is active. */
  placeholder?: string;
  /** Commands available on this page. Does not merge with root-level commands. */
  commands: Command[];
}

export interface CommandPaletteTranslations {
  paletteLabel: string;
  searchPlaceholder: string;
  noResults: string;
  noResultsForQuery: (q: string) => string;
  resultsCount: (n: number) => string;
  recentLabel: string;
  uncategorizedLabel: string;
  footerHints: {
    navigate: string;
    select: string;
    close: string;
    back: string;
  };
  pageBackLabel: string;
  loading: string;
}

export const DEFAULT_COMMAND_PALETTE_TRANSLATIONS: CommandPaletteTranslations = {
  paletteLabel: 'Command palette',
  searchPlaceholder: 'Type a command or search…',
  noResults: 'No results',
  noResultsForQuery: (q) => `No results for "${q}"`,
  resultsCount: (n) => (n === 1 ? '1 result' : `${n} results`),
  recentLabel: 'Recently used',
  uncategorizedLabel: 'Other',
  footerHints: {
    navigate: '↑↓ navigate',
    select: '↵ select',
    close: 'esc close',
    back: 'esc back',
  },
  pageBackLabel: 'Back',
  loading: 'Loading…',
};

export interface CommandPaletteProps {
  // ---- state ----------------------------------------------------------------------------
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // ---- commands -------------------------------------------------------------------------
  /**
   * Declarative command list. Merged with any commands registered via `useRegisterCommand` /
   * `commands.register()` (declarative wins on id collision — the prop is the "ground truth"
   * for the lifetime of this palette mount).
   */
  commands?: Command[];
  /** Sub-palette pages keyed by id. */
  pages?: Record<string, CommandPalettePage>;

  // ---- recent + suggested ---------------------------------------------------------------
  /**
   * Ordered list of recently used command ids (most recent first). Shown above the filtered
   * list when the query is empty. The component tracks recents in-memory automatically if
   * this prop is omitted; pass it explicitly to control persistence yourself.
   */
  recentCommandIds?: string[];
  /** Max recent items displayed. Default: `5`. */
  maxRecentItems?: number;

  // ---- hotkey ---------------------------------------------------------------------------
  /** Hotkey to toggle the palette. Default: `'$mod+K'`. */
  hotkey?: string;
  /** Disable the global hotkey listener (when the host app handles it). Default: `false`. */
  disableGlobalHotkey?: boolean;

  // ---- filter ---------------------------------------------------------------------------
  filterStrategy?: 'substring' | 'fuzzy' | 'startsWith' | 'custom';
  filterCommand?: (cmd: Command, query: string) => boolean;
  /** Also match against the command's `keywords` array. Default: `true`. */
  matchKeywords?: boolean;

  // ---- render slots ---------------------------------------------------------------------
  /** Override row rendering. Receives the full command + helpers. */
  renderCommand?: (ctx: RenderCommandContext) => ReactNode;
  /** Empty-state renderer. Receives the current query. */
  renderEmpty?: (query: string) => ReactNode;
  /** Footer renderer. Defaults to the built-in hint strip (translated). Pass `null` to hide. */
  renderFooter?: ((helpers: { close: () => void; t: CommandPaletteTranslations }) => ReactNode) | null;

  // ---- visual ---------------------------------------------------------------------------
  variant?: CommandPaletteVariant;
  size?: CommandPaletteSize;
  color?: CommandPaletteColor;

  // ---- a11y / i18n ----------------------------------------------------------------------
  placeholder?: string;
  /** Inline translation overrides. Merged over `DEFAULT_COMMAND_PALETTE_TRANSLATIONS`. */
  translations?: Partial<CommandPaletteTranslations>;
  /**
   * Accessible label for the dialog. Falls back to `translations.paletteLabel`. Use when the
   * palette serves a specialized purpose ("Theme picker", "Quick switcher", …) so the AT user
   * hears the right context.
   */
  ariaLabel?: string;

  // ---- misc -----------------------------------------------------------------------------
  /** Class applied to the dialog Content surface. */
  className?: string;
  /** Inline style applied to the dialog Content surface. */
  style?: CSSProperties;
  /** Theme-aware style overrides (merged after recipe + className). */
  sx?: Sx;
  /** Portal target. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
  /**
   * Track recently used commands in-memory after each select. Default: `true`. Disable when
   * you're passing `recentCommandIds` from external persistence.
   */
  trackRecents?: boolean;
}

export interface RenderCommandContext {
  command: Command;
  /** Index across the **visible flattened list** (used by `aria-activedescendant`). */
  index: number;
  isActive: boolean;
  /** Trimmed search query string at render time — pass to `highlightMatch()` if desired. */
  query: string;
  /** Translated strings (merged user + defaults). */
  t: CommandPaletteTranslations;
}

/** Props for the `<Kbd>` primitive. */
export interface KbdProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Glyph / text inside the kbd. Either pass `children` or `keys`. */
  children?: ReactNode;
  /**
   * Sequence of keys to render. Each is wrapped in its own `<kbd>` and joined by `separator`.
   * Names are passed through `macKey()` so `'cmd'` becomes `'⌘'` on Mac / `'Ctrl'` elsewhere.
   */
  keys?: string[];
  /** Separator string between joined `keys`. Default: `'+'`. */
  separator?: string;
  /** Visual size. Default: `'md'`. */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant. Default: `'solid'`. */
  variant?: 'solid' | 'outline' | 'soft';
  /**
   * When `'auto'` (default), glyphs auto-translate per platform via `macKey()`. When set to a
   * specific platform, renders that platform's glyphs regardless of host OS — useful for
   * docs.
   */
  platform?: 'auto' | 'mac' | 'win' | 'linux';
  sx?: Sx;
}
