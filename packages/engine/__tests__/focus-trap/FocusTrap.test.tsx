import { render, fireEvent, screen, act } from '@testing-library/react';
import { useRef, useState, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { FocusTrap } from '../../src/focus-trap/FocusTrap';
import { useFocusTrap } from '../../src/focus-trap/useFocusTrap';
import {
  getFocusableElements,
  isFocusable,
  FOCUSABLE_SELECTOR,
} from '../../src/focus-trap/focusable';

function pressTab(opts: { shift?: boolean } = {}): void {
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: !!opts.shift });
}

describe('focusable utilities', () => {
  it('FOCUSABLE_SELECTOR matches the canonical set of focusable elements', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <button id="b">btn</button>
      <a id="a" href="#x">a</a>
      <input id="i" />
      <button id="bd" disabled>disabled</button>
      <span id="s" tabindex="0">tab</span>
      <span id="m" tabindex="-1">no</span>
      <span id="ah" aria-hidden="true" tabindex="0">hidden</span>
    `;
    document.body.appendChild(host);

    const matched = host.querySelectorAll(FOCUSABLE_SELECTOR);
    const matchedIds = Array.from(matched).map((el) => el.id);
    expect(matchedIds).toContain('b');
    expect(matchedIds).toContain('a');
    expect(matchedIds).toContain('i');
    expect(matchedIds).toContain('s');
    expect(matchedIds).toContain('ah'); // selector matches; isFocusable() is what filters
    expect(matchedIds).not.toContain('bd'); // [disabled] is excluded by selector
    expect(matchedIds).not.toContain('m');

    expect(isFocusable(host.querySelector('#ah')!)).toBe(false); // aria-hidden filtered out
    host.remove();
  });

  it('getFocusableElements returns DOM-order, filtered list', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <button id="one">1</button>
      <span tabindex="-1">skip</span>
      <button id="two">2</button>
    `;
    document.body.appendChild(host);
    const list = getFocusableElements(host).map((el) => el.id);
    expect(list).toEqual(['one', 'two']);
    host.remove();
  });
});

function Trapped({
  active,
  initialFocus,
}: {
  active: boolean;
  initialFocus?: 'first' | 'second' | undefined;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(ref, {
    active,
    initialFocus:
      initialFocus === 'second' ? secondRef : initialFocus === 'first' ? firstRef : undefined,
  });

  return (
    <div>
      <button data-testid="outside-before">outside-before</button>
      <div ref={ref} tabIndex={-1} data-testid="trap">
        <button ref={firstRef} data-testid="first">
          first
        </button>
        <button ref={secondRef} data-testid="second">
          second
        </button>
        <button data-testid="last">last</button>
      </div>
      <button data-testid="outside-after">outside-after</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus to the first focusable child by default when activated', () => {
    render(<Trapped active />);
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('honors initialFocus when provided', () => {
    render(<Trapped active initialFocus="second" />);
    expect(document.activeElement).toBe(screen.getByTestId('second'));
  });

  it('Tab past last wraps to first', () => {
    render(<Trapped active />);
    screen.getByTestId('last').focus();
    pressTab();
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('Shift+Tab past first wraps to last', () => {
    render(<Trapped active />);
    screen.getByTestId('first').focus();
    pressTab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('last'));
  });

  it('focusin outside the trap pulls focus back', () => {
    render(<Trapped active />);
    const outside = screen.getByTestId('outside-after');
    // Programmatic focus on an element outside the trap should be intercepted.
    act(() => outside.focus());
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('returns focus to the previously-focused element when deactivated', async () => {
    function Toggleable(): ReactElement {
      const ref = useRef<HTMLDivElement>(null);
      const [active, setActive] = useState(false);
      useFocusTrap(ref, { active });
      return (
        <div>
          <button data-testid="trigger" onClick={() => setActive(true)}>
            open
          </button>
          <div ref={ref} tabIndex={-1} data-testid="trap">
            <button data-testid="inside" onClick={() => setActive(false)}>
              close
            </button>
          </div>
        </div>
      );
    }
    render(<Toggleable />);
    const trigger = screen.getByTestId('trigger');
    // Simulate: user focuses + clicks the trigger; trap activates and steals focus.
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByTestId('inside'));
    // Close the trap — focus should return to the trigger after the microtask drains.
    fireEvent.click(screen.getByTestId('inside'));
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    expect(document.activeElement).toBe(trigger);
  });
});

describe('<FocusTrap>', () => {
  it('renders a tabIndex=-1 wrapper and traps focus', () => {
    const { getByTestId } = render(
      <FocusTrap active>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusTrap>,
    );
    expect(document.activeElement).toBe(getByTestId('a'));
    pressTab();
    // After the wrap-around handler fires we should land on `a` again (only two focusables).
    // Simulate moving to `b` first then tabbing forward to wrap.
    getByTestId('b').focus();
    pressTab();
    expect(document.activeElement).toBe(getByTestId('a'));
  });

  it('handles no-focusable-children by keeping focus on the wrapper', () => {
    const { container } = render(
      <FocusTrap active>
        <span>plain text — no focusables</span>
      </FocusTrap>,
    );
    const wrapper = container.querySelector('[tabindex="-1"]');
    expect(wrapper).not.toBeNull();
    expect(document.activeElement).toBe(wrapper);
  });
});
