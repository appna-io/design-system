import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from '../src/Accordion';
import type { AccordionColor, AccordionVariant } from '../src/Accordion';
import { renderWithTheme as render } from './utils';

/** Render three items with deterministic labels. */
function ThreeItems(
  props: Omit<React.ComponentProps<typeof Accordion>, 'children' | 'type'> & {
    type?: 'single' | 'multiple';
  } = {},
) {
  const { type, ...rest } = props as { type?: 'single' | 'multiple' } & Record<string, unknown>;
  if (type === 'multiple') {
    return (
      <Accordion type="multiple" {...rest}>
        <Accordion.Item value="one">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>Body one</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Body two</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="three">
          <Accordion.Trigger>Third</Accordion.Trigger>
          <Accordion.Content>Body three</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
  }
  return (
    <Accordion type="single" {...rest}>
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>Body one</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Body two</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three">
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Content>Body three</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function triggerOf(label: string) {
  return screen.getByRole('button', { name: label });
}

describe('Accordion — rendering', () => {
  it('renders three triggers + three content regions by default', () => {
    render(<ThreeItems />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getAllByRole('region', { hidden: true })).toHaveLength(3);
  });

  it('all triggers start closed (aria-expanded=false) when no defaultValue', () => {
    render(<ThreeItems />);
    for (const t of screen.getAllByRole('button')) {
      expect(t).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('honors defaultValue in single mode', () => {
    render(<ThreeItems defaultValue="two" />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'false');
    expect(triggerOf('Second')).toHaveAttribute('aria-expanded', 'true');
    expect(triggerOf('Third')).toHaveAttribute('aria-expanded', 'false');
  });

  it('honors defaultValue in multiple mode', () => {
    render(<ThreeItems type="multiple" defaultValue={['one', 'three']} />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
    expect(triggerOf('Second')).toHaveAttribute('aria-expanded', 'false');
    expect(triggerOf('Third')).toHaveAttribute('aria-expanded', 'true');
  });

  it('emits data-orientation="vertical" on the wrapper', () => {
    const { container } = render(<ThreeItems />);
    const root = container.querySelector('[data-orientation="vertical"]');
    expect(root).not.toBeNull();
  });
});

describe('Accordion — single mode', () => {
  it('clicking a trigger opens its item, closes the previously open item', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="one" />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');

    await user.click(triggerOf('Second'));
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'false');
    expect(triggerOf('Second')).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapsible=true (default) allows clicking the open item to close it', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="one" />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
    await user.click(triggerOf('First'));
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsible=false keeps the open item open when re-clicked', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="one" collapsible={false} />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
    await user.click(triggerOf('First'));
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion — multiple mode', () => {
  it('clicking toggles items independently', async () => {
    const user = userEvent.setup();
    render(<ThreeItems type="multiple" />);
    await user.click(triggerOf('First'));
    await user.click(triggerOf('Third'));
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
    expect(triggerOf('Second')).toHaveAttribute('aria-expanded', 'false');
    expect(triggerOf('Third')).toHaveAttribute('aria-expanded', 'true');
    await user.click(triggerOf('First'));
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'false');
    expect(triggerOf('Third')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion — controlled value flow', () => {
  it('value flows in / onValueChange flows out (single)', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState<string>('one');
      return (
        <Accordion
          type="single"
          value={v}
          onValueChange={(next) => {
            setV(next);
            onValueChange(next);
          }}
        >
          <Accordion.Item value="one">
            <Accordion.Trigger>First</Accordion.Trigger>
            <Accordion.Content>Body one</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two">
            <Accordion.Trigger>Second</Accordion.Trigger>
            <Accordion.Content>Body two</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
    await user.click(triggerOf('Second'));
    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(triggerOf('Second')).toHaveAttribute('aria-expanded', 'true');
  });

  it('value flows in / onValueChange flows out (multiple)', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState<string[]>([]);
      return (
        <Accordion
          type="multiple"
          value={v}
          onValueChange={(next) => {
            setV(next);
            onValueChange(next);
          }}
        >
          <Accordion.Item value="one">
            <Accordion.Trigger>First</Accordion.Trigger>
            <Accordion.Content>Body one</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two">
            <Accordion.Trigger>Second</Accordion.Trigger>
            <Accordion.Content>Body two</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(triggerOf('First'));
    expect(onValueChange).toHaveBeenLastCalledWith(['one']);
    await user.click(triggerOf('Second'));
    expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two']);
    await user.click(triggerOf('First'));
    expect(onValueChange).toHaveBeenLastCalledWith(['two']);
  });
});

describe('Accordion — keyboard navigation', () => {
  it('ArrowDown moves focus to the next enabled trigger and wraps at the end', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    triggerOf('First').focus();
    await user.keyboard('{ArrowDown}');
    expect(triggerOf('Second')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(triggerOf('Third')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(triggerOf('First')).toHaveFocus();
  });

  it('ArrowUp moves focus to the previous enabled trigger and wraps at the start', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    triggerOf('First').focus();
    await user.keyboard('{ArrowUp}');
    expect(triggerOf('Third')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(triggerOf('Second')).toHaveFocus();
  });

  it('Home / End jumps to first / last enabled trigger', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    triggerOf('Second').focus();
    await user.keyboard('{End}');
    expect(triggerOf('Third')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(triggerOf('First')).toHaveFocus();
  });

  it('disabled triggers are skipped by Arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b" disabled>
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="c">
          <Accordion.Trigger>C</Accordion.Trigger>
          <Accordion.Content>c</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    triggerOf('A').focus();
    await user.keyboard('{ArrowDown}');
    expect(triggerOf('C')).toHaveFocus();
  });

  it('Enter activates the trigger (native button behavior)', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    triggerOf('First').focus();
    await user.keyboard('{Enter}');
    expect(triggerOf('First')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion — disabled cascade', () => {
  it('root disabled disables every item', () => {
    render(
      <Accordion type="single" disabled>
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    for (const t of screen.getAllByRole('button')) {
      expect(t).toBeDisabled();
    }
  });

  it('per-item disabled scopes to that item', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <Accordion.Item value="a" disabled>
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(triggerOf('A')).toBeDisabled();
    expect(triggerOf('B')).not.toBeDisabled();
    // Clicking a disabled trigger does nothing.
    await user.click(triggerOf('A'));
    expect(triggerOf('A')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion — variants × colors smoke', () => {
  const VARIANTS: readonly AccordionVariant[] = ['solid', 'outline', 'soft', 'ghost'];
  const COLORS: readonly AccordionColor[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
  ];

  it('every variant × color cell mounts without crashing', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { unmount } = render(
          <Accordion type="single" variant={variant} color={color}>
            <Accordion.Item value="x">
              <Accordion.Trigger>{`${variant}-${color}`}</Accordion.Trigger>
              <Accordion.Content>x</Accordion.Content>
            </Accordion.Item>
          </Accordion>,
        );
        unmount();
      }
    }
  });

  it('applies the size variant classes to triggers and content inner', () => {
    const { container, rerender } = render(
      <Accordion type="single" size="sm">
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(triggerOf('x').className).toContain('px-3');
    expect(triggerOf('x').className).toContain('py-2');

    rerender(
      <Accordion type="single" size="lg">
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(triggerOf('x').className).toContain('px-5');
    expect(triggerOf('x').className).toContain('py-4');
    const region = container.querySelector('[role="region"]');
    expect(region?.className).toContain('px-5');
  });
});

describe('Accordion — content visibility transition state', () => {
  it('content wrapper has data-state="closed" by default and "open" after click', async () => {
    const user = userEvent.setup();
    const { container } = render(<ThreeItems />);
    const wrappers = container.querySelectorAll<HTMLDivElement>(
      'div[data-state][class*="grid-rows"]',
    );
    expect(wrappers).toHaveLength(3);
    for (const w of wrappers) expect(w).toHaveAttribute('data-state', 'closed');

    await user.click(triggerOf('First'));
    // The first wrapper should now be open. We re-query because the className may have updated.
    const updated = container.querySelectorAll<HTMLDivElement>(
      'div[data-state][class*="grid-rows"]',
    );
    expect(updated[0]).toHaveAttribute('data-state', 'open');
  });

  // Regression for plans/bugs/accordion-collapse-content-visible.md (Ahmad, 2026-05-21).
  // Closed wrappers must carry the `max-h-0` hard-clip + `overflow-hidden` belt-and-suspenders
  // alongside the grid-rows trick — without the cap, closed items leaked ~`pb-{size}` of
  // content under the trigger because `grid-template-rows: 0fr` resolves to the inner's
  // min-content floor (≥ padding-bottom), not zero. The inner must declare `min-h-0`
  // + `overflow-hidden` so the grid track is allowed to shrink past that floor and so its
  // own children are clipped to the (zero-sized) cell during close.
  it('content wrapper carries the max-h-0 + overflow-hidden hard-clip when closed', () => {
    const { container } = render(<ThreeItems />);
    const wrappers = container.querySelectorAll<HTMLDivElement>(
      'div[data-state][class*="grid-rows"]',
    );
    expect(wrappers).toHaveLength(3);
    for (const w of wrappers) {
      expect(w).toHaveAttribute('data-state', 'closed');
      expect(w.className).toContain('max-h-0');
      expect(w.className).toContain('overflow-hidden');
      expect(w.className).toContain('data-[state=open]:max-h-screen');
    }
  });

  it('content inner carries min-h-0 + overflow-hidden (regression: pb-N leak)', () => {
    const { container } = render(<ThreeItems />);
    const innerRegions = container.querySelectorAll<HTMLDivElement>('[role="region"]');
    expect(innerRegions).toHaveLength(3);
    for (const region of innerRegions) {
      expect(region.className).toContain('min-h-0');
      expect(region.className).toContain('overflow-hidden');
    }
  });

  it('inline variant root carries data-variant for state styling hooks', () => {
    const { container } = render(
      <Accordion type="single" variant="ghost">
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const root = container.querySelector('[data-orientation="vertical"]');
    expect(root).toHaveAttribute('data-variant', 'ghost');
  });
});

describe('Accordion — leftIcon + chevron position', () => {
  it('leftIcon renders before the label inside the trigger', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="x">
          <Accordion.Trigger leftIcon={<svg data-testid="leading" />}>Label</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(screen.getByTestId('leading')).toBeInTheDocument();
  });

  it('iconPosition="start" applies order-first to the chevron', () => {
    const { container } = render(
      <Accordion type="single" iconPosition="start">
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const trigger = within(container).getByRole('button');
    const chevron = trigger.querySelector('svg[data-state]');
    expect(chevron?.getAttribute('class')).toContain('order-first');
  });
});

describe('Accordion — ref + overrides + ids', () => {
  it('forwards ref on the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Accordion type="single" ref={ref}>
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges consumer className on the root', () => {
    const { container } = render(
      <Accordion type="single" className="custom-root">
        <Accordion.Item value="x">
          <Accordion.Trigger>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(container.querySelector('.custom-root')).not.toBeNull();
  });

  it('triggers carry id matching their content aria-controls', () => {
    render(<ThreeItems />);
    const trigger = triggerOf('First');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const region = document.getElementById(controls!);
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('role', 'region');
    expect(region).toHaveAttribute('aria-labelledby', trigger.id);
  });
});

describe('Accordion — defensive context errors', () => {
  // Quieting React's noisy "uncaught error" log spam from the intentional throws.
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  it('renders Trigger outside an Accordion throws a descriptive error', () => {
    expect(() => render(<Accordion.Trigger>x</Accordion.Trigger>)).toThrow(
      /Accordion.Trigger.*<Accordion>/,
    );
  });
  it('renders Content outside an Accordion throws a descriptive error', () => {
    expect(() => render(<Accordion.Content>x</Accordion.Content>)).toThrow(
      /Accordion.Content.*<Accordion>/,
    );
  });
  errorSpy.mockRestore();
});

describe('Accordion — onClick passthrough on Trigger', () => {
  it('consumer onClick fires alongside the toggle', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Accordion type="single">
        <Accordion.Item value="x">
          <Accordion.Trigger onClick={onClick}>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    await user.click(triggerOf('x'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(triggerOf('x')).toHaveAttribute('aria-expanded', 'true');
  });

  it('consumer onClick that preventDefaults blocks the toggle', () => {
    const onClick = vi.fn((e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault());
    render(
      <Accordion type="single">
        <Accordion.Item value="x">
          <Accordion.Trigger onClick={onClick}>x</Accordion.Trigger>
          <Accordion.Content>body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    fireEvent.click(triggerOf('x'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(triggerOf('x')).toHaveAttribute('aria-expanded', 'false');
  });
});