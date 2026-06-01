import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Stepper, type StepData } from '../src/Stepper';
import { renderWithTheme as render } from './utils';

const STEPS: StepData[] = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

describe('Stepper — rendering', () => {
  it('renders an ordered list with aria-label="Progress"', () => {
    render(<Stepper active={0} steps={STEPS} />);
    const list = screen.getByRole('list', { name: 'Progress' });
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL');
  });

  it('renders one item per step', () => {
    const { container } = render(<Stepper active={0} steps={STEPS} />);
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items).toHaveLength(4);
  });

  it('paints aria-current="step" on the active step', () => {
    const { container } = render(<Stepper active={2} steps={STEPS} />);
    const currents = container.querySelectorAll('[aria-current="step"]');
    // The <li> + indicator both carry aria-current; we only assert that one of them lines up
    // with the active step's label.
    const activeItem = container.querySelector('[data-stepper-item][aria-current="step"]');
    expect(activeItem).not.toBeNull();
    expect(within(activeItem as HTMLElement).getByText('Plan')).toBeInTheDocument();
    expect(currents.length).toBeGreaterThanOrEqual(1);
  });

  it('renders n-1 connectors between n steps', () => {
    const { container } = render(<Stepper active={0} steps={STEPS} />);
    const connectors = container.querySelectorAll('[data-stepper-connector]');
    expect(connectors).toHaveLength(3);
    connectors.forEach((c) => {
      expect(c.getAttribute('role')).toBe('presentation');
      expect(c.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('passes through the orientation as a data attribute', () => {
    const { container } = render(<Stepper active={0} steps={STEPS} orientation="vertical" />);
    const root = container.querySelector('[data-orientation]');
    expect(root?.getAttribute('data-orientation')).toBe('vertical');
  });

  it('renders step numbers for the numbered variant', () => {
    render(<Stepper active={2} steps={STEPS} />);
    // Step 4 hasn't been reached → still shows "4"
    expect(screen.getByText('4')).toBeInTheDocument();
    // The completed steps show a check; we can't assert the SVG text but the absence of "1"/"2"
    // confirms they swapped to checks.
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.queryByText('2')).toBeNull();
  });

  it('renders descriptions when provided', () => {
    render(
      <Stepper
        active={0}
        steps={[
          { id: 'a', label: 'Sign up', description: 'Email + password' },
          { id: 'b', label: 'Confirm' },
        ]}
      />,
    );
    expect(screen.getByText('Email + password')).toBeInTheDocument();
  });

  it('hides labels when showLabels=false', () => {
    render(<Stepper active={0} steps={STEPS} showLabels={false} />);
    expect(screen.queryByText('Account')).toBeNull();
    expect(screen.queryByText('Profile')).toBeNull();
  });

  it('hides descriptions when showDescriptions=false', () => {
    render(
      <Stepper
        active={0}
        steps={[{ id: 'a', label: 'Sign up', description: 'hidden me' }]}
        showDescriptions={false}
      />,
    );
    expect(screen.queryByText('hidden me')).toBeNull();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });
});

describe('Stepper — status auto-derivation', () => {
  it('paints complete / active / pending statuses on data-status', () => {
    const { container } = render(<Stepper active={2} steps={STEPS} />);
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items[0]?.getAttribute('data-status')).toBe('complete');
    expect(items[1]?.getAttribute('data-status')).toBe('complete');
    expect(items[2]?.getAttribute('data-status')).toBe('active');
    expect(items[3]?.getAttribute('data-status')).toBe('pending');
  });

  it('honors explicit status: error', () => {
    const { container } = render(
      <Stepper
        active={2}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', status: 'error' },
          { id: 'c', label: 'C' },
        ]}
      />,
    );
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items[1]?.getAttribute('data-status')).toBe('error');
  });

  it('honors explicit status: loading and renders a spinner', () => {
    const { container } = render(
      <Stepper
        active={1}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', status: 'loading' },
        ]}
      />,
    );
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items[1]?.getAttribute('data-status')).toBe('loading');
    // Spinner mounts a role="status" element internally.
    const statusEls = container.querySelectorAll('[role="status"]');
    expect(statusEls.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Stepper — connectors', () => {
  it('connector status follows the preceding step', () => {
    const { container } = render(<Stepper active={2} steps={STEPS} />);
    const connectors = container.querySelectorAll('[data-stepper-connector]');
    expect(connectors[0]?.getAttribute('data-status')).toBe('complete');
    expect(connectors[1]?.getAttribute('data-status')).toBe('complete');
    expect(connectors[2]?.getAttribute('data-status')).toBe('active');
  });

  it('connector after error paints error', () => {
    const { container } = render(
      <Stepper
        active={1}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', status: 'error' },
          { id: 'c', label: 'C' },
        ]}
      />,
    );
    const connectors = container.querySelectorAll('[data-stepper-connector]');
    expect(connectors[1]?.getAttribute('data-status')).toBe('error');
  });

  it('connector override wraps the consumer-supplied node in an <li>', () => {
    const { container } = render(
      <Stepper
        active={0}
        steps={STEPS.slice(0, 2)}
        connector={<span data-testid="custom-connector">~</span>}
      />,
    );
    expect(screen.getByTestId('custom-connector')).toBeInTheDocument();
    const connectorLi = container.querySelector('[data-stepper-connector]');
    expect(connectorLi?.tagName).toBe('LI');
  });
});

