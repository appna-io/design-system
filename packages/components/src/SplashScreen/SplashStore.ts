import type { SplashScreenItem, SplashShowOptions } from './SplashScreen.types';

/**
 * Module-level event emitter that powers the imperative `splash(…)` API. **No React imports.**
 * That single constraint is why the facade works from any JavaScript context — a fetch
 * interceptor, a service-worker callback, an async action, the global error handler.
 * `<SplashProvider>` subscribes via the React boundary in `useSplashState`; everything else is
 * plain data.
 *
 * Unlike the Toast queue, the splash is **single-slot**. Only one splash can be visible at a
 * time. Calling `show()` while a splash is already active replaces the current record (after
 * firing its `onHide` callback). Calling `show({ id })` with the same id updates in place —
 * the common pattern for driving determinate progress.
 */

type Listener = (state: SplashState) => void;

export interface SplashState {
  /** The currently visible splash, or `null` when nothing is shown. */
  current: SplashScreenItem | null;
}

const INITIAL_STATE: SplashState = { current: null };
let state: SplashState = INITIAL_STATE;
const listeners = new Set<Listener>();

let idSeed = 0;
function generateId(): string {
  // Module-local monotonic id. Not cryptographic — splash records don't need RFC4122
  // strength, and we want to avoid a `crypto` dependency in non-browser contexts (SSR, Edge).
  // Time-prefix prevents collisions across SSR + hydration of two separate hosts mounted in
  // the same window during fast-refresh.
  idSeed += 1;
  return `splash_${Date.now().toString(36)}_${idSeed.toString(36)}`;
}

function emit(): void {
  // Listeners is iterated by `useSyncExternalStore`'s `getSnapshot` polling, so we don't need
  // to defer to microtask — the React scheduler batches the resulting renders.
  listeners.forEach((listener) => listener(state));
}

/**
 * Strip `undefined`-valued entries from a partial — so a patch like `{ progress: undefined }`
 * doesn't accidentally wipe out an existing progress value. The store treats `undefined` as
 * "keep current"; only explicit values overwrite.
 */
function mergeItem(
  current: SplashScreenItem,
  patch: Partial<SplashShowOptions>,
): SplashScreenItem {
  const merged = { ...current } as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    merged[key] = value;
  }
  return merged as unknown as SplashScreenItem;
}

export const SplashStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): SplashState {
    return state;
  },

  /**
   * Show (or replace, or update) the active splash. Three resolution paths:
   *
   * 1. **Update** — `input.id` matches the active record → patch in place, preserve `createdAt`
   *    so the auto-dismiss timer in the host stays anchored to the original creation moment.
   * 2. **Replace** — a different splash is already active → fire the active record's `onHide`,
   *    then install the new record.
   * 3. **Insert** — nothing active → install the new record.
   */
  show(input: SplashShowOptions): string {
    const id = input.id ?? generateId();
    const existing = state.current;

    if (existing && existing.id === id) {
      // Update path — patch the active record. createdAt stays the same.
      state = { current: mergeItem(existing, input) };
      emit();
      return id;
    }

    if (existing) {
      // Replace path — fire the predecessor's onHide so consumers can clean up before the
      // new splash takes over.
      try {
        existing.onHide?.(existing.id);
      } catch {
        /* swallow — host shouldn't crash because a callback threw */
      }
    }

    const next: SplashScreenItem = {
      id,
      variant: input.variant,
      color: input.color,
      backdrop: input.backdrop,
      gradient: input.gradient,
      logo: input.logo,
      showLogo: input.showLogo,
      title: input.title,
      subtitle: input.subtitle,
      footer: input.footer,
      indicator: input.indicator,
      showSpinner: input.showSpinner,
      showProgress: input.showProgress,
      progress: input.progress,
      loadingLabel: input.loadingLabel,
      closeOnClick: input.closeOnClick,
      closeOnEscape: input.closeOnEscape,
      sx: input.sx,
      style: input.style,
      className: input.className,
      timeout: input.timeout,
      onTimeout: input.onTimeout,
      onHide: input.onHide,
      createdAt: Date.now(),
    };
    state = { current: next };
    emit();
    return id;
  },

  hide(id?: string): void {
    const active = state.current;
    if (!active) return;
    if (id !== undefined && active.id !== id) return;
    try {
      active.onHide?.(active.id);
    } catch {
      /* swallow */
    }
    state = { current: null };
    emit();
  },

  update(id: string, patch: Partial<SplashShowOptions>): void {
    const active = state.current;
    if (!active || active.id !== id) return;
    state = { current: mergeItem(active, patch) };
    emit();
  },

  isActive(id?: string): boolean {
    const active = state.current;
    if (!active) return false;
    if (id === undefined) return true;
    return active.id === id;
  },

  /**
   * Test helper. Not exported from the package's public surface — but the store is a module
   * singleton, so unit tests need a reset hook to keep cases independent.
   */
  __reset(): void {
    state = INITIAL_STATE;
    idSeed = 0;
    emit();
  },
};