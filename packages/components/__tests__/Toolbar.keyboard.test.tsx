import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/Button/Button';
import { Toolbar } from '../src/Toolbar';
import { renderWithTheme as render } from './utils';

/**
 * End-to-end keyboard behavior — the pure resolver is unit-tested in
 * `useToolbarKeyboard.test.ts`; here we verify the React glue (capture-phase handler, real
 * focus moves, RTL via the `dir` attribute, disabled item skipping via the focusable selector).
 */

function pressKey(target: HTMLElement, key: string) {
  fireEvent.keyDown(target, { key });
}

describe('Toolbar keyboard — horizontal', () => {
  it('ArrowRight moves focus to the next item', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ArrowLeft moves focus backward', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[2]?.focus();
    pressKey(buttons[2]!, 'ArrowLeft');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('Home / End jump to first / last', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    pressKey(buttons[1]!, 'End');
    expect(document.activeElement).toBe(buttons[2]);
    pressKey(buttons[2]!, 'Home');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('loops by default when arrow runs off the end', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    pressKey(buttons[1]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('does NOT loop when loop=false', () => {
    render(
      <Toolbar aria-label="t" loop={false}>
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    pressKey(buttons[1]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('skips disabled items during arrow nav', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button disabled>Two (disabled)</Button>
        <Button>Three</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowRight');
    // Disabled button is excluded from the focusable selector → focus skips to Three.
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('does NOT respond to Up/Down in horizontal mode', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowDown');
    expect(document.activeElement).toBe(buttons[0]);
  });
});

describe('Toolbar keyboard — vertical', () => {
  it('ArrowDown moves focus to the next item', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowDown');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ArrowUp moves focus backward', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    pressKey(buttons[1]!, 'ArrowUp');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('does NOT respond to Left/Right in vertical mode', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Button>One</Button>
        <Button>Two</Button>
      </Toolbar>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[0]);
  });
});

describe('Toolbar keyboard — RTL', () => {
  it('ArrowRight moves backward when ancestor has dir="rtl"', () => {
    render(
      <div dir="rtl">
        <Toolbar aria-label="t">
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </Toolbar>
      </div>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[1]?.focus();
    pressKey(buttons[1]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('ArrowLeft moves forward when ancestor has dir="rtl"', () => {
    render(
      <div dir="rtl">
        <Toolbar aria-label="t">
          <Button>One</Button>
          <Button>Two</Button>
        </Toolbar>
      </div>,
    );
    const buttons = screen.getAllByRole('button');
    buttons[0]?.focus();
    pressKey(buttons[0]!, 'ArrowLeft');
    expect(document.activeElement).toBe(buttons[1]);
  });
});

describe('Toolbar keyboard — text input pass-through', () => {
  it('does not capture arrow keys when focus is inside a text input', () => {
    render(
      <Toolbar aria-label="t">
        <Button>One</Button>
        <input type="text" data-testid="text-in" defaultValue="abc" />
        <Button>Three</Button>
      </Toolbar>,
    );
    const input = screen.getByTestId('text-in') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(1, 1);
    pressKey(input, 'ArrowRight');
    // Focus must stay on the input so the browser's native cursor nav can take over.
    expect(document.activeElement).toBe(input);
  });
});
