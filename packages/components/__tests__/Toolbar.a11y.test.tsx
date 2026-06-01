import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/Button/Button';
import { Toolbar } from '../src/Toolbar';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Toolbar — axe-core', () => {
  it('horizontal toolbar with Buttons has no violations', async () => {
    const { container } = render(
      <Toolbar aria-label="Document actions">
        <Button>Save</Button>
        <Button>Print</Button>
        <Button>Share</Button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('vertical toolbar is accessible', async () => {
    const { container } = render(
      <Toolbar aria-label="Quick actions" orientation="vertical">
        <Button aria-label="Search">S</Button>
        <Button aria-label="Bell">B</Button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('toolbar with separator and spacer is accessible', async () => {
    const { container } = render(
      <Toolbar aria-label="Edit toolbar">
        <Button>Bold</Button>
        <Button>Italic</Button>
        <Toolbar.Separator />
        <Button>Left</Button>
        <Toolbar.Spacer />
        <Button>Publish</Button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('toolbar with labelled groups is accessible', async () => {
    const { container } = render(
      <Toolbar aria-label="Editor toolbar">
        <Toolbar.Group aria-label="Text style">
          <Button aria-label="Bold">B</Button>
          <Button aria-label="Italic">I</Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="Alignment">
          <Button aria-label="Left">L</Button>
          <Button aria-label="Center">C</Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('bordered variant is accessible', async () => {
    const { container } = render(
      <Toolbar aria-label="Bordered actions" variant="bordered">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('floating variant is accessible', async () => {
    const { container } = render(
      <Toolbar aria-label="Floating actions" variant="floating">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('toolbar with aria-labelledby is accessible', async () => {
    const { container } = render(
      <>
        <h2 id="tb-heading">Formatting</h2>
        <Toolbar aria-labelledby="tb-heading">
          <Button>One</Button>
          <Button>Two</Button>
        </Toolbar>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});