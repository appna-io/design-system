import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Timeline } from '../src/Timeline';
import type { TimelineItemData } from '../src/Timeline';
import { renderWithTheme as render } from './utils';

const items: TimelineItemData[] = [
  { id: '1', title: 'A', tone: 'success' },
  { id: '2', title: 'B', tone: 'info', active: true },
  { id: '3', title: 'C', tone: 'neutral' },
];

describe('Timeline — prop-driven API', () => {
  it('renders all items in document order', () => {
    render(<Timeline items={items} />);
    const liElements = document.querySelectorAll('[data-timeline-item]');
    expect(liElements).toHaveLength(3);
    expect(liElements[0]).toHaveTextContent('A');
    expect(liElements[2]).toHaveTextContent('C');
  });

  it('renders as <ol> with aria-label', () => {
    render(<Timeline items={items} aria-label="My timeline" />);
    const root = screen.getByRole('list', { name: 'My timeline' });
    expect(root.tagName).toBe('OL');
  });

  it('defaults aria-label to "Timeline"', () => {
    render(<Timeline items={items} />);
    expect(screen.getByRole('list', { name: 'Timeline' })).toBeInTheDocument();
  });

  it('applies tone data attribute per item', () => {
    render(<Timeline items={items} />);
    const liElements = document.querySelectorAll('[data-timeline-item]');
    expect(liElements[0]).toHaveAttribute('data-tone', 'success');
    expect(liElements[1]).toHaveAttribute('data-tone', 'info');
    expect(liElements[2]).toHaveAttribute('data-tone', 'neutral');
  });

  it('active item carries aria-current="true"', () => {
    render(<Timeline items={items} />);
    const liElements = document.querySelectorAll('[data-timeline-item]');
    expect(liElements[1]).toHaveAttribute('aria-current', 'true');
    expect(liElements[0]).not.toHaveAttribute('aria-current');
  });

  it('renders description and media when provided', () => {
    render(
      <Timeline
        items={[
          {
            id: '1',
            title: 'T',
            description: 'desc',
            media: <span data-testid="m">media</span>,
          },
        ]}
      />,
    );
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByTestId('m')).toBeInTheDocument();
  });
});

