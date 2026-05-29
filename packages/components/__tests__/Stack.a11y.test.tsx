import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { HStack, Spacer, Stack, VStack } from '../src/Stack';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Stack — axe-core', () => {
  it('default vertical Stack has no violations', async () => {
    const { container } = render(
      <Stack gap={4}>
        <div>One</div>
        <div>Two</div>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('HStack with Spacer between actions has no violations', async () => {
    const { container } = render(
      <HStack gap={2} align="center">
        <button type="button">Cancel</button>
        <Spacer />
        <button type="button">Save</button>
      </HStack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VStack rendered as <nav> with anchors is accessible', async () => {
    const { container } = render(
      <VStack as="nav" gap={1} aria-label="Primary">
        <a href="/a">A</a>
        <a href="/b">B</a>
      </VStack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Stack rendered as <ul> with <li> children is accessible', async () => {
    const { container } = render(
      <Stack as="ul" gap={1}>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Stack with divider between children is accessible', async () => {
    const { container } = render(
      <Stack gap={2} divider={<hr aria-hidden="true" />}>
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Spacer is aria-hidden (visual only)', () => {
    const { getByTestId } = render(<Spacer data-testid="s" />);
    expect(getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
  });
});
