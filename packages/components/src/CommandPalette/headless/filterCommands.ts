import { filterStrategies, type FilterStrategyFn } from '../../Combobox/headless/filterStrategies';

import type { Command } from './commandStore';

/**
 * Filter + group result shape consumed by `<CommandPalette>` to render `<Section>` chunks. A
 * `Section` with `category: null` is the "ungrouped" bucket (commands without `category`); the
 * palette renders it last, below all named categories.
 */
export interface CommandSection {
  /** Category name; `null` for the ungrouped bucket. */
  category: string | null;
  commands: Command[];
}

export interface FilterCommandsOptions {
  query: string;
  /** Default: `'substring'`. */
  strategy?: 'substring' | 'fuzzy' | 'startsWith' | 'custom';
  /** Required when `strategy === 'custom'`. */
  filterCommand?: (cmd: Command, query: string) => boolean;
  /** Default: `true`. Also match against `keywords` array. */
  matchKeywords?: boolean;
}

/**
 * Pure: filter the command list against the query, then group by category. Within each
 * category the original input order is preserved (callers typically pre-sort by recency or
 * popularity before passing in).
 *
 * Empty query → returns all commands grouped by category. Non-empty query with no matches →
 * returns an empty array (caller renders the empty state).
 *
 * The custom predicate path bypasses keyword matching entirely — consumers wanting custom
 * filtering have full control and can implement keyword logic themselves.
 */
export function filterCommands(
  commandList: Command[],
  opts: FilterCommandsOptions,
): CommandSection[] {
  const { query, strategy = 'substring', filterCommand, matchKeywords = true } = opts;

  // Disabled commands participate in filtering on the same terms as enabled ones (they would
  // be a UX noise if they appeared in every search regardless). They just render visually
  // muted + skip selection when matched.
  const filtered = commandList.filter((cmd) => {
    if (!query) return true;
    if (strategy === 'custom') {
      if (!filterCommand) {
        throw new Error('[apx-ds] filterCommands: strategy "custom" requires filterCommand.');
      }
      return filterCommand(cmd, query);
    }
    const fn: FilterStrategyFn = filterStrategies[strategy];
    if (fn(cmd.label, query)) return true;
    if (matchKeywords && cmd.keywords && cmd.keywords.length > 0) {
      return cmd.keywords.some((kw) => fn(kw, query));
    }
    return false;
  });

  return groupByCategory(filtered);
}

/**
 * Group commands by `category`. Named categories appear in first-encounter order; the
 * `null`-category bucket is appended last (so "uncategorized" naturally sits at the bottom).
 */
export function groupByCategory(commandList: Command[]): CommandSection[] {
  const byCategory = new Map<string, Command[]>();
  const uncategorized: Command[] = [];

  for (const cmd of commandList) {
    if (cmd.category) {
      const existing = byCategory.get(cmd.category);
      if (existing) existing.push(cmd);
      else byCategory.set(cmd.category, [cmd]);
    } else {
      uncategorized.push(cmd);
    }
  }

  const sections: CommandSection[] = [];
  byCategory.forEach((cmds, category) => {
    sections.push({ category, commands: cmds });
  });
  if (uncategorized.length > 0) {
    sections.push({ category: null, commands: uncategorized });
  }
  return sections;
}

/**
 * Flatten sections back into a single ordered command array — used by keyboard navigation
 * (`useListKeyboard` consumes a flat list, not sections). Order matches what the user sees
 * top-to-bottom on screen.
 */
export function flattenSections(sections: CommandSection[]): Command[] {
  const out: Command[] = [];
  for (const section of sections) {
    for (const cmd of section.commands) {
      out.push(cmd);
    }
  }
  return out;
}