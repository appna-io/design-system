import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Div, Typography } from '../src';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Typography — axe-core', () => {
  it('default body Typography has no violations', async () => {
    const { container } = render(
      <Typography>A body paragraph with normal length copy.</Typography>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('full heading ladder (h1–h6) is accessible', async () => {
    const { container } = render(
      <Div>
        <Typography variant="h1">Section A</Typography>
        <Typography variant="h2">Subsection A.1</Typography>
        <Typography variant="h3">Subsection A.1.1</Typography>
        <Typography variant="h4">Group label</Typography>
        <Typography variant="h5">Group label</Typography>
        <Typography variant="h6">Group label</Typography>
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('caption / overline / code inside body paragraph is accessible', async () => {
    const { container } = render(
      <Typography variant="body">
        Surrounding body copy with an inline <Typography variant="code">code()</Typography> and a{' '}
        <Typography variant="caption">caption span</Typography> for context.
      </Typography>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Typography actLike="a" with href + visible label is accessible', async () => {
    const { container } = render(
      <Typography variant="body" actLike="a" href="/docs" decoration="underline">
        Docs link
      </Typography>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('truncated single-line title with explicit aria-label retains accessibility', async () => {
    const { container } = render(
      <Div maxWidth={200}>
        <Typography variant="h3" truncate aria-label="A very long title">
          A very long title that gets clipped with an ellipsis.
        </Typography>
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('lineClamp multi-line clamp with full text under aria-label is accessible', async () => {
    const fullText =
      'A long description that spans several lines and would otherwise overflow the card surface, ' +
      'so it gets clamped to three visible lines with a trailing ellipsis.';
    const { container } = render(
      <Div maxWidth={320}>
        <Typography lineClamp={3} aria-label={fullText}>
          {fullText}
        </Typography>
      </Div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
