import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { TagsInput } from '../src/TagsInput';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('TagsInput — axe', () => {
  it('no violations for basic labeled field', async () => {
    const { container } = render(
      <TagsInput label="Tags" defaultValue={['react', 'typescript']} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations for required + error state', async () => {
    const { container } = render(
      <TagsInput
        label="Tags"
        required
        error="Please add at least one tag"
        defaultValue={[]}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations when maxTags is reached', async () => {
    const { container } = render(
      <TagsInput label="Tags" maxTags={2} defaultValue={['a', 'b']} showCount />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations when disabled', async () => {
    const { container } = render(
      <TagsInput label="Tags" disabled defaultValue={['x', 'y']} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations with description + helper + suggestions list', async () => {
    const { container } = render(
      <TagsInput
        label="Skills"
        description="Pick from the list or type your own."
        helperText="Press Enter to add."
        suggestions={['React', 'Vue', 'Svelte']}
        defaultValue={['React']}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('no violations inside a form with hidden inputs', async () => {
    const { container } = render(
      <form>
        <TagsInput label="Tags" name="tags" required defaultValue={['a', 'b']} />
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
