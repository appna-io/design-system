import type { SVGProps } from 'react';
import { describe, expect, it } from 'vitest';

import { Icon } from '../src/Icon';
import { renderWithTheme as render } from './utils';

function MailGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg data-testid="svg" viewBox="0 0 24 24" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

describe('Icon — transform utility props', () => {
  it('rotate=90 applies the rotate-90 class', () => {
    const { container } = render(<Icon as={MailGlyph} rotate={90} />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('class') ?? '').toMatch(/rotate-90/);
  });

  it('rotate=180 applies the rotate-180 class', () => {
    const { container } = render(<Icon as={MailGlyph} rotate={180} />);
    expect((container.querySelector('svg') as SVGElement).getAttribute('class') ?? '').toMatch(
      /rotate-180/,
    );
  });

  it('rotate=270 applies the -rotate-90 class', () => {
    const { container } = render(<Icon as={MailGlyph} rotate={270} />);
    expect((container.querySelector('svg') as SVGElement).getAttribute('class') ?? '').toMatch(
      /-rotate-90/,
    );
  });

  it('flip="horizontal" applies scale-x-[-1]', () => {
    const { container } = render(<Icon as={MailGlyph} flip="horizontal" />);
    expect((container.querySelector('svg') as SVGElement).getAttribute('class') ?? '').toMatch(
      /scale-x-\[-1\]/,
    );
  });

  it('flip="vertical" applies scale-y-[-1]', () => {
    const { container } = render(<Icon as={MailGlyph} flip="vertical" />);
    expect((container.querySelector('svg') as SVGElement).getAttribute('class') ?? '').toMatch(
      /scale-y-\[-1\]/,
    );
  });

  it('flip="both" applies both scale axes', () => {
    const { container } = render(<Icon as={MailGlyph} flip="both" />);
    const cls = (container.querySelector('svg') as SVGElement).getAttribute('class') ?? '';
    expect(cls).toMatch(/scale-x-\[-1\]/);
    expect(cls).toMatch(/scale-y-\[-1\]/);
  });

  it('spin applies animate-spin + motion-reduce:animate-none', () => {
    const { container } = render(<Icon as={MailGlyph} spin />);
    const cls = (container.querySelector('svg') as SVGElement).getAttribute('class') ?? '';
    expect(cls).toMatch(/animate-spin/);
    expect(cls).toMatch(/motion-reduce:animate-none/);
  });

  it('rotate=0 (default) does NOT add a rotate class', () => {
    const { container } = render(<Icon as={MailGlyph} />);
    const cls = (container.querySelector('svg') as SVGElement).getAttribute('class') ?? '';
    expect(cls).not.toMatch(/\brotate-\d+/);
  });

  it('flip="none" (default) does NOT add a scale class', () => {
    const { container } = render(<Icon as={MailGlyph} />);
    const cls = (container.querySelector('svg') as SVGElement).getAttribute('class') ?? '';
    expect(cls).not.toMatch(/scale-(x|y)/);
  });
});