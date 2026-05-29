import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Div } from '../src/Div';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Div — axe-core', () => {
  it('basic Div with text content has no violations', async () => {
    const { container } = render(
      <Div p={4} bg="primary.50" radius="md">
        A simple themed box.
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Div as <section> with aria-label is accessible', async () => {
    const { container } = render(
      <Div as="section" aria-label="Hero" p={4} bg="bg.paper">
        <h2>Title</h2>
        <p>Body</p>
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Div actLike="button" with type and visible label is accessible', async () => {
    const { container } = render(
      <Div actLike="button" type="button" px={12} py={6} bg="primary.main" fg="primary.contrast">
        Click me
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Div actLike="a" with href + visible label is accessible', async () => {
    const { container } = render(
      <Div actLike="a" href="/docs">
        Docs
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('animated Div has no a11y violations', async () => {
    const { container } = render(
      <Div animation="fadeIn" p={4} bg="primary.50">
        Animated content
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Div with pseudo-state hooks (hover / focus-visible / active) has no violations', async () => {
    const { container } = render(
      <Div
        actLike="button"
        type="button"
        px={12}
        py={6}
        onHover="bg-primary-100"
        onFocusVisible="ring-2 ring-primary-500"
        onActive="scale-[0.98]"
      >
        Interactive
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
