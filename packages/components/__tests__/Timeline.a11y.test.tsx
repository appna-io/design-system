import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Timeline } from '../src/Timeline';
import type { TimelineTone } from '../src/Timeline';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const tones: TimelineTone[] = ['info', 'success', 'warning', 'danger', 'neutral'];

describe('Timeline — accessibility', () => {
  it('root is an <ol> with the provided aria-label', () => {
    render(
      <Timeline aria-label="Audit log">
        <Timeline.Item><Timeline.Title>X</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    const root = document.querySelector('ol[aria-label="Audit log"]')!;
    expect(root).toBeInTheDocument();
  });

  it('items render as <li>', () => {
    render(
      <Timeline>
        <Timeline.Item><Timeline.Title>One</Timeline.Title></Timeline.Item>
        <Timeline.Item><Timeline.Title>Two</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    const items = document.querySelectorAll('ol > li[data-timeline-item]');
    expect(items).toHaveLength(2);
  });

  it('dot and connector are aria-hidden', () => {
    render(
      <Timeline>
        <Timeline.Item><Timeline.Title>X</Timeline.Title></Timeline.Item>
        <Timeline.Item><Timeline.Title>Y</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    document.querySelectorAll('[data-timeline-dot]').forEach((el) => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-timeline-connector]').forEach((el) => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('active item carries aria-current="true"', () => {
    render(
      <Timeline>
        <Timeline.Item active><Timeline.Title>Active</Timeline.Title></Timeline.Item>
        <Timeline.Item><Timeline.Title>Inactive</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    const lis = document.querySelectorAll('li[data-timeline-item]');
    expect(lis[0]).toHaveAttribute('aria-current', 'true');
    expect(lis[1]).not.toHaveAttribute('aria-current');
  });

  it('collapsible title exposes aria-expanded + aria-controls', () => {
    render(
      <Timeline collapsible>
        <Timeline.Item><Timeline.Title>T</Timeline.Title><Timeline.Description>D</Timeline.Description></Timeline.Item>
      </Timeline>,
    );
    const btn = document.querySelector('button[data-timeline-title]')!;
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveAttribute('aria-controls');
  });

  it('Date timestamp renders as <time> with datetime', () => {
    const d = new Date('2026-05-12T09:14:00Z');
    render(
      <Timeline>
        <Timeline.Item timestamp={d}><Timeline.Title>X</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    expect(document.querySelector('time[data-timeline-timestamp]')).toHaveAttribute(
      'datetime',
      d.toISOString(),
    );
  });

  it('no axe violations — default tones × default render', async () => {
    const { container } = render(
      <Timeline aria-label="Events">
        {tones.map((tone) => (
          <Timeline.Item key={tone} tone={tone} timestamp={new Date('2026-05-01T00:00:00Z')}>
            <Timeline.Title>{tone} event</Timeline.Title>
            <Timeline.Description>{tone} description</Timeline.Description>
          </Timeline.Item>
        ))}
      </Timeline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — active emphasis', async () => {
    const { container } = render(
      <Timeline aria-label="Active">
        <Timeline.Item tone="info" active><Timeline.Title>Active</Timeline.Title></Timeline.Item>
        <Timeline.Item tone="neutral"><Timeline.Title>Idle</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — horizontal orientation', async () => {
    const { container } = render(
      <Timeline orientation="horizontal" aria-label="Roadmap">
        <Timeline.Item tone="success" timestamp="Q1"><Timeline.Title>Q1</Timeline.Title></Timeline.Item>
        <Timeline.Item tone="info" timestamp="Q2" active><Timeline.Title>Q2</Timeline.Title></Timeline.Item>
        <Timeline.Item tone="neutral" timestamp="Q3"><Timeline.Title>Q3</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — alternating layout', async () => {
    const { container } = render(
      <Timeline layout="alternating" aria-label="Alternating">
        <Timeline.Item tone="info"><Timeline.Title>One</Timeline.Title><Timeline.Description>Left</Timeline.Description></Timeline.Item>
        <Timeline.Item tone="success"><Timeline.Title>Two</Timeline.Title><Timeline.Description>Right</Timeline.Description></Timeline.Item>
        <Timeline.Item tone="warning"><Timeline.Title>Three</Timeline.Title></Timeline.Item>
      </Timeline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — collapsible disclosure', async () => {
    const { container } = render(
      <Timeline collapsible aria-label="Collapsible">
        <Timeline.Item tone="info"><Timeline.Title>Open me</Timeline.Title><Timeline.Description>Hidden body</Timeline.Description></Timeline.Item>
        <Timeline.Item tone="success"><Timeline.Title>And me</Timeline.Title><Timeline.Description>Hidden body 2</Timeline.Description></Timeline.Item>
      </Timeline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — prop-driven with all fields', async () => {
    const { container } = render(
      <Timeline
        aria-label="Order"
        items={[
          { id: '1', title: 'Placed', description: 'Confirmed.', timestamp: new Date('2026-05-01'), tone: 'success' },
          { id: '2', title: 'Shipped', description: 'EU-DC-2.', timestamp: new Date('2026-05-02'), tone: 'info', active: true },
          { id: '3', title: 'Delivered', timestamp: null, tone: 'neutral' },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
