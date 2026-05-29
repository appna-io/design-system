import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../src/Button/Button';
import { Toolbar } from '../src/Toolbar';
import { renderWithTheme as render } from './utils';

describe('Toolbar — root', () => {
  it('renders role="toolbar" with required aria-label', () => {
    render(
      <Toolbar aria-label="Test toolbar">
        <Button>One</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Test toolbar' });
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('emits a dev warning when aria-label and aria-labelledby are both missing', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Toolbar>
        <Button>One</Button>
      </Toolbar>,
    );
    expect(spy).toHaveBeenCalled();
    const messages = spy.mock.calls.map((args) => args.join(' '));
    expect(messages.some((m) => m.includes('Toolbar') && m.includes('aria-label'))).toBe(true);
    spy.mockRestore();
  });

  it('does NOT warn when aria-labelledby is supplied instead of aria-label', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <span id="external-label">External label</span>
        <Toolbar aria-labelledby="external-label">
          <Button>One</Button>
        </Toolbar>
      </>,
    );
    const messages = spy.mock.calls.map((args) => args.join(' '));
    expect(messages.some((m) => m.includes('TOOLBAR_NO_LABEL'))).toBe(false);
    spy.mockRestore();
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Toolbar aria-label="Ref toolbar" ref={ref}>
        <Button>One</Button>
      </Toolbar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('role')).toBe('toolbar');
  });

  it('renders horizontal orientation by default with flex-row', () => {
    render(
      <Toolbar aria-label="t">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('flex-row');
  });

  it('switches to flex-col when orientation="vertical"', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('flex-col');
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('applies bordered variant chrome', () => {
    render(
      <Toolbar aria-label="t" variant="bordered">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toMatch(/border/);
    expect(toolbar.className).toMatch(/rounded/);
  });

  it('applies floating variant chrome', () => {
    render(
      <Toolbar aria-label="t" variant="floating">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toMatch(/rounded-full/);
    expect(toolbar.className).toMatch(/shadow/);
  });

  it('passes through a custom className', () => {
    render(
      <Toolbar aria-label="t" className="my-custom-class">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('my-custom-class');
  });

  it('spreads arbitrary DOM attributes onto the root', () => {
    render(
      <Toolbar aria-label="t" data-testid="custom-tb" id="my-tb">
        <Button>x</Button>
      </Toolbar>,
    );
    const toolbar = screen.getByTestId('custom-tb');
    expect(toolbar.id).toBe('my-tb');
  });
});

describe('Toolbar — roving tabindex', () => {
  it('only the first item starts with tabindex=0', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]?.getAttribute('tabindex')).toBe('0');
    expect(buttons[1]?.getAttribute('tabindex')).toBe('-1');
    expect(buttons[2]?.getAttribute('tabindex')).toBe('-1');
  });

  it('promotes a focused item to tabindex=0 when focus enters it', async () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    // focusin handler runs synchronously; check the post-focus state.
    expect(buttons[0]?.getAttribute('tabindex')).toBe('-1');
    expect(buttons[1]?.getAttribute('tabindex')).toBe('0');
    expect(buttons[2]?.getAttribute('tabindex')).toBe('-1');
  });

  it('skips elements inside data-toolbar-skip="true" containers', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Separator />
        <Button>Two</Button>
      </Toolbar>,
    );
    const separator = screen.getByRole('separator');
    expect(separator.getAttribute('data-toolbar-skip')).toBe('true');
    // Separator should not have tabindex=0; only the first Button should.
    expect(separator.getAttribute('tabindex')).toBeNull();
  });

  it('skips Toolbar.Spacer from the focus ring', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Spacer />
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]?.getAttribute('tabindex')).toBe('0');
    expect(buttons[1]?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('Toolbar.Group', () => {
  it('renders role="group" with aria-label when supplied', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Group aria-label="Text style">
          <Button>Bold</Button>
          <Button>Italic</Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    const group = screen.getByRole('group', { name: 'Text style' });
    expect(group).toBeInTheDocument();
  });

  it('omits role="group" when no label is supplied', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Group>
          <Button>One</Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    // Querying by role 'group' should fail when no label is set.
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('throws a helpful error when rendered outside a Toolbar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Toolbar.Group>
          <Button>One</Button>
        </Toolbar.Group>,
      ),
    ).toThrow(/Toolbar\.Group/);
    spy.mockRestore();
  });

  it('applies a custom gap override class', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Group gap={3} data-testid="group">
          <Button>One</Button>
          <Button>Two</Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    const group = screen.getByTestId('group');
    expect(group.className).toContain('gap-3');
  });
});

describe('Toolbar.Separator', () => {
  it('renders role="separator" perpendicular to the toolbar', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Separator />
        <Button>Two</Button>
      </Toolbar>,
    );
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
    // Horizontal toolbar → vertical separator.
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('flips to horizontal orientation inside a vertical toolbar', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Button>One</Button>
        <Toolbar.Separator />
        <Button>Two</Button>
      </Toolbar>,
    );
    const separator = screen.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('renders thicker rule when thickness=2', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Separator thickness={2} />
      </Toolbar>,
    );
    const separator = screen.getByRole('separator');
    expect(separator.className).toMatch(/w-0\.5/);
  });
});

describe('Toolbar.Spacer', () => {
  it('renders an aria-hidden spacer with the data-toolbar-spacer attribute', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Spacer data-testid="spacer" />
        <Button>Two</Button>
      </Toolbar>,
    );
    const spacer = screen.getByTestId('spacer');
    expect(spacer.getAttribute('aria-hidden')).toBe('true');
    expect(spacer.getAttribute('data-toolbar-spacer')).toBe('');
  });

  it('falls back to a greedy flex spacer by default', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Spacer data-testid="spacer" />
      </Toolbar>,
    );
    const spacer = screen.getByTestId('spacer');
    expect(spacer.className).toContain('flex-1');
  });

  it('renders a fixed-size spacer when size is set', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Toolbar.Spacer size={4} data-testid="spacer" />
        <Button>Two</Button>
      </Toolbar>,
    );
    const spacer = screen.getByTestId('spacer');
    expect(spacer.className).toMatch(/w-4/);
  });
});
