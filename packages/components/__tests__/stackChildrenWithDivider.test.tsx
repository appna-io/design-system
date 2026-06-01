import { render } from '@testing-library/react';
import { Children } from 'react';
import { describe, expect, it } from 'vitest';

import { Spacer } from '../src/Stack';
import {
  isSpacer,
  SPACER_MARKER,
  stackChildrenWithDivider,
} from '../src/Stack/stackChildrenWithDivider';

describe('stackChildrenWithDivider — pure transform', () => {
  it('returns children unchanged when divider is undefined', () => {
    const children = [<span key="a">a</span>, <span key="b">b</span>];
    expect(stackChildrenWithDivider(children, undefined)).toBe(children);
  });

  it('returns children unchanged when divider is false / null', () => {
    const children = [<span key="a">a</span>, <span key="b">b</span>];
    expect(stackChildrenWithDivider(children, null)).toBe(children);
    expect(stackChildrenWithDivider(children, false)).toBe(children);
  });

  it('inserts n−1 dividers for n non-Spacer children', () => {
    const out = stackChildrenWithDivider(
      [<span key="a">a</span>, <span key="b">b</span>, <span key="c">c</span>],
      <hr />,
    );
    // 3 children + 2 dividers = 5 nodes
    expect(Children.count(out)).toBe(5);
  });

  it('skips inserting dividers adjacent to a Spacer', () => {
    const out = stackChildrenWithDivider(
      [<span key="a">a</span>, <Spacer key="s" />, <span key="b">b</span>],
      <hr />,
    );
    // 2 spans + 1 spacer = 3 nodes; no dividers because the spacer touches both edges.
    expect(Children.count(out)).toBe(3);
  });

  it('emits 0 dividers for 0 or 1 children', () => {
    expect(Children.count(stackChildrenWithDivider([], <hr />))).toBe(0);
    expect(Children.count(stackChildrenWithDivider(<span>only</span>, <hr />))).toBe(1);
  });

  it('filters falsy children before computing positions', () => {
    const out = stackChildrenWithDivider(
      [<span key="a">a</span>, false, null, undefined, <span key="b">b</span>],
      <hr />,
    );
    // After filtering: 2 spans → 1 divider → 3 nodes.
    expect(Children.count(out)).toBe(3);
  });

  it('wraps primitive dividers in a keyed Fragment', () => {
    const out = stackChildrenWithDivider(
      [<span key="a">a</span>, <span key="b">b</span>],
      '·',
    );
    const arr = Children.toArray(out);
    expect(arr).toHaveLength(3);
    // The wrapping Fragment should produce textual content "·" between the spans.
    const { container } = render(<>{out}</>);
    expect(container.textContent).toBe('a·b');
  });

  it('clones React element dividers with stable keys per slot', () => {
    const out = stackChildrenWithDivider(
      [<span key="a">a</span>, <span key="b">b</span>, <span key="c">c</span>],
      <hr data-role="divider" />,
    );
    const arr = Children.toArray(out);
    // Positions 1 and 3 are dividers; their keys must be unique + stable.
    const dividerA = arr[1];
    const dividerB = arr[3];
    expect((dividerA as { key: string }).key).toMatch(/__sds-divider-/);
    expect((dividerB as { key: string }).key).toMatch(/__sds-divider-/);
    expect((dividerA as { key: string }).key).not.toBe((dividerB as { key: string }).key);
  });
});

describe('isSpacer / SPACER_MARKER', () => {
  it('returns true for <Spacer> elements', () => {
    expect(isSpacer(<Spacer />)).toBe(true);
  });

  it('returns false for plain element types', () => {
    expect(isSpacer(<span />)).toBe(false);
    expect(isSpacer(<div />)).toBe(false);
  });

  it('returns false for primitives + falsy values', () => {
    expect(isSpacer('text')).toBe(false);
    expect(isSpacer(42)).toBe(false);
    expect(isSpacer(null)).toBe(false);
    expect(isSpacer(undefined)).toBe(false);
    expect(isSpacer(false)).toBe(false);
  });

  it('SPACER_MARKER stays stable across imports', () => {
    expect(SPACER_MARKER).toBe('__sds_spacer');
  });
});