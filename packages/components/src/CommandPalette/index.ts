/**
 * `<CommandPalette>` — the ⌘K command launcher. Modal-styled overlay containing a search
 * input, filterable result list, optional sub-pages, recent-command surfacing, and a global
 * hotkey to toggle visibility.
 *
 * Public surface:
 *
 *  - `<CommandPalette>` — the main component (declarative props + module-store fusion).
 *  - `<Kbd>` — tiny visual primitive for inline keyboard shortcuts. Useful well outside the
 *    palette (docs, tooltips, menu rows).
 *  - `useRegisterCommand(cmd)` — hook-based registration; mount registers, unmount cleans up.
 *  - `commands` — module-level controller: `register / unregister / registerMany / getAll /
 *    subscribe`. Works from any JS context (action creators, error handlers, …).
 *  - `palette` — module-level imperative controller: `open / close / toggle / pushPage /
 *    popPage / setQuery / getState / subscribe`.
 *  - `parseHotkey` + `matchesHotkey` + `useGlobalHotkey` — generic hotkey utilities, exported
 *    publicly so consumers can build their own shortcut help / hotkey-binding UIs.
 *  - `macKey` + `detectHotkeyPlatform` — platform-aware glyph helper. Pure. Named to
 *    disambiguate from `@apx-ui/theme`'s own `detectPlatform` (which answers a
 *    different question — Apple-WebKit detection for the Cupertino theme variant).
 *  - `filterCommands` + `flattenSections` + `groupByCategory` — pure helpers for custom
 *    palette UIs that want the filter/group logic without the chrome.
 */
export { CommandPalette } from './CommandPalette';
export { Kbd } from './Kbd';

export { useRegisterCommand } from './headless/useRegisterCommand';
export { commands, palette } from './headless/commandStore';
export type {
  Command,
  CommandContext,
  PaletteState,
} from './headless/commandStore';

export {
  parseHotkey,
  matchesHotkey,
  resolveMod,
  type ParsedHotkey,
} from './headless/parseHotkey';
export { useGlobalHotkey, type UseGlobalHotkeyOptions } from './headless/useGlobalHotkey';
export { detectHotkeyPlatform, macKey, type HotkeyPlatform } from './headless/platformKey';

export {
  filterCommands,
  flattenSections,
  groupByCategory,
  type CommandSection,
  type FilterCommandsOptions,
} from './headless/filterCommands';

export {
  DEFAULT_COMMAND_PALETTE_TRANSLATIONS,
  type CommandPaletteColor,
  type CommandPalettePage,
  type CommandPaletteProps,
  type CommandPaletteSize,
  type CommandPaletteTranslations,
  type CommandPaletteVariant,
  type KbdProps,
  type RenderCommandContext,
} from './CommandPalette.types';
