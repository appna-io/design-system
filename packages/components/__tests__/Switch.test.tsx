import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '../src/Switch/Switch';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'outline', 'soft'] as const;

function getInput(): HTMLInputElement {
  return screen.getByRole('switch') as HTMLInputElement;
}

function getTrack(container: HTMLElement): HTMLElement {
  return container.querySelector('span[aria-hidden="true"][data-state]') as HTMLElement;
}

function getThumb(container: HTMLElement): HTMLElement {
  return getTrack(container).firstElementChild as HTMLElement;
}

describe('Switch — rendering', () => {
  it('renders a real <input type="checkbox" role="switch"> inside a <label>', () => {
    render(<Switch>Notifications</Switch>);
    const input = getInput();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.closest('label')).not.toBeNull();
  });

  it('hides the native input visually (sr-only)', () => {
    render(<Switch>x</Switch>);
    expect(getInput().className).toContain('sr-only');
  });

  it('defaults to unchecked with thumb at start position', () => {
    const { container } = render(<Switch>x</Switch>);
    expect(getInput().checked).toBe(false);
    expect(getTrack(container)).toHaveAttribute('data-state', 'unchecked');
    expect(getThumb(container)).toHaveAttribute('data-state', 'unchecked');
  });

  it('defaultChecked initializes uncontrolled state', () => {
    const { container } = render(<Switch defaultChecked>x</Switch>);
    expect(getInput().checked).toBe(true);
    expect(getTrack(container)).toHaveAttribute('data-state', 'checked');
    expect(getThumb(container)).toHaveAttribute('data-state', 'checked');
  });

  it('controlled `checked` drives the input + visual state', () => {
    const { container, rerender } = render(<Switch checked={false}>x</Switch>);
    expect(getInput().checked).toBe(false);
    rerender(<Switch checked>x</Switch>);
    expect(getInput().checked).toBe(true);
    expect(getTrack(container)).toHaveAttribute('data-state', 'checked');
  });

  it('applies size classes to the track', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(<Switch size={size}>x</Switch>);
      const track = getTrack(container);
      const expected = { sm: 'h-4', md: 'h-5', lg: 'h-6' }[size];
      expect(track.className).toContain(expected);
      unmount();
    }
  });

  it('applies shape classes to the track', () => {
    const pill = render(<Switch shape="pill">x</Switch>);
    expect(getTrack(pill.container).className).toContain('rounded-full');
    pill.unmount();
    const square = render(<Switch shape="square">x</Switch>);
    expect(getTrack(square.container).className).toContain('rounded-sm');
  });

  it('thumb slides on state change (translate class flips via data-state)', () => {
    const { container } = render(<Switch size="md">x</Switch>);
    const thumb = getThumb(container);
    expect(thumb.className).toContain('data-[state=checked]:translate-x-4');
  });

  it('solid variant paints `bg-<color>` on the checked track', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Switch variant="solid" color={color} defaultChecked>
          x
        </Switch>,
      );
      expect(getTrack(container).className).toContain(`data-[state=checked]:bg-${color}`);
      unmount();
    }
  });

  it('outline variant keeps the track transparent and colors the thumb on ON', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Switch variant="outline" color={color} defaultChecked>
          x
        </Switch>,
      );
      const track = getTrack(container);
      const thumb = getThumb(container);
      expect(track.className).toContain('bg-transparent');
      expect(track.className).toContain(`data-[state=checked]:border-${color}`);
      expect(thumb.className).toContain(`data-[state=checked]:bg-${color}`);
      unmount();
    }
  });

  it('soft variant uses `-subtle` track + colored thumb', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Switch variant="soft" color={color} defaultChecked>
          x
        </Switch>,
      );
      const track = getTrack(container);
      const thumb = getThumb(container);
      expect(track.className).toContain(`data-[state=checked]:bg-${color}-subtle`);
      expect(track.className).toContain(`data-[state=checked]:border-${color}-border`);
      expect(thumb.className).toContain(`data-[state=checked]:bg-${color}`);
      unmount();
    }
  });

  it('focus-visible ring color matches the active color across every variant × color cell', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { container, unmount } = render(
          <Switch variant={variant} color={color}>
            x
          </Switch>,
        );
        expect(getTrack(container).className).toContain(`peer-focus-visible:ring-${color}`);
        unmount();
      }
    }
  });

  it('thumb has motion-reduce:transition-none for prefers-reduced-motion', () => {
    const { container } = render(<Switch>x</Switch>);
    expect(getThumb(container).className).toContain('motion-reduce:transition-none');
  });
});

