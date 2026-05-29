import type { ReactNode } from 'react';

import type { ComboboxOption, ComboboxOptionOrGroup } from '../Combobox.types';

/**
 * Pure helper — flattens a nested `(Option | Group)[]` into a parallel array of leaf options
 * and a `groupLabels` array of the same length (each entry is either `undefined` for ungrouped
 * options or the group's label for grouped ones). Stable order: top-level entries in input
 * order, group children appended in their declared order.
 *
 * Two arrays of the same length lets the renderer interleave group-label rows + option rows
 * without ever shuffling the keyboard-nav index — same shape Mantine / Headless UI converged on.
 *
 * This is exported standalone so tests + future Combobox-like consumers (CommandPalette) can
 * reuse the exact same flattening logic.
 */
export interface FlattenedOptions<O extends ComboboxOption = ComboboxOption> {
  options: O[];
  /** Parallel to `options`: the group label for that option, or `undefined` if ungrouped. */
  groupLabels: (ReactNode | undefined)[];
}

export function flattenOptions<O extends ComboboxOption = ComboboxOption>(
  source: ComboboxOptionOrGroup<O>[] | undefined,
): FlattenedOptions<O> {
  const options: O[] = [];
  const groupLabels: (ReactNode | undefined)[] = [];
  if (!source) return { options, groupLabels };

  for (const entry of source) {
    if (isGroup(entry)) {
      for (const child of entry.children) {
        options.push(child);
        groupLabels.push(entry.label);
      }
    } else {
      options.push(entry);
      groupLabels.push(undefined);
    }
  }
  return { options, groupLabels };
}

/** Type guard so the flattener's branching is type-narrowed (no `as` casts at call site). */
function isGroup<O extends ComboboxOption>(
  entry: ComboboxOptionOrGroup<O>,
): entry is { type: 'group'; label: ReactNode; children: O[] } {
  return typeof entry === 'object' && entry !== null && (entry as { type?: string }).type === 'group';
}
