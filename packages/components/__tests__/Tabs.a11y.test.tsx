import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Tabs } from '../src/Tabs';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

function tab(label: string) {
  return screen.getByRole('tab', { name: label }) as HTMLButtonElement;
}

function ThreeTabs(
  props: Omit<React.ComponentProps<typeof Tabs>, 'children'> = {},
) {
  return (
    <Tabs {...props}>
      <Tabs.List aria-label="three">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview body</Tabs.Panel>
      <Tabs.Panel value="activity">Activity body</Tabs.Panel>
      <Tabs.Panel value="settings">Settings body</Tabs.Panel>
    </Tabs>
  );
}

describe('Tabs — a11y axe', () => {
  it('default horizontal underline tabs pass axe', async () => {
    const { container } = render(<ThreeTabs defaultValue="overview" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('vertical orientation passes axe', async () => {
    const { container } = render(<ThreeTabs defaultValue="overview" orientation="vertical" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('solid variant + secondary color passes axe', async () => {
    const { container } = render(
      <ThreeTabs defaultValue="overview" variant="solid" color="secondary" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('with a disabled trigger passes axe', async () => {
    const { container } = render(
      <Tabs defaultValue="overview" aria-label="disabled axe">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="settings" disabled>
            Settings
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview body</Tabs.Panel>
        <Tabs.Panel value="settings">Settings body</Tabs.Panel>
      </Tabs>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Tabs — keyboard navigation (automatic activation)', () => {
  it('ArrowRight moves focus + activates next trigger', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Activity'));
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowLeft wraps from first to last', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Settings'));
    expect(tab('Settings')).toHaveAttribute('aria-selected', 'true');
  });

  it('Home jumps to the first enabled trigger', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="settings" />);
    tab('Settings').focus();
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('Overview'));
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('End jumps to the last enabled trigger', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" />);
    tab('Overview').focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tab('Settings'));
    expect(tab('Settings')).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-key navigation skips disabled triggers', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview" aria-label="skip-disabled">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity" disabled>
            Activity
          </Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">o</Tabs.Panel>
        <Tabs.Panel value="activity">a</Tabs.Panel>
        <Tabs.Panel value="settings">s</Tabs.Panel>
      </Tabs>,
    );
    tab('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Settings'));
  });

  it('vertical orientation uses ArrowDown / ArrowUp', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" orientation="vertical" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Activity'));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(tab('Overview'));
  });

  it('horizontal arrow keys are no-ops in vertical orientation', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" orientation="vertical" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Overview'));
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs — keyboard navigation (manual activation)', () => {
  it('arrow keys move focus only; Enter activates', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" activation="manual" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Activity'));
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'false');
    await user.keyboard('{Enter}');
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
  });

  it('Space also activates in manual mode', async () => {
    const user = userEvent.setup();
    render(<ThreeTabs defaultValue="overview" activation="manual" />);
    tab('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard(' ');
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs — RTL keyboard direction', () => {
  it('horizontal arrow keys reverse direction inside dir=rtl', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <ThreeTabs defaultValue="overview" />
      </div>,
    );
    tab('Overview').focus();
    // In RTL, ArrowRight moves to the *previous* tab visually, which means wrapping back to Settings.
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Settings'));
  });
});