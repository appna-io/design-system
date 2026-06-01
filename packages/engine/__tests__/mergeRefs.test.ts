import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { mergeRefs } from '../src/mergeRefs';

describe('mergeRefs', () => {
  it('assigns the same node to every object ref', () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = createRef<HTMLDivElement>();
    const merged = mergeRefs<HTMLDivElement>(ref1, ref2);
    const node = document.createElement('div') as HTMLDivElement;
    merged(node);
    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it('invokes every callback ref with the node', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const merged = mergeRefs<HTMLDivElement>(cb1, cb2);
    const node = document.createElement('div') as HTMLDivElement;
    merged(node);
    expect(cb1).toHaveBeenCalledWith(node);
    expect(cb2).toHaveBeenCalledWith(node);
  });

  it('mixes object refs and callback refs in one call', () => {
    const ref = createRef<HTMLDivElement>();
    const cb = vi.fn();
    const merged = mergeRefs<HTMLDivElement>(ref, cb);
    const node = document.createElement('div') as HTMLDivElement;
    merged(node);
    expect(ref.current).toBe(node);
    expect(cb).toHaveBeenCalledWith(node);
  });

  it('skips falsy refs (undefined / null) without throwing', () => {
    const ref = createRef<HTMLDivElement>();
    const cb = vi.fn();
    const merged = mergeRefs<HTMLDivElement>(undefined, ref, null as never, cb);
    const node = document.createElement('div') as HTMLDivElement;
    expect(() => merged(node)).not.toThrow();
    expect(ref.current).toBe(node);
    expect(cb).toHaveBeenCalledWith(node);
  });

  it('passes null on unmount to every ref', () => {
    const ref = createRef<HTMLDivElement>();
    const cb = vi.fn();
    const merged = mergeRefs<HTMLDivElement>(ref, cb);
    const node = document.createElement('div') as HTMLDivElement;
    merged(node);
    merged(null);
    expect(ref.current).toBeNull();
    expect(cb).toHaveBeenLastCalledWith(null);
  });

  it('returns a stable callback shape (not the input refs)', () => {
    const merged = mergeRefs<HTMLDivElement>();
    expect(typeof merged).toBe('function');
  });
});