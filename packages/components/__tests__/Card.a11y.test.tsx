import { __resetWarnCache } from '@apx-ui/engine';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Card } from '../src/Card';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS = ['outline', 'solid', 'elevated', 'ghost'] as const;
const COLORS = ['primary', 'success', 'warning', 'danger', 'neutral'] as const;

describe('Card — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(
      <Card>
        <Card.Header title="Hello" subtitle="World" />
        <Card.Body>Body content goes here.</Card.Body>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the clickable + selected + hoverable combination', async () => {
    const { container } = render(
      <Card clickable hoverable selected color="primary" onClick={() => {}}>
        <Card.Header title="Tile" />
        <Card.Body>Single-click target.</Card.Body>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across the variant × color matrix', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <li key={`${variant}-${color}`}>
              <Card variant={variant} color={color} hoverable selected>
                <Card.Header title={`${variant} ${color}`} />
                <Card.Body>Matrix cell content.</Card.Body>
              </Card>
            </li>
          )),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core when wrapped in <a> via asChild', async () => {
    const { container } = render(
      <Card asChild hoverable color="primary">
        <a href="/x">
          <Card.Header title="Link card" />
          <Card.Body>Whole-card link.</Card.Body>
        </a>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the orientation=horizontal + media layout', async () => {
    const { container } = render(
      <Card orientation="horizontal">
        <Card.Media
          src="https://example.com/cover.png"
          alt="Cover art for the card"
          aspectRatio="16/9"
        />
        <div>
          <Card.Header title="With media" subtitle="Side layout" />
          <Card.Body>Body content beside the media tile.</Card.Body>
          <Card.Footer>Footer row</Card.Footer>
        </div>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core when the Card is disabled', async () => {
    const { container } = render(
      <Card clickable disabled onClick={() => {}}>
        <Card.Header title="Disabled" />
        <Card.Body>Inert content.</Card.Body>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Card.Media — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when src is set but alt is missing', () => {
    render(
      <Card>
        <Card.Media src="https://example.com/x.png" />
      </Card>,
    );
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/alt/i);
  });

  it('does NOT warn when src is set and alt is an empty string (decorative imagery)', () => {
    render(
      <Card>
        <Card.Media src="https://example.com/x.png" alt="" />
      </Card>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when src is omitted (children-only mode)', () => {
    render(
      <Card>
        <Card.Media>
          <div>placeholder</div>
        </Card.Media>
      </Card>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