describe('Stepper — clickability', () => {
  it('renders plain (no buttons) when clickable=false', () => {
    render(<Stepper active={0} steps={STEPS} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders buttons when clickable=true and fires onStepClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Stepper active={1} steps={STEPS} clickable onStepClick={onClick} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    await user.click(buttons[0] as HTMLElement);
    expect(onClick).toHaveBeenCalledWith({ id: 'a', index: 0 });

    await user.click(buttons[3] as HTMLElement);
    expect(onClick).toHaveBeenCalledWith({ id: 'd', index: 3 });
  });

  it('clickable="completed" only fires for completed steps', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Stepper active={2} steps={STEPS} clickable="completed" onStepClick={onClick} />,
    );

    // All steps render as buttons in interactive mode, but only completed ones are non-disabled.
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
    expect(buttons[2]).toBeDisabled();
    expect(buttons[3]).toBeDisabled();

    await user.click(buttons[0] as HTMLElement);
    expect(onClick).toHaveBeenCalledWith({ id: 'a', index: 0 });
    onClick.mockClear();
    // Clicking a disabled button does nothing.
    await user.click(buttons[2] as HTMLElement);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('linear mode disables pending steps', () => {
    render(
      <Stepper active={1} steps={STEPS} clickable linear onStepClick={() => {}} />,
    );
    const buttons = screen.getAllByRole('button');
    // Steps 0 and 1 are clickable; steps 2 and 3 are pending → disabled.
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
    expect(buttons[2]).toBeDisabled();
    expect(buttons[3]).toBeDisabled();
  });

  it('disabled step blocks click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Stepper
        active={1}
        clickable
        onStepClick={onClick}
        steps={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', disabled: true },
          { id: 'c', label: 'C' },
        ]}
      />,
    );
    const disabledButton = screen.getAllByRole('button')[1] as HTMLButtonElement;
    expect(disabledButton).toBeDisabled();
    await user.click(disabledButton);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keyboard Enter activates a clickable step', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Stepper active={1} steps={STEPS} clickable onStepClick={onClick} />);

    const button = screen.getAllByRole('button')[0] as HTMLButtonElement;
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledWith({ id: 'a', index: 0 });
  });
});

describe('Stepper — compound API', () => {
  it('renders compound children with the same DOM shape', () => {
    const { container } = render(
      <Stepper active={1}>
        <Stepper.Step id="a" label="One" />
        <Stepper.Step id="b" label="Two" />
        <Stepper.Step id="c" label="Three" />
      </Stepper>,
    );
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items).toHaveLength(3);
    expect(items[0]?.getAttribute('data-status')).toBe('complete');
    expect(items[1]?.getAttribute('data-status')).toBe('active');
    expect(items[2]?.getAttribute('data-status')).toBe('pending');
  });

  it('renders expanded content under the active step in vertical mode', () => {
    render(
      <Stepper active={1} orientation="vertical">
        <Stepper.Step id="a" label="One">
          <div data-testid="a-content">A panel</div>
        </Stepper.Step>
        <Stepper.Step id="b" label="Two">
          <div data-testid="b-content">B panel</div>
        </Stepper.Step>
      </Stepper>,
    );
    expect(screen.queryByTestId('a-content')).toBeNull();
    expect(screen.getByTestId('b-content')).toBeInTheDocument();
  });

  it('compound children respect explicit status override', () => {
    const { container } = render(
      <Stepper active={0}>
        <Stepper.Step id="a" label="One" />
        <Stepper.Step id="b" label="Two" status="error" />
      </Stepper>,
    );
    const items = container.querySelectorAll('[data-stepper-item]');
    expect(items[1]?.getAttribute('data-status')).toBe('error');
    const connector = container.querySelector('[data-stepper-connector]');
    // Connector mirrors the preceding step (still "active" because index 0 === activeIndex).
    expect(connector?.getAttribute('data-status')).toBe('active');
  });

  it('warns when both steps and children are provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Stepper active={0} steps={STEPS}>
        <Stepper.Step id="x" label="Ignored" />
      </Stepper>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('received both `steps` and children'),
    );
    warn.mockRestore();
  });
});

describe('Stepper — icons', () => {
  it('renders consumer-supplied per-step icon', () => {
    render(
      <Stepper
        active={0}
        steps={[
          { id: 'a', label: 'A', icon: <span data-testid="custom-icon">★</span> },
        ]}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('uses custom completedIcon when provided', () => {
    const { container } = render(
      <Stepper
        active={2}
        steps={STEPS}
        completedIcon={<span data-testid="custom-check">D</span>}
      />,
    );
    const checks = container.querySelectorAll('[data-testid="custom-check"]');
    // Steps 0 and 1 are completed.
    expect(checks).toHaveLength(2);
  });
});

describe('Stepper — ref + DOM passthrough', () => {
  it('forwards ref to the <ol> root', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Stepper ref={ref} active={0} steps={STEPS} />);
    expect(ref.current).toBeInstanceOf(HTMLOListElement);
  });

  it('forwards arbitrary HTML props onto the <ol>', () => {
    render(<Stepper active={0} steps={STEPS} data-testid="stepper-root" />);
    expect(screen.getByTestId('stepper-root').tagName).toBe('OL');
  });

  it('supports overriding aria-label', () => {
    render(<Stepper active={0} steps={STEPS} aria-label="Checkout flow" />);
    expect(screen.getByRole('list', { name: 'Checkout flow' })).toBeInTheDocument();
  });
});

describe('Stepper — fireEvent button click (regression)', () => {
  it('fireEvent.click on a clickable step fires onStepClick', () => {
    const onClick = vi.fn();
    render(<Stepper active={1} steps={STEPS} clickable onStepClick={onClick} />);
    fireEvent.click(screen.getAllByRole('button')[0] as HTMLElement);
    expect(onClick).toHaveBeenCalledWith({ id: 'a', index: 0 });
  });
});