import { describe, expect, it, beforeEach } from 'vitest';

import {
  filterCommands,
  flattenSections,
  groupByCategory,
} from '../src/CommandPalette/headless/filterCommands';
import { commands, palette, type Command } from '../src/CommandPalette/headless/commandStore';
import {
  matchesHotkey,
  parseHotkey,
  resolveMod,
} from '../src/CommandPalette/headless/parseHotkey';
import {
  detectHotkeyPlatform,
  macKey,
} from '../src/CommandPalette/headless/platformKey';

/**
 * Pure tests for the CommandPalette headless layer. No DOM, no React. The store / palette
 * controller is module-singleton state, so each test starts with `__reset()`.
 */

const stubCmd = (id: string, partial: Partial<Command> = {}): Command => ({
  id,
  label: partial.label ?? id,
  onSelect: () => undefined,
  ...partial,
});

describe('parseHotkey', () => {
  it('parses a simple letter', () => {
    expect(parseHotkey('K')).toEqual({
      mod: false,
      ctrl: false,
      meta: false,
      alt: false,
      shift: false,
      key: 'K',
    });
  });

  it('uppercases single alphabetic keys', () => {
    expect(parseHotkey('k').key).toBe('K');
  });

  it('parses $mod+K', () => {
    expect(parseHotkey('$mod+K')).toEqual({
      mod: true,
      ctrl: false,
      meta: false,
      alt: false,
      shift: false,
      key: 'K',
    });
  });

  it('parses multi-modifier hotkeys', () => {
    expect(parseHotkey('Ctrl+Shift+P')).toMatchObject({
      ctrl: true,
      shift: true,
      key: 'P',
    });
  });

  it('aliases cmd/command/meta/win/super to meta', () => {
    expect(parseHotkey('Cmd+K').meta).toBe(true);
    expect(parseHotkey('Command+K').meta).toBe(true);
    expect(parseHotkey('Meta+K').meta).toBe(true);
    expect(parseHotkey('Win+K').meta).toBe(true);
    expect(parseHotkey('Super+K').meta).toBe(true);
  });

  it('aliases option/opt to alt', () => {
    expect(parseHotkey('Option+K').alt).toBe(true);
    expect(parseHotkey('Opt+K').alt).toBe(true);
  });

  it('normalizes named keys to KeyboardEvent.key form', () => {
    expect(parseHotkey('Enter').key).toBe('Enter');
    expect(parseHotkey('Return').key).toBe('Enter');
    expect(parseHotkey('Escape').key).toBe('Escape');
    expect(parseHotkey('Esc').key).toBe('Escape');
    expect(parseHotkey('ArrowDown').key).toBe('ArrowDown');
    expect(parseHotkey('Up').key).toBe('ArrowUp');
    expect(parseHotkey('Space').key).toBe(' ');
  });

  it('passes punctuation through verbatim', () => {
    expect(parseHotkey('Cmd+/').key).toBe('/');
    expect(parseHotkey('?').key).toBe('?');
  });

  it('tolerates whitespace around + separators', () => {
    expect(parseHotkey(' Ctrl + Shift + P ')).toMatchObject({
      ctrl: true,
      shift: true,
      key: 'P',
    });
  });

  it('throws on empty hotkey', () => {
    expect(() => parseHotkey('')).toThrow();
    expect(() => parseHotkey('Cmd+')).toThrow();
  });
});

describe('resolveMod', () => {
  it('maps $mod to meta on mac', () => {
    const r = resolveMod(parseHotkey('$mod+K'), 'mac');
    expect(r.meta).toBe(true);
    expect(r.ctrl).toBe(false);
    expect(r.mod).toBe(false);
  });

  it('maps $mod to ctrl on win/linux', () => {
    expect(resolveMod(parseHotkey('$mod+K'), 'win')).toMatchObject({ ctrl: true, meta: false });
    expect(resolveMod(parseHotkey('$mod+K'), 'linux')).toMatchObject({ ctrl: true, meta: false });
  });

  it('preserves existing modifiers when adding mod resolution', () => {
    const r = resolveMod(parseHotkey('$mod+Shift+K'), 'win');
    expect(r).toMatchObject({ ctrl: true, shift: true });
  });

  it('is a no-op when mod is not set', () => {
    const parsed = parseHotkey('Ctrl+K');
    expect(resolveMod(parsed, 'mac')).toEqual(parsed);
  });
});

