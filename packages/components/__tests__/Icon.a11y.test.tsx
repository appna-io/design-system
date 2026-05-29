import { axe, toHaveNoViolations } from 'jest-axe';
import type { SVGProps } from 'react';
import { describe, expect, it } from 'vitest';

import { Icon, IconProvider, createIconRegistry } from '../src/Icon';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

function MailGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

describe('Icon — A11y attributes', () => {
  it('decorative-by-default: aria-hidden=true, no role, no aria-label', () => {
    const { container } = render(<Icon as={MailGlyph} />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBeNull();
  });

  it('label promotes to role=img + aria-label, removes aria-hidden', () => {
    const { container } = render(<Icon as={MailGlyph} label="Inbox" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Inbox');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('explicit decorative wins over label', () => {
    const { container } = render(
      <Icon as={MailGlyph} label="Should-be-ignored" decorative />,
    );
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBeNull();
  });

  it('always sets focusable="false" on the underlying SVG (IE/legacy guard)', () => {
    const { container } = render(<Icon as={MailGlyph} />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('focusable')).toBe('false');
  });
});

describe('Icon — axe (no violations across modes)', () => {
  it('decorative icon next to visible label has 0 violations', async () => {
    const { container } = render(
      <button type="button">
        <Icon as={MailGlyph} /> Inbox
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('meaningful standalone icon button has 0 violations', async () => {
    const { container } = render(
      <button type="button" aria-label="Open menu">
        <Icon as={MailGlyph} />
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('meaningful icon with own label has 0 violations', async () => {
    const { container } = render(<Icon as={MailGlyph} label="Inbox" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('registry-resolved icon has 0 violations', async () => {
    const { container } = render(
      <IconProvider value={createIconRegistry({ mail: MailGlyph })}>
        <Icon name="mail" label="Inbox" />
      </IconProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('asChild path preserves a11y wiring with 0 violations', async () => {
    const { container } = render(
      <Icon asChild label="Wrapped">
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" />
          </svg>
        </span>
      </Icon>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('spinning loader icon has 0 violations', async () => {
    const { container } = render(<Icon as={MailGlyph} spin label="Loading" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
