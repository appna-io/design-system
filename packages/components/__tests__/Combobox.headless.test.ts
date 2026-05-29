import { describe, expect, it } from 'vitest';

import { filterStrategies, fuzzyMatch } from '../src/Combobox/headless/filterStrategies';
import { flattenOptions } from '../src/Combobox/headless/flattenOptions';

/**
 * Pure unit tests for Combobox's headless helpers. These have no DOM, no React rendering, no
 * fake timers — every test is a plain function-of-data check. Lets us guarantee the filtering /
 * flattening contracts independently of how the React component wires them together.
 */

describe('flattenOptions', () => {
  it('returns empty arrays when source is undefined', () => {
    const flat = flattenOptions<{ value: string; label: string }>(undefined);
    expect(flat.options).toEqual([]);
    expect(flat.groupLabels).toEqual([]);
  });

  it('passes a flat option list through unchanged with undefined group labels', () => {
    const source = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const flat = flattenOptions(source);
    expect(flat.options).toEqual(source);
    expect(flat.groupLabels).toEqual([undefined, undefined]);
  });

  it('flattens a single group with its label parallel to each child', () => {
    const flat = flattenOptions([
      {
        type: 'group',
        label: 'Vowels',
        children: [
          { value: 'a', label: 'A' },
          { value: 'e', label: 'E' },
        ],
      },
    ]);
    expect(flat.options.map((o) => o.value)).toEqual(['a', 'e']);
    expect(flat.groupLabels).toEqual(['Vowels', 'Vowels']);
  });

  it('preserves order across mixed groups and ungrouped entries', () => {
    const flat = flattenOptions([
      { value: 'top', label: 'Top' },
      {
        type: 'group',
        label: 'Group',
        children: [
          { value: 'g1', label: 'G1' },
          { value: 'g2', label: 'G2' },
        ],
      },
      { value: 'tail', label: 'Tail' },
    ]);
    expect(flat.options.map((o) => o.value)).toEqual(['top', 'g1', 'g2', 'tail']);
    expect(flat.groupLabels).toEqual([undefined, 'Group', 'Group', undefined]);
  });
});

describe('filterStrategies.substring', () => {
  it('is case-insensitive', () => {
    expect(filterStrategies.substring('Hello World', 'WORLD')).toBe(true);
    expect(filterStrategies.substring('Hello World', 'hello')).toBe(true);
  });
  it('returns false when no match', () => {
    expect(filterStrategies.substring('Apple', 'xyz')).toBe(false);
  });
  it('matches empty queries (callers short-circuit)', () => {
    expect(filterStrategies.substring('Apple', '')).toBe(true);
  });
});

describe('filterStrategies.startsWith', () => {
  it('matches only when label starts with query (case-insensitive)', () => {
    expect(filterStrategies.startsWith('Banana', 'ban')).toBe(true);
    expect(filterStrategies.startsWith('Banana', 'BAN')).toBe(true);
    expect(filterStrategies.startsWith('Banana', 'ana')).toBe(false);
  });
});

describe('filterStrategies.fuzzy / fuzzyMatch', () => {
  it('matches exact substrings', () => {
    expect(fuzzyMatch('JavaScript', 'java')).toBe(true);
  });
  it('matches non-contiguous subsequences in order', () => {
    expect(fuzzyMatch('JavaScript', 'jvst')).toBe(true);
    expect(fuzzyMatch('Reload Window', 'rldw')).toBe(true);
  });
  it('rejects out-of-order chars', () => {
    expect(fuzzyMatch('JavaScript', 'sj')).toBe(false);
  });
  it('rejects missing chars', () => {
    expect(fuzzyMatch('Apple', 'xz')).toBe(false);
  });
  it('matches empty queries', () => {
    expect(fuzzyMatch('whatever', '')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(fuzzyMatch('JavaScript', 'JS')).toBe(true);
  });
});
