/**
 * `ConfirmStore` + the `confirm(…)` facade — the pure half of the Confirm family (#13).
 *
 * The store is a module singleton that hands out a `Promise<boolean>` per dialog, so the
 * interesting failures are all about **promise settlement**, not rendering:
 *
 *   - a displaced dialog whose promise never settles leaves its `await` site hung forever, and
 *     nothing in the UI shows that it happened;
 *   - a stale event handler resolving the *wrong* record silently returns the previous dialog's
 *     answer to the new dialog's caller, which is a correctness bug you'd never see in a snapshot;
 *   - the documented "never rejects" guarantee is the reason callers write bare `await confirm(…)`
 *     with no try/catch, so a throw escaping the store would surface as an unhandled rejection in
 *     someone else's code.
 *
 * These are asserted directly rather than through a rendered dialog, because they are properties
 * of the store and hold regardless of what the surface does with them.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfirmStore } from '../src/Confirm/ConfirmStore';
import { confirm } from '../src/Confirm/confirmApi';

afterEach(() => {
  ConfirmStore.__reset();
});

describe('ConfirmStore — lifecycle', () => {
  it('starts closed', () => {
    expect(ConfirmStore.getState().current).toBeNull();
    expect(ConfirmStore.isOpen()).toBe(false);
  });

  it('opens with the given options and a generated id', () => {
    const { id } = ConfirmStore.open({ title: 'Delete project?', variant: 'error' });
    const current = ConfirmStore.getState().current!;

    expect(ConfirmStore.isOpen()).toBe(true);
    expect(current.id).toBe(id);
    expect(current.title).toBe('Delete project?');
    expect(current.variant).toBe('error');
    expect(typeof current.createdAt).toBe('number');
  });

  it('resolves true on confirm and false on cancel, then tears down', async () => {
    const a = ConfirmStore.open({});
    ConfirmStore.close(true);
    await expect(a.promise).resolves.toBe(true);
    expect(ConfirmStore.isOpen()).toBe(false);

    const b = ConfirmStore.open({});
    ConfirmStore.close(false);
    await expect(b.promise).resolves.toBe(false);
    expect(ConfirmStore.isOpen()).toBe(false);
  });

  it('close() on nothing open is a no-op, not a throw', () => {
    expect(() => ConfirmStore.close(true)).not.toThrow();
    expect(ConfirmStore.getState().current).toBeNull();
  });

  it('generates a distinct id per dialog', () => {
    const first = ConfirmStore.open({}).id;
    ConfirmStore.close(false);
    const second = ConfirmStore.open({}).id;
    expect(first).not.toBe(second);
  });
});

describe('ConfirmStore — single slot', () => {
  it('settles the displaced dialog with false rather than leaving it pending', async () => {
    // The failure this guards against is invisible: an unsettled promise means the first
    // caller's `await confirm(...)` hangs forever with no error anywhere.
    const first = ConfirmStore.open({ title: 'first' });
    const second = ConfirmStore.open({ title: 'second' });

    await expect(first.promise).resolves.toBe(false);
    expect(ConfirmStore.getState().current!.id).toBe(second.id);
    expect(ConfirmStore.getState().current!.title).toBe('second');
  });

  it('keeps only one dialog open no matter how many are pushed', async () => {
    const promises = [
      ConfirmStore.open({ title: 'a' }).promise,
      ConfirmStore.open({ title: 'b' }).promise,
      ConfirmStore.open({ title: 'c' }).promise,
    ];
    expect(ConfirmStore.getState().current!.title).toBe('c');

    ConfirmStore.close(true);
    await expect(Promise.all(promises)).resolves.toEqual([false, false, true]);
  });

  it('survives a resolver that throws — one bad consumer must not break the host', async () => {
    const first = ConfirmStore.open({});
    // Simulate a consumer whose `.then` chain throws synchronously inside resolve.
    ConfirmStore.getState().current!.resolve = () => {
      throw new Error('consumer blew up');
    };
    expect(() => ConfirmStore.open({ title: 'next' })).not.toThrow();
    expect(ConfirmStore.getState().current!.title).toBe('next');
    void first;
  });
});

describe('ConfirmStore — id guard', () => {
  it('ignores a close() aimed at a dialog that is no longer active', async () => {
    // A stale handler (an unmounted button, a delayed keypress) firing after a new dialog took
    // over would otherwise hand the previous answer to the wrong caller.
    const first = ConfirmStore.open({ title: 'first' });
    const second = ConfirmStore.open({ title: 'second' });
    await expect(first.promise).resolves.toBe(false);

    ConfirmStore.close(true, first.id); // stale — must not touch `second`
    expect(ConfirmStore.isOpen()).toBe(true);
    expect(ConfirmStore.getState().current!.id).toBe(second.id);

    ConfirmStore.close(true, second.id);
    await expect(second.promise).resolves.toBe(true);
  });

  it('closes without an id (the unguarded path host code uses for Escape / backdrop)', async () => {
    const { promise } = ConfirmStore.open({});
    ConfirmStore.close(false);
    await expect(promise).resolves.toBe(false);
  });
});

describe('ConfirmStore — subscription', () => {
  it('notifies subscribers on open and on close, and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = ConfirmStore.subscribe(listener);

    ConfirmStore.open({});
    ConfirmStore.close(true);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    ConfirmStore.open({});
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('hands each listener the current state', () => {
    // `title` is `ReactNode`, so narrow to the string case these fixtures actually use.
    const seen: Array<string | null> = [];
    const unsubscribe = ConfirmStore.subscribe((s) =>
      seen.push(typeof s.current?.title === 'string' ? s.current.title : null),
    );

    ConfirmStore.open({ title: 'open me' });
    ConfirmStore.close(true);
    unsubscribe();

    expect(seen).toEqual(['open me', null]);
  });

  it('changes snapshot identity only when the state actually changes', () => {
    // `useSyncExternalStore` compares by identity; a fresh object every read would re-render
    // the provider on every tick.
    const a = ConfirmStore.getState();
    expect(ConfirmStore.getState()).toBe(a);

    ConfirmStore.open({});
    expect(ConfirmStore.getState()).not.toBe(a);
  });
});

describe('confirm facade', () => {
  it('display() resolves with the outcome and never rejects', async () => {
    const promise = confirm.display({ title: 'ok?' });
    ConfirmStore.close(true);
    await expect(promise).resolves.toBe(true);
  });

  it('each variant alias tags the record and still returns a promise', async () => {
    for (const variant of ['info', 'success', 'warning', 'error'] as const) {
      const promise = confirm[variant]({ title: variant });
      expect(ConfirmStore.getState().current!.variant).toBe(variant);
      ConfirmStore.close(false);
      await expect(promise).resolves.toBe(false);
    }
  });

  it('cancel() settles the open dialog with false', async () => {
    const promise = confirm.display({});
    confirm.cancel();
    await expect(promise).resolves.toBe(false);
    expect(confirm.isOpen()).toBe(false);
  });

  it('cancel() with nothing open does not throw', () => {
    expect(() => confirm.cancel()).not.toThrow();
  });

  it('isOpen() tracks the store', () => {
    expect(confirm.isOpen()).toBe(false);
    void confirm.display({});
    expect(confirm.isOpen()).toBe(true);
  });
});

describe('ConfirmStore — __reset', () => {
  it('settles a pending dialog so a test that resets mid-flight cannot hang', async () => {
    const { promise } = ConfirmStore.open({});
    ConfirmStore.__reset();
    await expect(promise).resolves.toBe(false);
    expect(ConfirmStore.isOpen()).toBe(false);
  });
});
