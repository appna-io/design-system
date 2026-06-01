import { act, screen, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Toaster, toast } from '../src/Toast';
import { ToastStore } from '../src/Toast/ToastStore';
import type { ToastIntent, ToastVariant } from '../src/Toast';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

beforeEach(() => {
  ToastStore.__reset();
});

afterEach(() => {
  ToastStore.__reset();
});

function queryRegion(): HTMLElement {
  return screen.getByRole('region', { name: 'Notifications' });
}

describe('Toast — accessibility', () => {
  it('region carries role=region + aria-live=polite + aria-label', () => {
    render(<Toaster aria-label="Test notifications" />);
    // Toaster portals to body, so query against screen rather than the wrapped container.
    const region = screen.getByRole('region', { name: 'Test notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('each non-error toast uses role=status', async () => {
    render(<Toaster />);
    act(() => {
      toast.success('ok');
      toast.info('hi');
      toast.warning('careful');
      toast.loading('working');
    });
    await waitFor(() => {
      expect(within(queryRegion()).getAllByRole('status')).toHaveLength(3); // max=3 default
    });
  });

  it('error toast uses role=alert', async () => {
    render(<Toaster />);
    act(() => {
      toast.error('broken');
    });
    await waitFor(() => {
      expect(within(queryRegion()).getByRole('alert')).toBeInTheDocument();
    });
  });

  it('close button has accessible name', async () => {
    render(<Toaster closeButton />);
    act(() => {
      toast('Hello');
    });
    await waitFor(() => {
      expect(within(queryRegion()).getByText('Hello')).toBeInTheDocument();
    });
    expect(
      within(queryRegion()).getByRole('button', { name: 'Dismiss notification' }),
    ).toBeInTheDocument();
  });
});

describe('Toast — axe', () => {
  const intents: ToastIntent[] = ['neutral', 'success', 'error', 'warning', 'info', 'loading'];
  const variants: ToastVariant[] = ['solid', 'outline', 'soft'];

  it.each(intents)('no axe violations for %s × solid', async (intent) => {
    const { container } = render(<Toaster max={5} />);
    act(() => {
      if (intent === 'neutral') {
        toast('Sample', { variant: 'solid' });
      } else {
        toast[intent]('Sample', { variant: 'solid' });
      }
    });
    await waitFor(() => {
      expect(within(queryRegion()).getByText('Sample')).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it.each(variants)('no axe violations for neutral × %s', async (variant) => {
    const { container } = render(<Toaster max={5} closeButton />);
    act(() => {
      toast('Sample', { variant });
    });
    await waitFor(() => {
      expect(within(queryRegion()).getByText('Sample')).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('toast with action + cancel has no axe violations', async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast('Archived', {
        description: 'Removed from inbox',
        action: { label: 'Undo', onClick: () => {} },
        cancel: { label: 'Dismiss', onClick: () => {} },
      });
    });
    await waitFor(() => {
      expect(within(queryRegion()).getByText('Archived')).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});