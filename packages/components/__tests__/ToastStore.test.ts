import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '../src/Toast/toastApi';
import { ToastStore } from '../src/Toast/ToastStore';

/**
 * Store tests live in pure-JS territory — no React, no jsdom DOM nodes. They cover the
 * imperative contract that callers (axios interceptors, etc.) reach for outside React.
 *
 * The store is a module-level singleton, so each test must reset it. `__reset` is the
 * intentional escape hatch used only here.
 */

beforeEach(() => {
  ToastStore.__reset();
});

afterEach(() => {
  ToastStore.__reset();
});

describe('ToastStore — add', () => {
  it('appends a toast and assigns an id', () => {
    const id = ToastStore.add({ title: 'Hello', intent: 'neutral' });
    expect(typeof id).toBe('string');
    expect(ToastStore.getState().toasts).toHaveLength(1);
    expect(ToastStore.getState().toasts[0]).toMatchObject({
      id,
      title: 'Hello',
      intent: 'neutral',
      duration: 5000,
      dismissible: true,
    });
  });

  it('uses the caller-provided id verbatim', () => {
    const id = ToastStore.add({ id: 'save', title: 'Saving', intent: 'loading' });
    expect(id).toBe('save');
  });

  it('dedups by id — second add with same id updates in place', () => {
    const id = ToastStore.add({ id: 'save', title: 'Saving', intent: 'loading' });
    const originalCreatedAt = ToastStore.getState().toasts[0]?.createdAt;
    expect(originalCreatedAt).toBeDefined();

    const idAgain = ToastStore.add({ id: 'save', title: 'Saved!', intent: 'success' });
    expect(idAgain).toBe(id);
    expect(ToastStore.getState().toasts).toHaveLength(1);
    const t = ToastStore.getState().toasts[0]!;
    expect(t.title).toBe('Saved!');
    expect(t.intent).toBe('success');
    expect(t.createdAt).toBe(originalCreatedAt);
  });

  it('keeps insertion order for distinct ids', () => {
    ToastStore.add({ title: 'A', intent: 'neutral' });
    ToastStore.add({ title: 'B', intent: 'neutral' });
    ToastStore.add({ title: 'C', intent: 'neutral' });
    expect(ToastStore.getState().toasts.map((t) => t.title)).toEqual(['A', 'B', 'C']);
  });
});

describe('ToastStore — dismiss', () => {
  it('removes a specific toast by id', () => {
    const a = ToastStore.add({ title: 'A', intent: 'neutral' });
    const b = ToastStore.add({ title: 'B', intent: 'neutral' });
    ToastStore.dismiss(a);
    const remaining = ToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe(b);
  });

  it('clears the queue when called without an id', () => {
    ToastStore.add({ title: 'A', intent: 'neutral' });
    ToastStore.add({ title: 'B', intent: 'neutral' });
    ToastStore.dismiss();
    expect(ToastStore.getState().toasts).toHaveLength(0);
  });

  it('is a no-op when the id is unknown', () => {
    ToastStore.add({ title: 'A', intent: 'neutral' });
    const before = ToastStore.getState().toasts;
    ToastStore.dismiss('does-not-exist');
    expect(ToastStore.getState().toasts).toBe(before);
  });
});

describe('ToastStore — update', () => {
  it('patches an existing toast in place', () => {
    const id = ToastStore.add({ title: 'Saving', intent: 'loading' });
    ToastStore.update(id, { title: 'Saved', intent: 'success' });
    const t = ToastStore.getState().toasts[0]!;
    expect(t.title).toBe('Saved');
    expect(t.intent).toBe('success');
  });

  it('does not wipe fields when patch omits them', () => {
    const id = ToastStore.add({
      title: 'Saving',
      intent: 'loading',
      description: 'one moment',
    });
    ToastStore.update(id, { title: 'Saved' });
    const t = ToastStore.getState().toasts[0]!;
    expect(t.description).toBe('one moment');
  });

  it('is a no-op for unknown ids', () => {
    ToastStore.add({ title: 'A', intent: 'neutral' });
    const before = ToastStore.getState().toasts;
    ToastStore.update('does-not-exist', { title: 'Z' });
    expect(ToastStore.getState().toasts).toBe(before);
  });
});

describe('ToastStore — subscribe', () => {
  it('notifies listeners on every mutation', () => {
    const listener = vi.fn();
    const unsubscribe = ToastStore.subscribe(listener);

    ToastStore.add({ title: 'A', intent: 'neutral' });
    ToastStore.add({ title: 'B', intent: 'neutral' });
    ToastStore.dismiss();
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    ToastStore.add({ title: 'C', intent: 'neutral' });
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe('toast() facade', () => {
  it('intent aliases set the right intent', () => {
    toast.success('s');
    toast.error('e');
    toast.warning('w');
    toast.info('i');
    toast.loading('l');
    const intents = ToastStore.getState().toasts.map((t) => t.intent);
    expect(intents).toEqual(['success', 'error', 'warning', 'info', 'loading']);
  });

  it('toast.dismiss(id) removes a specific toast', () => {
    const id = toast('a');
    toast('b');
    toast.dismiss(id);
    expect(ToastStore.getState().toasts).toHaveLength(1);
  });

  it('toast.update patches the toast', () => {
    const id = toast.loading('Saving');
    toast.update(id, { title: 'Saved', intent: 'success' });
    expect(ToastStore.getState().toasts[0]).toMatchObject({
      title: 'Saved',
      intent: 'success',
    });
  });
});

describe('toast.promise', () => {
  it('updates the same toast to success when the promise resolves', async () => {
    const promise = Promise.resolve({ title: 'Hello' });
    const returned = toast.promise(promise, {
      loading: 'Saving',
      success: (data) => `Posted as ${data.title}`,
      error: 'Failed',
    });
    expect(returned).toBe(promise);

    expect(ToastStore.getState().toasts).toHaveLength(1);
    expect(ToastStore.getState().toasts[0]!.intent).toBe('loading');

    await promise;
    // Microtasks may be queued behind the resolver; flush them.
    await Promise.resolve();
    await Promise.resolve();

    const final = ToastStore.getState().toasts[0]!;
    expect(final.intent).toBe('success');
    expect(final.title).toBe('Posted as Hello');
  });

  it('updates the same toast to error when the promise rejects', async () => {
    const promise = Promise.reject(new Error('Boom'));
    const safe = promise.catch((e) => e);
    toast.promise(promise, {
      loading: 'Working',
      success: 'Done',
      error: (err) => `Failed: ${(err as Error).message}`,
    });
    await safe;
    await Promise.resolve();
    await Promise.resolve();

    const final = ToastStore.getState().toasts[0]!;
    expect(final.intent).toBe('error');
    expect(final.title).toBe('Failed: Boom');
  });

  it('returns the original promise so the caller can await it', async () => {
    const original = Promise.resolve(42);
    const returned = toast.promise(original, {
      loading: 'Working',
      success: 'Done',
      error: 'Oops',
    });
    expect(returned).toBe(original);
    await expect(returned).resolves.toBe(42);
  });
});
