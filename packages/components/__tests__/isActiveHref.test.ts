import { describe, expect, it } from 'vitest';

import { isActiveHref } from '../src/Sidebar';

describe('isActiveHref — pure helper truth table', () => {
  it('returns false when either side is missing', () => {
    expect(isActiveHref({ current: undefined, itemHref: '/x', strategy: 'exact' })).toBe(false);
    expect(isActiveHref({ current: '/x', itemHref: undefined, strategy: 'exact' })).toBe(false);
    expect(isActiveHref({ current: '', itemHref: '/x', strategy: 'exact' })).toBe(false);
    expect(isActiveHref({ current: '/x', itemHref: '', strategy: 'exact' })).toBe(false);
  });

  describe('strategy = exact', () => {
    it('returns true when paths match', () => {
      expect(isActiveHref({ current: '/inbox', itemHref: '/inbox', strategy: 'exact' })).toBe(true);
    });

    it('normalizes trailing slashes', () => {
      expect(isActiveHref({ current: '/inbox/', itemHref: '/inbox', strategy: 'exact' })).toBe(true);
      expect(isActiveHref({ current: '/inbox', itemHref: '/inbox/', strategy: 'exact' })).toBe(true);
      expect(isActiveHref({ current: '/inbox//', itemHref: '/inbox', strategy: 'exact' })).toBe(true);
    });

    it('treats root paths correctly', () => {
      expect(isActiveHref({ current: '/', itemHref: '/', strategy: 'exact' })).toBe(true);
      expect(isActiveHref({ current: '', itemHref: '/', strategy: 'exact' })).toBe(false);
    });

    it('returns false when paths differ', () => {
      expect(isActiveHref({ current: '/inbox', itemHref: '/sent', strategy: 'exact' })).toBe(false);
      expect(isActiveHref({ current: '/inbox/42', itemHref: '/inbox', strategy: 'exact' })).toBe(
        false,
      );
    });
  });

  describe('strategy = prefix', () => {
    it('returns true on exact match', () => {
      expect(isActiveHref({ current: '/inbox', itemHref: '/inbox', strategy: 'prefix' })).toBe(true);
    });

    it('returns true when current is a child of itemHref', () => {
      expect(isActiveHref({ current: '/inbox/42', itemHref: '/inbox', strategy: 'prefix' })).toBe(
        true,
      );
      expect(
        isActiveHref({ current: '/projects/launch', itemHref: '/projects', strategy: 'prefix' }),
      ).toBe(true);
    });

    it('does NOT match partial-word prefixes (boundary check)', () => {
      // The classic bug: `/p` should not match `/photos`.
      expect(isActiveHref({ current: '/photos', itemHref: '/p', strategy: 'prefix' })).toBe(false);
      expect(isActiveHref({ current: '/inboxes', itemHref: '/inbox', strategy: 'prefix' })).toBe(
        false,
      );
    });

    it('root path "/" matches every current path', () => {
      // `/` is the universal prefix; the boundary check is special-cased.
      expect(isActiveHref({ current: '/inbox', itemHref: '/', strategy: 'prefix' })).toBe(true);
      expect(isActiveHref({ current: '/inbox/42', itemHref: '/', strategy: 'prefix' })).toBe(true);
    });

    it('returns false for unrelated paths', () => {
      expect(isActiveHref({ current: '/inbox', itemHref: '/settings', strategy: 'prefix' })).toBe(
        false,
      );
    });
  });
});