describe('Switch — interaction', () => {
  it('clicking the label toggles the switch', async () => {
    render(<Switch>Notifications</Switch>);
    await userEvent.click(screen.getByText('Notifications'));
    expect(getInput().checked).toBe(true);
  });

  it('onCheckedChange fires with the new boolean', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>x</Switch>);
    await userEvent.click(getInput());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.click(getInput());
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('onChange fires alongside onCheckedChange', async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Switch onChange={onChange} onCheckedChange={onCheckedChange}>
        x
      </Switch>,
    );
    await userEvent.click(getInput());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('Space toggles via keyboard', async () => {
    render(<Switch>x</Switch>);
    const input = getInput();
    input.focus();
    await userEvent.keyboard(' ');
    expect(input.checked).toBe(true);
  });

  it('disabled blocks toggling + sets data-disabled on root', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch disabled onCheckedChange={onCheckedChange}>
        x
      </Switch>,
    );
    expect(getInput().disabled).toBe(true);
    expect(getInput().closest('label')).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('x'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('loading blocks toggling, sets aria-busy, and renders a spinner inside the thumb', async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch loading onCheckedChange={onCheckedChange}>
        x
      </Switch>,
    );
    const input = getInput();
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(input.disabled).toBe(true);
    expect(getThumb(container).querySelector('[role="status"]')).not.toBeNull();
    await userEvent.click(getInput());
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('thumbIcon.on renders only when checked; thumbIcon.off only when unchecked', () => {
    const { rerender } = render(
      <Switch thumbIcon={{ on: <span data-testid="on">ON</span>, off: <span data-testid="off">OFF</span> }}>
        x
      </Switch>,
    );
    expect(screen.queryByTestId('off')).not.toBeNull();
    expect(screen.queryByTestId('on')).toBeNull();
    rerender(
      <Switch checked thumbIcon={{ on: <span data-testid="on">ON</span>, off: <span data-testid="off">OFF</span> }}>
        x
      </Switch>,
    );
    expect(screen.queryByTestId('on')).not.toBeNull();
    expect(screen.queryByTestId('off')).toBeNull();
  });

  it('works in fully-controlled mode', async () => {
    function Harness() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch checked={checked} onCheckedChange={setChecked}>
          x
        </Switch>
      );
    }
    render(<Harness />);
    expect(getInput().checked).toBe(false);
    await userEvent.click(getInput());
    expect(getInput().checked).toBe(true);
  });
});

describe('Switch — form participation', () => {
  it('participates in a form submission with name + value', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Switch name="notifications" value="on" defaultChecked>
          Notifications
        </Switch>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('notifications')).toBe('on');
  });

  it('unchecked switch does NOT serialize', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Switch name="notifications" value="on">
          Notifications
        </Switch>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('notifications')).toBeNull();
  });
});

describe('Switch — invalid + description', () => {
  it('invalid sets data-invalid on the track + aria-invalid on the input', () => {
    const { container } = render(<Switch invalid>x</Switch>);
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(getTrack(container)).toHaveAttribute('data-invalid', 'true');
  });

  it('description renders + wires aria-describedby', () => {
    const { container } = render(<Switch description="Settings round-trip via Slack.">x</Switch>);
    const desc = container.querySelector('.text-fg-muted') as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe('Settings round-trip via Slack.');
    expect(getInput().getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('merges consumer aria-describedby with auto description id', () => {
    render(
      <Switch aria-describedby="external" description="Auto desc.">
        x
      </Switch>,
    );
    const ids = (getInput().getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(ids).toContain('external');
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Switch — overrides + ref', () => {
  it('className wins on the root label', () => {
    const { container } = render(<Switch className="opacity-30">x</Switch>);
    const label = container.querySelector('label') as HTMLElement;
    expect(label).toHaveClass('opacity-30');
  });

  it('forwards ref to the underlying <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref}>x</Switch>);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.getAttribute('role')).toBe('switch');
  });

  it('labelPosition="left" reverses the root flex direction', () => {
    const { container } = render(<Switch labelPosition="left">x</Switch>);
    const label = container.querySelector('label') as HTMLElement;
    expect(label.className).toContain('flex-row-reverse');
  });
});