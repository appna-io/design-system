import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Rating } from '../src/Rating';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Rating — axe', () => {
  it('no violations for basic interactive rating with ariaLabel', async () => {
    const { container } = render(<Rating ariaLabel="Rate the product" defaultValue={3} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for labeled rating with description + helper', async () => {
    const { container } = render(
      <Rating
        label="Rate your experience"
        description="Tap a star to rate."
        helperText="You can change this later."
        defaultValue={4}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for read-only fractional display', async () => {
    const { container } = render(
      <Rating value={3.71} readOnly precision="exact" ariaLabel="Average rating" showValue />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for disabled rating', async () => {
    const { container } = render(<Rating defaultValue={2} disabled ariaLabel="Disabled rating" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for error state', async () => {
    const { container } = render(
      <Rating
        label="Rate your experience"
        required
        defaultValue={0}
        error="Please pick a rating"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for half-step interactive rating', async () => {
    const { container } = render(
      <Rating defaultValue={3.5} precision={0.5} ariaLabel="Half-step rating" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for rating inside a form (hidden input)', async () => {
    const { container } = render(
      <form>
        <Rating name="quality" label="Quality" required defaultValue={0} />
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
