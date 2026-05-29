import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'command-palette',
  displayName: 'CommandPalette',
  description:
    "The ⌘K command launcher — a keyboard-first Modal overlay with a search input, filterable result list, sub-pages, recent-command surfacing, and a global hotkey to toggle visibility. Three registration paths (declarative `commands` prop, `useRegisterCommand` hook, module-level `commands.register`) interop seamlessly. Ships with `<Kbd>` and the `parseHotkey` / `matchesHotkey` / `useGlobalHotkey` utilities. Reuses `<Modal>` for the dialog shell, Combobox's `filterStrategies` for matching, and `_shared/useListKeyboard` (its fourth consumer).",
  category: 'Overlays',
  tags: ['command-palette', 'cmd-k', 'kbd', 'hotkey', 'launcher', 'spotlight', 'omnibar'],
};
