import { fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from '../src/Sidebar';
import { renderWithTheme as render } from './utils';

describe('Sidebar.Section — collapsible', () => {
  it('static (default) section renders all items with an h3 heading', () => {
    render(
      <Sidebar>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Workspace' });
    expect(heading.tagName).toBe('H3');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('collapsible section renders a toggle button with aria-expanded', () => {
    render(
      <Sidebar>
        <Sidebar.Section label="Workspace" collapsible defaultOpen={false}>
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    const toggle = screen.getByRole('button', { name: /Workspace/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggle button flips open state and aria-expanded', () => {
    render(
      <Sidebar>
        <Sidebar.Section label="Workspace" collapsible defaultOpen={false}>
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    const toggle = screen.getByRole('button', { name: /Workspace/ });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('controlled open state stays in sync with the consumer prop', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open programmatically</button>
          <Sidebar>
            <Sidebar.Section label="Controlled" collapsible open={open} onOpenChange={setOpen}>
              <Sidebar.Item href="/">Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar>
        </>
      );
    }
    render(<Harness />);
    const toggle = screen.getByRole('button', { name: /Controlled/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(screen.getByText('open programmatically'));
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('fires onOpenChange on uncontrolled toggle', () => {
    const onOpenChange = vi.fn();
    render(
      <Sidebar>
        <Sidebar.Section
          label="Workspace"
          collapsible
          defaultOpen={false}
          onOpenChange={onOpenChange}
        >
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Workspace/ }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders an optional badge beside the section label', () => {
    render(
      <Sidebar>
        <Sidebar.Section label="Workspace" badge={12} badgeColor="primary">
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('Sidebar.Item — expandable + SubItems', () => {
  it('toggles aria-expanded when the trigger is clicked', () => {
    render(
      <Sidebar>
        <Sidebar.Item expandable defaultExpanded={false}>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>,
    );
    const trigger = screen.getByRole('button', { name: /Documents/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('sub-items render inside a role="group" list', () => {
    render(
      <Sidebar>
        <Sidebar.Item expandable defaultExpanded>
          Documents
          <Sidebar.SubItems data-testid="subs">
            <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
            <Sidebar.Item href="/docs/api">API</Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>,
    );
    const group = screen.getByTestId('subs');
    expect(group.tagName).toBe('UL');
    expect(group.getAttribute('role')).toBe('group');
    expect(within(group).getByRole('link', { name: 'Intro' })).toBeInTheDocument();
    expect(within(group).getByRole('link', { name: 'API' })).toBeInTheDocument();
  });

  it('controlled expanded state stays in sync', () => {
    const onExpandedChange = vi.fn();
    function Harness() {
      const [expanded, setExpanded] = useState(false);
      return (
        <Sidebar>
          <Sidebar.Item
            expandable
            expanded={expanded}
            onExpandedChange={(next) => {
              onExpandedChange(next);
              setExpanded(next);
            }}
          >
            Documents
            <Sidebar.SubItems>
              <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
            </Sidebar.SubItems>
          </Sidebar.Item>
        </Sidebar>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: /Documents/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('aria-controls on the trigger points at the sub-items wrapper', () => {
    render(
      <Sidebar>
        <Sidebar.Item expandable defaultExpanded>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>,
    );
    const trigger = screen.getByRole('button', { name: /Documents/ });
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).not.toBeNull();
  });
});
