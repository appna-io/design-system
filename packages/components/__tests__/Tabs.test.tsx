import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from '../src/Tabs';
import type { TabsColor, TabsVariant } from '../src/Tabs';
import { renderWithTheme as render } from './utils';

function ThreeTabs(
  props: Omit<React.ComponentProps<typeof Tabs>, 'children'> & {
    disabledValue?: string;
  } = {},
) {
  const { disabledValue, ...rest } = props;
  return (
    <Tabs {...rest}>
      <Tabs.List aria-label="Three-tab example">
        <Tabs.Trigger value="overview" disabled={disabledValue === 'overview'}>
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger value="activity" disabled={disabledValue === 'activity'}>
          Activity
        </Tabs.Trigger>
        <Tabs.Trigger value="settings" disabled={disabledValue === 'settings'}>
          Settings
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview body</Tabs.Panel>
      <Tabs.Panel value="activity">Activity body</Tabs.Panel>
      <Tabs.Panel value="settings">Settings body</Tabs.Panel>
    </Tabs>
  );
}

function triggerOf(label: string): HTMLButtonElement {
  return screen.getByRole('tab', { name: label }) as HTMLButtonElement;
}

describe('Tabs — rendering', () => {
  it('renders a single tablist with three tabs', () => {
    render(<ThreeTabs defaultValue="overview" />);
    const list = screen.getByRole('tablist', { name: 'Three-tab example' });
    expect(list).toBeInTheDocument();
    expect(within(list).getAllByRole('tab')).toHaveLength(3);
  });

  it('only the active panel is mounted by default', () => {
    render(<ThreeTabs defaultValue="overview" />);
    const panels = screen.getAllByRole('tabpanel');
    expect(panels).toHaveLength(1);
    expect(panels[0]).toHaveTextContent('Overview body');
  });

  it('no panels render when no defaultValue / value is provided', () => {
    render(<ThreeTabs />);
    expect(screen.queryAllByRole('tabpanel')).toHaveLength(0);
  });

  it('emits data-orientation on the root', () => {
    const { container } = render(<ThreeTabs defaultValue="overview" />);
    const root = container.querySelector('[data-orientation="horizontal"]');
    expect(root).not.toBeNull();
  });

  it('emits data-orientation="vertical" when orientation=vertical', () => {
    const { container } = render(<ThreeTabs defaultValue="overview" orientation="vertical" />);
    const root = container.querySelector('[data-orientation="vertical"]');
    expect(root).not.toBeNull();
    const list = screen.getByRole('tablist');
    expect(list).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('Tabs — controlled / uncontrolled', () => {
  it('honors defaultValue on mount (uncontrolled)', () => {
    render(<ThreeTabs defaultValue="activity" />);
    expect(triggerOf('Overview')).toHaveAttribute('aria-selected', 'false');
    expect(triggerOf('Activity')).toHaveAttribute('aria-selected', 'true');
    expect(triggerOf('Settings')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity body');
  });

  it('clicking a trigger activates it and switches the panel', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" />);
    await user.click(triggerOf('Settings'));
    expect(triggerOf('Settings')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Settings body');
  });

  it('controlled value drives the active tab', () => {
    const { rerender } = render(<ThreeTabs value="overview" />);
    expect(triggerOf('Overview')).toHaveAttribute('aria-selected', 'true');
    rerender(<ThreeTabs value="settings" />);
    expect(triggerOf('Settings')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Settings body');
  });

  it('onValueChange fires with the new value when clicked', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<ThreeTabs defaultValue="overview" onValueChange={handler} />);
    await user.click(triggerOf('Activity'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('activity');
  });

  it('controlled re-renders without losing focus or selection', () => {
    function Controlled() {
      const [v, setV] = useState('overview');
      return (
        <>
          <button type="button" onClick={() => setV('settings')}>
            external
          </button>
          <ThreeTabs value={v} onValueChange={setV} />
        </>
      );
    }
    const { container } = render(<Controlled />);
    expect(triggerOf('Overview')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(container).getByText('external'));
    expect(triggerOf('Settings')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs — disabled triggers', () => {
  it('disabled trigger cannot be activated by click', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<ThreeTabs defaultValue="overview" onValueChange={handler} disabledValue="activity" />);
    const activity = triggerOf('Activity');
    expect(activity).toBeDisabled();
    await user.click(activity);
    expect(handler).not.toHaveBeenCalled();
    expect(triggerOf('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled trigger gets data-disabled + aria-disabled', () => {
    render(<ThreeTabs defaultValue="overview" disabledValue="activity" />);
    const activity = triggerOf('Activity');
    expect(activity).toHaveAttribute('data-disabled', 'true');
    expect(activity).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Tabs — ARIA wiring', () => {
  it('every trigger is paired to its panel via aria-controls / id', () => {
    render(<ThreeTabs defaultValue="overview" />);
    const overview = triggerOf('Overview');
    expect(overview).toHaveAttribute('role', 'tab');
    const panelId = overview.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', overview.id);
  });

  it('roving tabindex: only the active trigger is in the tab sequence', () => {
    render(<ThreeTabs defaultValue="activity" />);
    expect(triggerOf('Overview')).toHaveAttribute('tabindex', '-1');
    expect(triggerOf('Activity')).toHaveAttribute('tabindex', '0');
    expect(triggerOf('Settings')).toHaveAttribute('tabindex', '-1');
  });

  it('aria-orientation matches orientation prop', () => {
    const { rerender } = render(<ThreeTabs defaultValue="overview" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    rerender(<ThreeTabs defaultValue="overview" orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('Tabs — Panel forceMount', () => {
  it('panels are kept mounted when forceMount; inactive ones get hidden=""', () => {
    render(
      <Tabs defaultValue="overview" aria-label="forceMount example">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview" forceMount>
          Overview body
        </Tabs.Panel>
        <Tabs.Panel value="activity" forceMount>
          Activity body
        </Tabs.Panel>
      </Tabs>,
    );
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels).toHaveLength(2);
    const active = panels.find((p) => p.textContent === 'Overview body');
    const inactive = panels.find((p) => p.textContent === 'Activity body');
    expect(active).not.toHaveAttribute('hidden');
    expect(inactive).toHaveAttribute('hidden');
  });
});

describe('Tabs — asChild', () => {
  it('renders the trigger as the passed child element', () => {
    render(
      <Tabs defaultValue="/a" aria-label="asChild example">
        <Tabs.List>
          <Tabs.Trigger asChild value="/a">
            <a href="#a">Alpha</a>
          </Tabs.Trigger>
          <Tabs.Trigger asChild value="/b">
            <a href="#b">Beta</a>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="/a">Alpha panel</Tabs.Panel>
        <Tabs.Panel value="/b">Beta panel</Tabs.Panel>
      </Tabs>,
    );
    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha.tagName).toBe('A');
    expect(alpha).toHaveAttribute('href', '#a');
    expect(alpha).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs — variants × colors compile to data-state-driven classes', () => {
  const variants: readonly TabsVariant[] = ['underline', 'solid', 'pills', 'enclosed'];
  const colors: readonly TabsColor[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
  ];

  for (const variant of variants) {
    for (const color of colors) {
      it(`${variant} × ${color} renders with active token classes`, () => {
        render(
          <Tabs variant={variant} color={color} defaultValue="overview" aria-label={`${variant} ${color}`}>
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">o</Tabs.Panel>
            <Tabs.Panel value="activity">a</Tabs.Panel>
          </Tabs>,
        );
        const overview = triggerOf('Overview');
        // Each variant paints the active state with a color token in its class string.
        const cls = overview.className;
        expect(cls).toContain(`data-[state=active]`);
        expect(cls.includes(color)).toBe(true);
      });
    }
  }
});

describe('Tabs — Trigger badge slot', () => {
  it('renders a trailing badge node inside the trigger', () => {
    render(
      <Tabs defaultValue="overview">
        <Tabs.List aria-label="badge example">
          <Tabs.Trigger value="overview" badge={<span data-testid="badge">3</span>}>
            Inbox
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">.</Tabs.Panel>
      </Tabs>,
    );
    // Badge contents fold into the accessible name; that's the intended behavior so SR users
    // hear "Inbox 3 unread" without needing extra `aria-label` plumbing on the consumer side.
    const trigger = screen.getByRole('tab', { name: /Inbox/ });
    expect(within(trigger).getByTestId('badge')).toBeInTheDocument();
  });
});

describe('Tabs — ref forwarding', () => {
  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs ref={ref} defaultValue="overview" aria-label="ref example">
        <Tabs.List>
          <Tabs.Trigger value="overview">O</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">.</Tabs.Panel>
      </Tabs>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards ref to a Trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tabs defaultValue="overview" aria-label="trigger ref example">
        <Tabs.List>
          <Tabs.Trigger ref={ref} value="overview">
            O
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">.</Tabs.Panel>
      </Tabs>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('role')).toBe('tab');
  });
});

describe('Tabs — throws when subparts are used outside root', () => {
  it('Tabs.Trigger outside <Tabs> throws a clear error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Tabs.Trigger value="x">x</Tabs.Trigger>,
      ),
    ).toThrow(/<Tabs\.Trigger> must be rendered inside a <Tabs> ancestor/);
    errorSpy.mockRestore();
  });

  it('Tabs.List outside <Tabs> throws a clear error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tabs.List>x</Tabs.List>)).toThrow(
      /<Tabs\.List> must be rendered inside a <Tabs> ancestor/,
    );
    errorSpy.mockRestore();
  });

  it('Tabs.Panel outside <Tabs> throws a clear error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tabs.Panel value="x">x</Tabs.Panel>)).toThrow(
      /<Tabs\.Panel> must be rendered inside a <Tabs> ancestor/,
    );
    errorSpy.mockRestore();
  });
});