describe('matchesHotkey', () => {
  const makeEvent = (
    key: string,
    mods: { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean } = {},
  ): KeyboardEvent =>
    ({
      key,
      metaKey: Boolean(mods.meta),
      ctrlKey: Boolean(mods.ctrl),
      altKey: Boolean(mods.alt),
      shiftKey: Boolean(mods.shift),
    }) as KeyboardEvent;

  it('matches $mod+K on mac via metaKey', () => {
    const hk = parseHotkey('$mod+K');
    expect(matchesHotkey(makeEvent('k', { meta: true }), hk, 'mac')).toBe(true);
    expect(matchesHotkey(makeEvent('k', { ctrl: true }), hk, 'mac')).toBe(false);
  });

  it('matches $mod+K on win via ctrlKey', () => {
    const hk = parseHotkey('$mod+K');
    expect(matchesHotkey(makeEvent('k', { ctrl: true }), hk, 'win')).toBe(true);
    expect(matchesHotkey(makeEvent('k', { meta: true }), hk, 'win')).toBe(false);
  });

  it('rejects extra modifiers (strict semantics)', () => {
    const hk = parseHotkey('Ctrl+K');
    expect(matchesHotkey(makeEvent('k', { ctrl: true, shift: true }), hk, 'win')).toBe(false);
  });

  it('matches named keys', () => {
    const hk = parseHotkey('Escape');
    expect(matchesHotkey(makeEvent('Escape'), hk)).toBe(true);
    expect(matchesHotkey(makeEvent('Esc'), hk)).toBe(false);
  });

  it('is case-insensitive for single-letter keys', () => {
    const hk = parseHotkey('K');
    expect(matchesHotkey(makeEvent('k'), hk)).toBe(true);
    expect(matchesHotkey(makeEvent('K'), hk)).toBe(true);
  });
});

describe('platformKey / macKey', () => {
  it('returns ⌘ for cmd on mac', () => {
    expect(macKey('cmd', 'mac')).toBe('⌘');
  });

  it('returns Ctrl for cmd on win/linux', () => {
    expect(macKey('cmd', 'win')).toBe('Ctrl');
    expect(macKey('cmd', 'linux')).toBe('Ctrl');
  });

  it('handles option/alt and shift', () => {
    expect(macKey('alt', 'mac')).toBe('⌥');
    expect(macKey('alt', 'win')).toBe('Alt');
    expect(macKey('shift', 'mac')).toBe('⇧');
    expect(macKey('shift', 'win')).toBe('Shift');
  });

  it('handles directional arrows', () => {
    expect(macKey('up')).toBe('↑');
    expect(macKey('down')).toBe('↓');
    expect(macKey('left')).toBe('←');
    expect(macKey('right')).toBe('→');
  });

  it('passes unknown names through unchanged', () => {
    expect(macKey('A')).toBe('A');
    expect(macKey('F12')).toBe('F12');
  });

  it('detectHotkeyPlatform returns one of the known values', () => {
    expect(['mac', 'win', 'linux']).toContain(detectHotkeyPlatform());
  });
});

describe('filterCommands', () => {
  const sample: Command[] = [
    stubCmd('a', { label: 'Open File', category: 'File' }),
    stubCmd('b', { label: 'Save File', category: 'File', keywords: ['write', 'persist'] }),
    stubCmd('c', { label: 'Close Window', category: 'View' }),
    stubCmd('d', { label: 'Toggle Theme' }),
  ];

  it('returns all commands grouped by category when query is empty', () => {
    const sections = filterCommands(sample, { query: '' });
    expect(sections.map((s) => s.category)).toEqual(['File', 'View', null]);
  });

  it('filters by substring against labels (case-insensitive)', () => {
    const sections = filterCommands(sample, { query: 'open' });
    const flat = flattenSections(sections);
    expect(flat.map((c) => c.id)).toEqual(['a']);
  });

  it('matches keywords when matchKeywords is true (default)', () => {
    const sections = filterCommands(sample, { query: 'write' });
    const flat = flattenSections(sections);
    expect(flat.map((c) => c.id)).toEqual(['b']);
  });

  it('skips keyword matching when matchKeywords is false', () => {
    const sections = filterCommands(sample, { query: 'write', matchKeywords: false });
    expect(flattenSections(sections)).toEqual([]);
  });

  it('supports fuzzy strategy', () => {
    const sections = filterCommands(sample, { query: 'tgthm', strategy: 'fuzzy' });
    const flat = flattenSections(sections);
    expect(flat.map((c) => c.id)).toEqual(['d']);
  });

  it('supports custom filter predicate', () => {
    const sections = filterCommands(sample, {
      query: 'anything',
      strategy: 'custom',
      filterCommand: (cmd) => cmd.id === 'c',
    });
    expect(flattenSections(sections).map((c) => c.id)).toEqual(['c']);
  });

  it('throws when strategy is custom without a filterCommand', () => {
    expect(() => filterCommands(sample, { query: 'x', strategy: 'custom' })).toThrow();
  });

  it('shows disabled commands when matched + skips them otherwise (same as enabled)', () => {
    const list: Command[] = [
      ...sample,
      stubCmd('e', { label: 'Disabled Thing', disabled: true }),
    ];
    // Empty query → disabled is visible.
    expect(
      flattenSections(filterCommands(list, { query: '' })).some((c) => c.id === 'e'),
    ).toBe(true);
    // Matching query → disabled is visible.
    expect(
      flattenSections(filterCommands(list, { query: 'disab' })).map((c) => c.id),
    ).toEqual(['e']);
    // Non-matching query → disabled is NOT visible (no UX noise).
    expect(
      flattenSections(filterCommands(list, { query: 'zzz' })).some((c) => c.id === 'e'),
    ).toBe(false);
  });
});

