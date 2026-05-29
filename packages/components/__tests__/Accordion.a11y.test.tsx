import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Accordion } from '../src/Accordion';
import type { AccordionColor, AccordionVariant } from '../src/Accordion';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

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

describe('Accordion — accessibility', () => {
  it('passes axe in the default configuration', async () => {
    const { container } = render(
      <Accordion type="single" defaultValue="one">
        <Accordion.Item value="one">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>Body one</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Body two</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for every variant × color cell', async () => {
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <Accordion
              key={`${variant}-${color}`}
              type="single"
              variant={variant}
              color={color}
              defaultValue="x"
            >
              <Accordion.Item value="x">
                <Accordion.Trigger>{`${variant} ${color}`}</Accordion.Trigger>
                <Accordion.Content>Body</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('every trigger has aria-expanded, aria-controls, id', () => {
    render(
      <Accordion type="multiple" defaultValue={['a']}>
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
      expect(t).toHaveAttribute('aria-expanded');
      expect(t).toHaveAttribute('aria-controls');
      expect(t.id).toBeTruthy();
    }
  });

  it('every content region has role="region", aria-labelledby, id', () => {
    render(
      <Accordion type="multiple" defaultValue={['a']}>
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    // Use { hidden: true } because closed contents have aria-hidden=true; here a is open
    // but other regions in real lists may be hidden — exercise the more permissive query.
    const region = screen.getByRole('region', { hidden: true });
    expect(region.id).toBeTruthy();
    expect(region.getAttribute('aria-labelledby')).toBe(
      screen.getByRole('button', { name: 'A' }).id,
    );
  });

  it('closed content is aria-hidden=true; open content is aria-hidden=false', () => {
    const { container } = render(
      <Accordion type="single" defaultValue="open-one">
        <Accordion.Item value="open-one">
          <Accordion.Trigger>Open</Accordion.Trigger>
          <Accordion.Content>open body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="closed-one">
          <Accordion.Trigger>Closed</Accordion.Trigger>
          <Accordion.Content>closed body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const wrappers = container.querySelectorAll<HTMLDivElement>(
      'div[aria-hidden][class*="grid-rows"]',
    );
    expect(wrappers[0]).toHaveAttribute('aria-hidden', 'false');
    expect(wrappers[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('disabled triggers carry aria-disabled and the native disabled attribute', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a" disabled>
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const t = screen.getByRole('button', { name: 'A' });
    expect(t).toBeDisabled();
    expect(t).toHaveAttribute('aria-disabled', 'true');
  });

  it('chevron icon is aria-hidden', () => {
    const { container } = render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const chevron = container.querySelector('button > svg[aria-hidden="true"]');
    expect(chevron).not.toBeNull();
  });
});
