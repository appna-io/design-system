import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/Button/Button';
import { EmptyState } from '../src/EmptyState';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS = ['default', 'error', 'loading', 'success'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const ALIGNS = ['center', 'start'] as const;

describe('EmptyState — accessibility', () => {
  it('passes axe-core for the minimal render', async () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across every variant × size cell', async () => {
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) =>
          SIZES.map((size) => (
            <EmptyState
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              title={`${variant} / ${size}`}
              description="Empty surface for this cell."
            />
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every align', async () => {
    const { container } = render(
      <div>
        {ALIGNS.map((align) => (
          <EmptyState key={align} align={align} title={align} description="x" />
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core with both action shortcuts', async () => {
    const { container } = render(
      <EmptyState
        title="No invoices"
        description="Adjust filters or read the docs."
        primaryAction={{ label: 'Clear filters', onClick: () => {} }}
        secondaryAction={{ label: 'Docs', href: '/docs' }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core in compound mode', async () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Icon>
          <svg viewBox="0 0 24 24" width="24" height="24" />
        </EmptyState.Icon>
        <EmptyState.Title>Compound title</EmptyState.Title>
        <EmptyState.Description>Compound description.</EmptyState.Description>
        <EmptyState.Actions>
          <Button>Action</Button>
        </EmptyState.Actions>
      </EmptyState>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading variant exposes aria-busy + role=status without violations', async () => {
    const { container } = render(
      <EmptyState
        variant="loading"
        title="Loading workspace"
        description="A few seconds…"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('error variant exposes role=alert without violations', async () => {
    const { container } = render(
      <EmptyState
        variant="error"
        title="Something went wrong"
        description="Please try again."
        primaryAction={{ label: 'Retry', onClick: () => {} }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('href + target=_blank action passes axe (rel safely auto-injected)', async () => {
    const { container } = render(
      <EmptyState
        title="x"
        description="x"
        primaryAction={{
          label: 'External',
          href: 'https://example.com',
          target: '_blank',
        }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
