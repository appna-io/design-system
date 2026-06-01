import type { ReactNode } from 'react';

/**
 * Module-level event emitter that powers the imperative `commands.register()` API and the
 * `palette` controller. **No React imports**, just like ToastStore — the facade works from any
 * JS context (a Zustand action, a service-worker callback, a global error handler). The
 * `<CommandPalette>` component subscribes via `useCommandStore` (React boundary); everything
 * else is plain data.
 *
 * Mirrors the Phase 21 Toast architecture verbatim — same patterns, same naming, same
 * `__reset()` test hook. Two consumers (Toast, CommandPalette) is the threshold where lifting
 * this into a generic `createStore()` would start to make sense; we hold off until a third
 * consumer materializes.
 */

export interface CommandContext {
  command: Command;
  palette: {
    open: () => void;
    close: () => void;
    toggle: () => void;
    pushPage: (pageId: string) => void;
    popPage: () => void;
    setQuery: (q: string) => void;
  };
}

export interface Command {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  category?: string;
  description?: ReactNode;
  disabled?: boolean;
  onSelect: (ctx: CommandContext) => void | Promise<void>;
  /** Visibility predicate — if returns `false`, command is hidden globally. */
  when?: () => boolean;
}

type CommandListener = () => void;
type PaletteListener = (state: PaletteState) => void;

export interface PaletteState {
  open: boolean;
  pageStack: string[];
  query: string;
}

const commandsMap: Map<string, Command> = new Map();
const commandListeners: Set<CommandListener> = new Set();

let paletteState: PaletteState = { open: false, pageStack: [], query: '' };
const paletteListeners: Set<PaletteListener> = new Set();

function emitCommands(): void {
  commandListeners.forEach((fn) => fn());
}

function emitPalette(): void {
  paletteListeners.forEach((fn) => fn(paletteState));
}

/**
 * Public `commands` controller — register / unregister / inspect / subscribe.
 *
 * `register` returns an unsubscribe function so consumers can do
 * `const unreg = commands.register(cmd); …; unreg()` without re-passing the id. This matches
 * the ergonomics of `addEventListener` returning a cleanup token in modern APIs.
 */
export const commands = {
  register(cmd: Command): () => void {
    commandsMap.set(cmd.id, cmd);
    emitCommands();
    return () => commands.unregister(cmd.id);
  },

  /**
   * Register a batch of commands atomically (single emit). Useful for declarative `commands`
   * prop arrays — avoids one emit per command when seeding the store at mount.
   */
  registerMany(cmds: Command[]): () => void {
    const ids = cmds.map((c) => c.id);
    cmds.forEach((c) => commandsMap.set(c.id, c));
    emitCommands();
    return () => {
      ids.forEach((id) => commandsMap.delete(id));
      emitCommands();
    };
  },

  unregister(id: string): void {
    if (!commandsMap.has(id)) return;
    commandsMap.delete(id);
    emitCommands();
  },

  /**
   * Snapshot of all registered commands, filtered through their `when()` predicates. Returned
   * array is fresh each call — safe to mutate / sort.
   */
  getAll(): Command[] {
    const arr: Command[] = [];
    commandsMap.forEach((c) => {
      if (!c.when || c.when()) arr.push(c);
    });
    return arr;
  },

  /**
   * Snapshot used by `useSyncExternalStore`. **Must return a stable identity** between mutations
   * for React 18 to skip renders correctly. We cache the result and invalidate on every mutate.
   */
  getSnapshot(): Command[] {
    if (snapshotDirty) {
      snapshot = commands.getAll();
      snapshotDirty = false;
    }
    return snapshot;
  },

  subscribe(fn: CommandListener): () => void {
    commandListeners.add(fn);
    return () => {
      commandListeners.delete(fn);
    };
  },

  /** Test helper — clears all registrations + palette state. Not part of the public surface. */
  __reset(): void {
    commandsMap.clear();
    paletteState = { open: false, pageStack: [], query: '' };
    snapshot = [];
    snapshotDirty = false;
    emitCommands();
    emitPalette();
  },
};

let snapshot: Command[] = [];
let snapshotDirty = true;

// Subscribe internally so any mutation invalidates the cached snapshot.
commandListeners.add(() => {
  snapshotDirty = true;
});

/**
 * Public `palette` imperative controller. Same architecture as `commands` — module-level
 * state, listener set, no React. The mounted `<CommandPalette>` subscribes via
 * `usePaletteController` and reflects the imperative state into its internal `useCommandPalette`
 * hook.
 *
 * `setQuery` is the odd one out — most consumers won't reach in to mutate the query, but
 * `pushPage` resets it to empty and a sub-command may want to seed the next page's query.
 */
export const palette = {
  open(): void {
    if (paletteState.open) return;
    paletteState = { ...paletteState, open: true };
    emitPalette();
  },
  close(): void {
    if (!paletteState.open && paletteState.pageStack.length === 0 && paletteState.query === '') return;
    paletteState = { open: false, pageStack: [], query: '' };
    emitPalette();
  },
  toggle(): void {
    if (paletteState.open) palette.close();
    else palette.open();
  },
  pushPage(pageId: string): void {
    paletteState = {
      ...paletteState,
      open: true,
      pageStack: [...paletteState.pageStack, pageId],
      query: '',
    };
    emitPalette();
  },
  popPage(): void {
    if (paletteState.pageStack.length === 0) return;
    paletteState = {
      ...paletteState,
      pageStack: paletteState.pageStack.slice(0, -1),
      query: '',
    };
    emitPalette();
  },
  setQuery(q: string): void {
    if (paletteState.query === q) return;
    paletteState = { ...paletteState, query: q };
    emitPalette();
  },
  /** Read the current palette state synchronously. */
  getState(): PaletteState {
    return paletteState;
  },
  /** Snapshot for `useSyncExternalStore`. Returns the same identity until state changes. */
  getSnapshot(): PaletteState {
    return paletteState;
  },
  subscribe(fn: PaletteListener): () => void {
    paletteListeners.add(fn);
    return () => {
      paletteListeners.delete(fn);
    };
  },
};