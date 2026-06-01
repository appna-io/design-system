import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DirectionProvider, useDirection } from '../src/direction';

function Inspector() {
  const dir = useDirection();
  return <span data-testid="dir">{dir}</span>;
}

describe('DirectionProvider / useDirection', () => {
  afterEach(() => {
    document.documentElement.setAttribute('dir', 'ltr');
  });

  it('returns the explicit dir from the nearest provider', () => {
    const { getByTestId } = render(
      <DirectionProvider dir="rtl">
        <Inspector />
      </DirectionProvider>,
    );
    expect(getByTestId('dir').textContent).toBe('rtl');
  });

  it('reads <html dir> when no provider is present', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const { getByTestId } = render(<Inspector />);
    await waitFor(() => expect(getByTestId('dir').textContent).toBe('rtl'));
  });

  it('updates when <html dir> changes', async () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const { getByTestId } = render(<Inspector />);
    await waitFor(() => expect(getByTestId('dir').textContent).toBe('ltr'));

    act(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });

    await waitFor(() => expect(getByTestId('dir').textContent).toBe('rtl'));
  });
});