import { describe, expect, it } from 'vitest';

import { mergeMessages } from '../../src/i18n/mergeMessages';

describe('mergeMessages', () => {
  it('returns an empty object when both inputs are undefined', () => {
    expect(mergeMessages(undefined, undefined)).toEqual({});
  });

  it('returns a shallow copy of outer when inner is undefined', () => {
    const outer = { DataGrid: { foo: 'bar' } };
    const result = mergeMessages(outer, undefined);
    expect(result).toEqual(outer);
    expect(result).not.toBe(outer);
  });

  it('returns a shallow copy of inner when outer is undefined', () => {
    const inner = { Toast: { close: 'x' } };
    const result = mergeMessages(undefined, inner);
    expect(result).toEqual(inner);
    expect(result).not.toBe(inner);
  });

  it('shallow-merges by top-level namespace key', () => {
    const outer = { DataGrid: { foo: 'a' }, Toast: { close: 'x' } };
    const inner = { Pagination: { next: 'n' } };
    expect(mergeMessages(outer, inner)).toEqual({
      DataGrid: { foo: 'a' },
      Toast: { close: 'x' },
      Pagination: { next: 'n' },
    });
  });

  it('replaces (not deep-merges) an inner namespace wholesale', () => {
    const outer = { DataGrid: { foo: 'a', bar: 'b' } };
    const inner = { DataGrid: { foo: 'OVERRIDE' } };
    // bar is gone — namespace replace, not deep merge.
    expect(mergeMessages(outer, inner)).toEqual({
      DataGrid: { foo: 'OVERRIDE' },
    });
  });

  it('never mutates its inputs', () => {
    const outer = { A: { x: 1 } };
    const inner = { B: { y: 2 } };
    const outerSnapshot = JSON.stringify(outer);
    const innerSnapshot = JSON.stringify(inner);
    mergeMessages(outer, inner);
    expect(JSON.stringify(outer)).toBe(outerSnapshot);
    expect(JSON.stringify(inner)).toBe(innerSnapshot);
  });
});