describe('groupByCategory', () => {
  it('preserves first-encounter category order and puts uncategorized last', () => {
    const list: Command[] = [
      stubCmd('1', { category: 'B' }),
      stubCmd('2', { category: 'A' }),
      stubCmd('3'),
      stubCmd('4', { category: 'B' }),
      stubCmd('5', { category: 'A' }),
      stubCmd('6'),
    ];
    const sections = groupByCategory(list);
    expect(sections.map((s) => s.category)).toEqual(['B', 'A', null]);
    expect(sections[0]?.commands.map((c) => c.id)).toEqual(['1', '4']);
    expect(sections[1]?.commands.map((c) => c.id)).toEqual(['2', '5']);
    expect(sections[2]?.commands.map((c) => c.id)).toEqual(['3', '6']);
  });
});

describe('commandStore', () => {
  beforeEach(() => {
    commands.__reset();
  });

  it('registers and unregisters individual commands', () => {
    commands.register(stubCmd('a'));
    expect(commands.getAll().map((c) => c.id)).toEqual(['a']);
    commands.unregister('a');
    expect(commands.getAll()).toEqual([]);
  });

  it('returns an unsubscribe function from register', () => {
    const off = commands.register(stubCmd('a'));
    off();
    expect(commands.getAll()).toEqual([]);
  });

  it('registerMany registers atomically and returns a single unregister', () => {
    const off = commands.registerMany([stubCmd('a'), stubCmd('b'), stubCmd('c')]);
    expect(commands.getAll().map((c) => c.id).sort()).toEqual(['a', 'b', 'c']);
    off();
    expect(commands.getAll()).toEqual([]);
  });

  it('filters out commands whose when() returns false', () => {
    commands.register(stubCmd('a', { when: () => true }));
    commands.register(stubCmd('b', { when: () => false }));
    commands.register(stubCmd('c'));
    expect(commands.getAll().map((c) => c.id).sort()).toEqual(['a', 'c']);
  });

  it('notifies subscribers on changes', () => {
    let count = 0;
    const off = commands.subscribe(() => {
      count++;
    });
    commands.register(stubCmd('a'));
    commands.register(stubCmd('b'));
    commands.unregister('a');
    off();
    commands.register(stubCmd('c'));
    expect(count).toBe(3);
  });

  it('snapshot identity is stable until mutation', () => {
    commands.register(stubCmd('a'));
    const s1 = commands.getSnapshot();
    const s2 = commands.getSnapshot();
    expect(s1).toBe(s2);
    commands.register(stubCmd('b'));
    const s3 = commands.getSnapshot();
    expect(s3).not.toBe(s1);
  });
});

describe('palette controller', () => {
  beforeEach(() => {
    commands.__reset();
  });

  it('open/close/toggle flip the state', () => {
    expect(palette.getState().open).toBe(false);
    palette.open();
    expect(palette.getState().open).toBe(true);
    palette.close();
    expect(palette.getState().open).toBe(false);
    palette.toggle();
    expect(palette.getState().open).toBe(true);
    palette.toggle();
    expect(palette.getState().open).toBe(false);
  });

  it('pushPage opens and stacks; popPage unwinds', () => {
    palette.pushPage('theme');
    expect(palette.getState().pageStack).toEqual(['theme']);
    expect(palette.getState().open).toBe(true);
    palette.pushPage('preferences');
    expect(palette.getState().pageStack).toEqual(['theme', 'preferences']);
    palette.popPage();
    expect(palette.getState().pageStack).toEqual(['theme']);
    palette.popPage();
    expect(palette.getState().pageStack).toEqual([]);
  });

  it('close resets page stack', () => {
    palette.pushPage('theme');
    palette.close();
    expect(palette.getState().pageStack).toEqual([]);
    expect(palette.getState().query).toBe('');
  });

  it('setQuery updates only when value changes', () => {
    let count = 0;
    const off = palette.subscribe(() => {
      count++;
    });
    palette.setQuery('hello');
    palette.setQuery('hello');
    palette.setQuery('world');
    off();
    expect(count).toBe(2);
  });

  it('pushPage clears the query', () => {
    palette.setQuery('hello');
    palette.pushPage('theme');
    expect(palette.getState().query).toBe('');
  });
});
