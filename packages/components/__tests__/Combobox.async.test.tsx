import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from '../src/Combobox';
import { renderWithTheme as render } from './utils';

/**
 * Async loading tests. We use **real timers** + a small `debounceMs` to keep these fast — fake
 * timers would force every awaited userEvent to also advance timers manually, which is brittle.
 * The 50 ms debounce + 100 ms loader latency means each test settles in well under a second.
 *
 * Coverage:
 *  - debounce: only one fetch fires for rapid keystrokes
 *  - abort: the older fetch's resolution is ignored when a newer one fires
 *  - error: rejected fetch surfaces the error renderer
 *  - loadingState override: external prop wins over deferred internal state
 *  - results render normally after success
 */

function makeLoader(latencyMs: number, results: (q: string) => string[]) {
  const fn = vi.fn(
    (query: string, ctx: { signal: AbortSignal }): Promise<{ value: string; label: string }[]> =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => {
          if (ctx.signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          resolve(results(query).map((label) => ({ value: label.toLowerCase(), label })));
        }, latencyMs);
        ctx.signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  );
  return fn;
}

describe('Combobox — async loadOptions', () => {
  it('debounces multiple rapid keystrokes into a single fetch', async () => {
    const user = userEvent.setup();
    const loader = makeLoader(50, () => ['Alpha', 'Beta']);
    render(
      <Combobox
        aria-label="Search"
        placeholder="Search…"
        loadOptions={loader}
        debounceMs={80}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'al');
    // Single debounce window swallows both keystrokes (80 ms after the second char).
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1), { timeout: 1500 });
    expect(loader).toHaveBeenLastCalledWith('al', expect.objectContaining({ signal: expect.anything() }));
  });

  it('aborts the previous fetch when a newer query supersedes it', async () => {
    const user = userEvent.setup();
    let firstSignal: AbortSignal | undefined;
    const loader = vi.fn(
      (query: string, ctx: { signal: AbortSignal }): Promise<{ value: string; label: string }[]> => {
        if (!firstSignal) firstSignal = ctx.signal;
        return new Promise((resolve, reject) => {
          const t = setTimeout(() => {
            if (ctx.signal.aborted) {
              reject(new DOMException('Aborted', 'AbortError'));
              return;
            }
            resolve([{ value: query, label: query }]);
          }, 60);
          ctx.signal.addEventListener('abort', () => {
            clearTimeout(t);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      },
    );
    render(
      <Combobox
        aria-label="Search"
        placeholder="Search…"
        loadOptions={loader}
        debounceMs={30}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'a');
    // Wait for the first debounce to fire (so a controller exists), then type more.
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    await user.type(input, 'b');
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
    expect(firstSignal?.aborted).toBe(true);
  });

  it('surfaces the rejected error via the error renderer', async () => {
    const user = userEvent.setup();
    const loader = vi.fn(
      (): Promise<{ value: string; label: string }[]> =>
        new Promise((_resolve, reject) => {
          setTimeout(() => reject(new Error('Boom!')), 30);
        }),
    );
    render(
      <Combobox
        aria-label="Search"
        placeholder="Search…"
        loadOptions={loader}
        debounceMs={20}
        renderError={(err) => <span>err:{err.message}</span>}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'x');
    await waitFor(() => expect(screen.getByText('err:Boom!')).toBeInTheDocument(), {
      timeout: 1500,
    });
  });

  it('renders results after a successful fetch', async () => {
    const user = userEvent.setup();
    const loader = makeLoader(30, () => ['Apple', 'Apricot']);
    render(
      <Combobox
        aria-label="Search"
        placeholder="Search…"
        loadOptions={loader}
        debounceMs={20}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'a');
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.map((o) => o.textContent)).toEqual(['Apple', 'Apricot']);
    });
  });

  it('loadingState prop override wins over internal deferred state', async () => {
    const user = userEvent.setup();
    const loader = makeLoader(30, () => ['Apple']);
    render(
      <Combobox
        aria-label="Search"
        placeholder="Search…"
        loadOptions={loader}
        debounceMs={20}
        loadingState="loading"
        renderLoading={() => <span>loading-forced</span>}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await waitFor(() => expect(screen.getByText('loading-forced')).toBeInTheDocument());
  });
});
