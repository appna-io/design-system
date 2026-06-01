import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleGroup } from '../src/Toggle';
import type { ToggleColor, ToggleVariant } from '../src/Toggle';
import { renderWithTheme as render } from './utils';

// The runtime <ToggleGroup> accepts a discriminated `type` ("single" | "multiple") and
// our test cases need to vary `type` per render. Statically inferring that through
// `React.ComponentProps<>` collapses to a single branch and rejects perfectly-valid
// configurations. We cast to `any` at the boundary so the runtime contract is the source
// of truth — tests assert behavior, not types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToggleGroupAny = ToggleGroup as any;

function ThreeItems(props: Record<string, unknown> = {}) {
  return (
    <ToggleGroupAny aria-label="View mode" {...props}>
      <ToggleGroup.Item value="grid" aria-label="Grid">
        G
      </ToggleGroup.Item>
      <ToggleGroup.Item value="list" aria-label="List">
        L
      </ToggleGroup.Item>
      <ToggleGroup.Item value="kanban" aria-label="Kanban">
        K
      </ToggleGroup.Item>
    </ToggleGroupAny>
  );
}

describe('ToggleGroup — rendering', () => {
  it('single mode emits role="radiogroup" + items role="radio"', () => {
    render(<ThreeItems />);
    expect(screen.getByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('multiple mode emits role="group" + items role="button"', () => {
    render(<ThreeItems type="multiple" aria-label="Text formatting" />);
    expect(screen.getByRole('group', { name: 'Text formatting' })).toBeInTheDocument();
    // Three role=button items, all aria-pressed
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    for (const b of buttons) {
      expect(b).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('honors defaultValue in single mode', () => {
    render(<ThreeItems defaultValue="list" />);
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Kanban' })).toHaveAttribute('aria-checked', 'false');
  });

  it('honors defaultValue in multiple mode', () => {
    render(
      <ThreeItems
        type="multiple"
        aria-label="Text formatting"
        defaultValue={['grid', 'kanban']}
      />,
    );
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Kanban' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('emits data-orientation + data-attached on the root', () => {
    const { container } = render(<ThreeItems orientation="vertical" attached />);
    const root = container.querySelector('[role="radiogroup"]');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveAttribute('data-attached', 'true');
  });
});

describe('ToggleGroup — single mode behavior', () => {
  it('click presses one item, click another swaps the pressed item', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking the active item clears selection (required=false, default)', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="grid" />);
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'false');
  });

  it('required=true keeps the active item pressed on re-click', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="grid" required />);
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  it('controlled: value flows in, onValueChange flows out', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState<string>('grid');
      return (
        <ToggleGroup
          type="single"
          aria-label="View mode"
          value={v}
          onValueChange={(next) => {
            setV(next);
            onValueChange(next);
          }}
        >
          <ToggleGroup.Item value="grid" aria-label="Grid">
            G
          </ToggleGroup.Item>
          <ToggleGroup.Item value="list" aria-label="List">
            L
          </ToggleGroup.Item>
        </ToggleGroup>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(onValueChange).toHaveBeenCalledWith('list');
  });
});

describe('ToggleGroup — multiple mode behavior', () => {
  it('clicks toggle items independently', async () => {
    const user = userEvent.setup();
    render(<ThreeItems type="multiple" aria-label="Format" />);
    await user.click(screen.getByRole('button', { name: 'Grid' }));
    await user.click(screen.getByRole('button', { name: 'Kanban' }));
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Kanban' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Grid' }));
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('onValueChange receives an array in multiple mode', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ToggleGroup
        type="multiple"
        aria-label="Format"
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="bold" aria-label="Bold">
          B
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" aria-label="Italic">
          I
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['bold']);
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
  });
});

describe('ToggleGroup — keyboard navigation', () => {
  it('single mode: ArrowRight moves AND activates (radio semantics)', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="grid" />);
    screen.getByRole('radio', { name: 'Grid' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
  });

  it('single mode: wrap-around at the end', async () => {
    const user = userEvent.setup();
    render(<ThreeItems defaultValue="kanban" />);
    screen.getByRole('radio', { name: 'Kanban' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  it('multi mode: ArrowRight moves focus WITHOUT activating', async () => {
    const user = userEvent.setup();
    render(<ThreeItems type="multiple" aria-label="Format" />);
    screen.getByRole('button', { name: 'Grid' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'List' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('Home/End jump to first/last enabled item', async () => {
    const user = userEvent.setup();
    render(<ThreeItems />);
    screen.getByRole('radio', { name: 'List' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Kanban' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
  });

  it('disabled items are skipped by Arrow nav', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup aria-label="x">
        <ToggleGroup.Item value="a" aria-label="A">
          A
        </ToggleGroup.Item>
        <ToggleGroup.Item value="b" aria-label="B" disabled>
          B
        </ToggleGroup.Item>
        <ToggleGroup.Item value="c" aria-label="C">
          C
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    screen.getByRole('radio', { name: 'A' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
  });

  it('vertical orientation maps ArrowDown/Up to navigation', async () => {
    const user = userEvent.setup();
    render(<ThreeItems orientation="vertical" />);
    screen.getByRole('radio', { name: 'Grid' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
  });
});

describe('ToggleGroup — disabled cascade', () => {
  it('root disabled disables all items', () => {
    render(<ThreeItems disabled />);
    for (const r of screen.getAllByRole('radio')) {
      expect(r).toBeDisabled();
    }
  });

  it('per-item disabled only affects that item', () => {
    render(
      <ToggleGroup aria-label="x">
        <ToggleGroup.Item value="a" aria-label="A">
          A
        </ToggleGroup.Item>
        <ToggleGroup.Item value="b" aria-label="B" disabled>
          B
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
  });
});

describe('ToggleGroup — attached / segmented styling', () => {
  it('emits data-attached-position on each item when attached=true', () => {
    render(<ThreeItems attached />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('data-attached-position', 'first');
    expect(radios[1]).toHaveAttribute('data-attached-position', 'middle');
    expect(radios[2]).toHaveAttribute('data-attached-position', 'last');
  });

  it('omits data-attached-position when attached=false', () => {
    render(<ThreeItems />);
    const radios = screen.getAllByRole('radio');
    for (const r of radios) {
      expect(r).not.toHaveAttribute('data-attached-position');
    }
  });

  it('single-item attached uses position "single" (no rounding drops)', () => {
    render(
      <ToggleGroup aria-label="x" attached>
        <ToggleGroup.Item value="solo" aria-label="Solo">
          S
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Solo' })).toHaveAttribute(
      'data-attached-position',
      'single',
    );
  });
});

describe('ToggleGroup — variant × color smoke', () => {
  const VARIANTS: readonly ToggleVariant[] = ['solid', 'outline', 'ghost'];
  const COLORS: readonly ToggleColor[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
  ];

  it('mounts every cell without crashing', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { unmount } = render(
          <ToggleGroup aria-label="x" variant={variant} color={color}>
            <ToggleGroup.Item value="a" aria-label="A">
              A
            </ToggleGroup.Item>
          </ToggleGroup>,
        );
        unmount();
      }
    }
  });
});

describe('ToggleGroup — ref + defensive', () => {
  it('throws if Item renders outside a ToggleGroup', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <ToggleGroup.Item value="a" aria-label="A">
          A
        </ToggleGroup.Item>,
      ),
    ).toThrow(/ToggleGroup\.Item.*<ToggleGroup>/);
    errSpy.mockRestore();
  });

  it('roving tabindex: in single mode only the pressed item is tabbable', () => {
    const { container } = render(<ThreeItems defaultValue="list" />);
    const items = within(container).getAllByRole('radio');
    expect(items[0]).toHaveAttribute('tabindex', '-1');
    expect(items[1]).toHaveAttribute('tabindex', '0');
    expect(items[2]).toHaveAttribute('tabindex', '-1');
  });

  it('roving tabindex: when nothing pressed, only the first item is tabbable', () => {
    const { container } = render(<ThreeItems />);
    const items = within(container).getAllByRole('radio');
    expect(items[0]).toHaveAttribute('tabindex', '0');
    expect(items[1]).toHaveAttribute('tabindex', '-1');
    expect(items[2]).toHaveAttribute('tabindex', '-1');
  });

  it('multi mode: every item has tabindex=0', () => {
    const { container } = render(<ThreeItems type="multiple" aria-label="x" />);
    const items = within(container).getAllByRole('button');
    for (const i of items) {
      expect(i).toHaveAttribute('tabindex', '0');
    }
  });
});