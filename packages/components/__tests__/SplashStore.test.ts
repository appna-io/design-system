/**
 * `SplashStore` + the `splash(…)` facade — the pure half of the SplashScreen family (#13).
 *
 * The store's whole reason for existing is the determinate-progress pattern:
 *
 *   const id = splash({ showProgress: true, progress: 0 });
 *   for await (const chunk of upload()) splash.update(id, { progress: chunk.percent });
 *   splash.hide(id);
 *
 * Everything sharp lives in that loop. `show()` has three different behaviours depending on
 * whether the id matches (update / replace / insert), `undefined` in a patch has to mean "keep"
 * rather than "clear" — otherwise a partial update silently wipes the title mid-upload — and
 * `createdAt` has to survive an update, because the host anchors its auto-dismiss timer to it: if
 * it were refreshed on every progress tick, a splash with a `timeout` would never dismiss.
 *
 * None of those are visible in a render, which is why they're asserted here.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { SplashStore } from '../src/SplashScreen/SplashStore';
import { splash } from '../src/SplashScreen/splashApi';

afterEach(() => {
  SplashStore.__reset();
});

describe('SplashStore — lifecycle', () => {
  it('starts inactive', () => {
    expect(SplashStore.getState().current).toBeNull();
    expect(SplashStore.isActive()).toBe(false);
  });

  it('shows a record and returns its id', () => {
    const id = SplashStore.show({ title: 'Loading workspace…' });
    const current = SplashStore.getState().current!;

    expect(current.id).toBe(id);
    expect(current.title).toBe('Loading workspace…');
    expect(typeof current.createdAt).toBe('number');
    expect(SplashStore.isActive()).toBe(true);
  });

  it('honours a caller-supplied id instead of generating one', () => {
    expect(SplashStore.show({ id: 'boot' })).toBe('boot');
    expect(SplashStore.getState().current!.id).toBe('boot');
  });

  it('hides, and hiding nothing is a no-op', () => {
    SplashStore.show({});
    SplashStore.hide();
    expect(SplashStore.isActive()).toBe(false);
    expect(() => SplashStore.hide()).not.toThrow();
  });

  it('generates a distinct id per splash', () => {
    const first = SplashStore.show({});
    SplashStore.hide();
    expect(SplashStore.show({})).not.toBe(first);
  });
});

describe('SplashStore — show() resolves three ways', () => {
  it('UPDATE: a matching id patches in place and preserves createdAt', () => {
    // The host anchors its auto-dismiss timer to `createdAt`. If a progress tick refreshed it,
    // a splash with a `timeout` would keep pushing its own deadline out and never dismiss.
    const id = SplashStore.show({ title: 'Uploading', progress: 0 });
    const createdAt = SplashStore.getState().current!.createdAt;

    SplashStore.show({ id, progress: 42 });
    const current = SplashStore.getState().current!;

    expect(current.id).toBe(id);
    expect(current.progress).toBe(42);
    expect(current.title).toBe('Uploading');
    expect(current.createdAt).toBe(createdAt);
  });

  it('REPLACE: a different splash fires the predecessor’s onHide, then takes over', () => {
    const onHide = vi.fn();
    const first = SplashStore.show({ title: 'first', onHide });
    SplashStore.show({ title: 'second' });

    expect(onHide).toHaveBeenCalledWith(first);
    expect(SplashStore.getState().current!.title).toBe('second');
  });

  it('INSERT: with nothing active it just installs', () => {
    SplashStore.show({ title: 'only' });
    expect(SplashStore.getState().current!.title).toBe('only');
  });

  it('stays single-slot however many are pushed', () => {
    SplashStore.show({ title: 'a' });
    SplashStore.show({ title: 'b' });
    SplashStore.show({ title: 'c' });
    expect(SplashStore.getState().current!.title).toBe('c');
  });

  it('survives an onHide that throws — one bad callback must not break the host', () => {
    SplashStore.show({
      onHide: () => {
        throw new Error('consumer blew up');
      },
    });
    expect(() => SplashStore.show({ title: 'next' })).not.toThrow();
    expect(SplashStore.getState().current!.title).toBe('next');
  });
});

describe('SplashStore — update()', () => {
  it('patches the active record', () => {
    const id = SplashStore.show({ title: 'Uploading', progress: 0 });
    SplashStore.update(id, { progress: 75, subtitle: 'almost there' });

    const current = SplashStore.getState().current!;
    expect(current.progress).toBe(75);
    expect(current.subtitle).toBe('almost there');
    expect(current.title).toBe('Uploading');
  });

  it('treats undefined as "keep", not "clear"', () => {
    // `splash.update(id, { progress: next })` on an object built from optional fields carries
    // `undefined` for everything else. If those overwrote, a progress tick would silently wipe
    // the title and subtitle mid-upload.
    const id = SplashStore.show({ title: 'Uploading', subtitle: 'stage 1', progress: 10 });
    SplashStore.update(id, { progress: 20, title: undefined, subtitle: undefined });

    const current = SplashStore.getState().current!;
    expect(current.progress).toBe(20);
    expect(current.title).toBe('Uploading');
    expect(current.subtitle).toBe('stage 1');
  });

  it('ignores a patch aimed at a splash that is no longer active', () => {
    // A late progress callback from a cancelled upload must not write into whatever replaced it.
    const stale = SplashStore.show({ title: 'stale' });
    SplashStore.show({ title: 'current', progress: 0 });

    SplashStore.update(stale, { progress: 99 });
    expect(SplashStore.getState().current!.progress).toBe(0);
    expect(SplashStore.getState().current!.title).toBe('current');
  });

  it('ignores a patch when nothing is active', () => {
    expect(() => SplashStore.update('gone', { progress: 1 })).not.toThrow();
    expect(SplashStore.getState().current).toBeNull();
  });
});

describe('SplashStore — hide() and isActive()', () => {
  it('fires onHide with the record id', () => {
    const onHide = vi.fn();
    const id = SplashStore.show({ onHide });
    SplashStore.hide();
    expect(onHide).toHaveBeenCalledWith(id);
  });

  it('ignores a hide aimed at a splash that is no longer active', () => {
    const stale = SplashStore.show({ title: 'stale' });
    SplashStore.show({ title: 'current' });

    SplashStore.hide(stale);
    expect(SplashStore.isActive()).toBe(true);
    expect(SplashStore.getState().current!.title).toBe('current');
  });

  it('survives an onHide that throws', () => {
    SplashStore.show({
      onHide: () => {
        throw new Error('consumer blew up');
      },
    });
    expect(() => SplashStore.hide()).not.toThrow();
    expect(SplashStore.isActive()).toBe(false);
  });

  it('isActive(id) answers about that specific record', () => {
    const id = SplashStore.show({});
    expect(SplashStore.isActive(id)).toBe(true);
    expect(SplashStore.isActive('someone-else')).toBe(false);
    SplashStore.hide();
    expect(SplashStore.isActive(id)).toBe(false);
  });
});

describe('SplashStore — subscription', () => {
  it('notifies on show, update and hide, and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = SplashStore.subscribe(listener);

    const id = SplashStore.show({});
    SplashStore.update(id, { progress: 1 });
    SplashStore.hide();
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    SplashStore.show({});
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('changes snapshot identity only when the state actually changes', () => {
    // `useSyncExternalStore` compares by identity — a fresh object per read would re-render the
    // provider on every tick of an upload.
    const a = SplashStore.getState();
    expect(SplashStore.getState()).toBe(a);

    SplashStore.show({});
    expect(SplashStore.getState()).not.toBe(a);
  });
});

describe('splash facade', () => {
  it('is callable and also exposes show()', () => {
    const id = splash({ title: 'callable' });
    expect(SplashStore.getState().current!.title).toBe('callable');
    expect(splash.isActive(id)).toBe(true);

    splash.show({ id, title: 'via show' });
    expect(SplashStore.getState().current!.title).toBe('via show');
  });

  it('each variant alias tags the record', () => {
    for (const variant of ['fade', 'pulse', 'gradient', 'particles', 'wave'] as const) {
      splash[variant]({ title: variant });
      expect(SplashStore.getState().current!.variant).toBe(variant);
    }
  });

  it('drives the documented progress loop end to end', () => {
    const id = splash({ title: 'Uploading', showProgress: true, progress: 0 });
    for (const percent of [25, 50, 75, 100]) {
      splash.update(id, { progress: percent });
    }
    expect(SplashStore.getState().current!.progress).toBe(100);
    expect(SplashStore.getState().current!.title).toBe('Uploading');

    splash.hide(id);
    expect(splash.isActive()).toBe(false);
  });

  it('hide() and update() with nothing active do not throw', () => {
    expect(() => splash.hide()).not.toThrow();
    expect(() => splash.update('gone', {})).not.toThrow();
  });
});