describe('Timeline — compound API', () => {
  it('compound children render and replace prop-driven items', () => {
    render(
      <Timeline items={items}>
        <Timeline.Item id="x" tone="success">
          <Timeline.Title>Compound</Timeline.Title>
          <Timeline.Description>Body</Timeline.Description>
        </Timeline.Item>
      </Timeline>,
    );
    expect(document.querySelectorAll('[data-timeline-item]')).toHaveLength(1);
    expect(screen.getByText('Compound')).toBeInTheDocument();
    expect(screen.queryByText('A')).toBeNull();
  });

  it('Timeline.Timestamp with Date value renders <time> with dateTime', () => {
    const d = new Date('2026-05-12T09:14:00Z');
    render(
      <Timeline>
        <Timeline.Item id="x">
          <Timeline.Title>X</Timeline.Title>
          <Timeline.Timestamp value={d} />
        </Timeline.Item>
      </Timeline>,
    );
    const t = document.querySelector('time[data-timeline-timestamp]')!;
    expect(t).toBeInTheDocument();
    expect(t).toHaveAttribute('datetime', d.toISOString());
  });

  it('Timeline.Timestamp with string value renders <span> passthrough', () => {
    render(
      <Timeline>
        <Timeline.Item id="x">
          <Timeline.Title>X</Timeline.Title>
          <Timeline.Timestamp value="Yesterday" />
        </Timeline.Item>
      </Timeline>,
    );
    expect(document.querySelector('time[data-timeline-timestamp]')).toBeNull();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('Timeline.Item accepts a timestamp prop that renders via Timestamp slot', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    render(
      <Timeline>
        <Timeline.Item id="x" timestamp={d}>
          <Timeline.Title>X</Timeline.Title>
        </Timeline.Item>
      </Timeline>,
    );
    expect(document.querySelector('time[data-timeline-timestamp]')).toHaveAttribute(
      'datetime',
      d.toISOString(),
    );
  });

  it('null timestamp hides the timestamp slot', () => {
    render(
      <Timeline>
        <Timeline.Item id="x" timestamp={null}>
          <Timeline.Title>X</Timeline.Title>
        </Timeline.Item>
      </Timeline>,
    );
    expect(document.querySelector('[data-timeline-timestamp]')).toBeNull();
  });
});

describe('Timeline — orientation, layout, size, responsive', () => {
  it('default orientation is vertical', () => {
    render(<Timeline items={items} />);
    expect(document.querySelector('[data-timeline]')!).toHaveAttribute('data-orientation', 'vertical');
  });

  it('orientation="horizontal" sets the data attribute', () => {
    render(<Timeline items={items} orientation="horizontal" />);
    expect(document.querySelector('[data-timeline]')!).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('layout="alternating" data attribute is set', () => {
    render(<Timeline items={items} layout="alternating" />);
    expect(document.querySelector('[data-timeline]')!).toHaveAttribute('data-layout', 'alternating');
  });

  it('size data attribute is forwarded', () => {
    render(<Timeline items={items} size="lg" />);
    expect(document.querySelector('[data-timeline]')!).toHaveAttribute('data-size', 'lg');
  });
});

describe('Timeline — collapsible disclosure', () => {
  it('collapsible: title renders as <button> with aria-expanded=false initially', () => {
    render(
      <Timeline collapsible>
        <Timeline.Item id="x">
          <Timeline.Title>Toggle me</Timeline.Title>
          <Timeline.Description>Hidden initially.</Timeline.Description>
        </Timeline.Item>
      </Timeline>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle me' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hidden initially.')).toBeNull();
  });

  it('collapsible: click toggles aria-expanded and reveals description', () => {
    render(
      <Timeline collapsible>
        <Timeline.Item id="x">
          <Timeline.Title>Toggle me</Timeline.Title>
          <Timeline.Description>Now visible.</Timeline.Description>
        </Timeline.Item>
      </Timeline>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle me' });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Now visible.')).toBeInTheDocument();

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Now visible.')).toBeNull();
  });

  it('non-collapsible: title is a span (no button)', () => {
    render(
      <Timeline>
        <Timeline.Item id="x">
          <Timeline.Title>Plain title</Timeline.Title>
        </Timeline.Item>
      </Timeline>,
    );
    expect(screen.queryByRole('button', { name: 'Plain title' })).toBeNull();
    expect(screen.getByText('Plain title')).toBeInTheDocument();
  });

  it('aria-controls on the title button references the description id', () => {
    render(
      <Timeline collapsible>
        <Timeline.Item id="abc">
          <Timeline.Title>Toggle</Timeline.Title>
          <Timeline.Description>Body</Timeline.Description>
        </Timeline.Item>
      </Timeline>,
    );
    const btn = screen.getByRole('button', { name: 'Toggle' });
    const controlsId = btn.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    fireEvent.click(btn);
    expect(document.getElementById(controlsId!)).toHaveTextContent('Body');
  });
});

describe('Timeline — onItemClick', () => {
  it('fires when a non-collapsible item title is clicked', () => {
    const fn = vi.fn();
    render(
      <Timeline onItemClick={fn}>
        <Timeline.Item id="hello">
          <Timeline.Title>Click me</Timeline.Title>
        </Timeline.Item>
      </Timeline>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(fn).toHaveBeenCalledWith('hello');
  });

  it('fires in addition to toggle when collapsible+onItemClick are both set', () => {
    const fn = vi.fn();
    render(
      <Timeline collapsible onItemClick={fn}>
        <Timeline.Item id="combo">
          <Timeline.Title>Click and expand</Timeline.Title>
          <Timeline.Description>Body</Timeline.Description>
        </Timeline.Item>
      </Timeline>,
    );
    const btn = screen.getByRole('button', { name: 'Click and expand' });
    fireEvent.click(btn);
    expect(fn).toHaveBeenCalledWith('combo');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});

/**
 * The connector rail (#15). This had no coverage, which is how it shipped broken: the root
 * carried TWO hide rules, and the extra one was `[&:last-child>li>[data-timeline-connector]]`
 * — "when the timeline ITSELF is the last child of its container, hide every item's connector".
 * A timeline at the end of a card or section is the normal case, so the rail vanished; 63 of 63
 * connectors were hidden in the DS's own docs.
 *
 * JSDOM applies no stylesheets, so visibility can't be computed here. What CAN be pinned is the
 * invariant that broke: a rule on the root must never be conditioned on the root's own position
 * among its siblings, because that says nothing about its children.
 */
describe('Timeline — connector rail', () => {
  it('renders one connector per item', () => {
    const { container } = render(<Timeline items={items} />);
    expect(container.querySelectorAll('[data-timeline-connector]')).toHaveLength(items.length);
  });

  it('hides only the LAST item\'s connector', () => {
    const { container } = render(<Timeline items={items} />);
    const root = container.querySelector('[data-timeline]')!;
    expect(root.className).toContain('[&>li:last-child>[data-timeline-connector]]:hidden');
  });

  it('carries no rule conditioned on the ROOT\'s own sibling position', () => {
    // The regression guard. `&:last-child…` on the root means "depending on where the timeline
    // sits in ITS parent" — which must never decide what its own children look like.
    const { container } = render(<Timeline items={items} />);
    const root = container.querySelector('[data-timeline]')!;
    expect(root.className).not.toContain('[&:last-child');
  });

  it('is unaffected by being the last child of its container', () => {
    // The exact shape that broke: a timeline at the end of a section. Every connector must still
    // be there, and the root must carry the same single rule as when it has siblings.
    const { container } = render(
      <div>
        <p>Some preceding copy</p>
        <Timeline items={items} />
      </div>,
    );
    const root = container.querySelector('[data-timeline]')!;
    expect(root.parentElement!.lastElementChild).toBe(root);
    expect(container.querySelectorAll('[data-timeline-connector]')).toHaveLength(items.length);
    expect(root.className).not.toContain('[&:last-child');
  });

  it('keeps the connector a direct child of its item, which the rule depends on', () => {
    // `&>li:last-child>[data-timeline-connector]` uses the child combinator; if the connector
    // were ever nested inside the indicator wrapper the rule would silently stop matching and
    // the last item would grow a dangling rail.
    const { container } = render(<Timeline items={items} />);
    for (const connector of container.querySelectorAll('[data-timeline-connector]')) {
      expect(connector.parentElement!.tagName).toBe('LI');
    }
  });
});

