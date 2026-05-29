import { beforeEach, describe, expect, it } from 'vitest';
import {
  __clearRegistry,
  getComponentMeta,
  getRegisteredComponents,
  registerComponent,
} from '../src/registry';

describe('registry', () => {
  beforeEach(() => {
    __clearRegistry();
  });

  it('starts empty', () => {
    expect(getRegisteredComponents()).toEqual([]);
  });

  it('registers and retrieves components', () => {
    registerComponent({ name: 'button', displayName: 'Button', category: 'Inputs' });
    expect(getComponentMeta('button')).toEqual({
      name: 'button',
      displayName: 'Button',
      category: 'Inputs',
    });
  });

  it('returns components sorted by name', () => {
    registerComponent({ name: 'card', displayName: 'Card' });
    registerComponent({ name: 'button', displayName: 'Button' });
    registerComponent({ name: 'input', displayName: 'Input' });
    expect(getRegisteredComponents().map((c) => c.name)).toEqual(['button', 'card', 'input']);
  });

  it('replaces on duplicate name', () => {
    registerComponent({ name: 'button', displayName: 'Button v1' });
    registerComponent({ name: 'button', displayName: 'Button v2' });
    expect(getComponentMeta('button')?.displayName).toBe('Button v2');
    expect(getRegisteredComponents()).toHaveLength(1);
  });

  it('returns undefined for unknown name', () => {
    expect(getComponentMeta('nope')).toBeUndefined();
  });
});
