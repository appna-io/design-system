import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Marquee } from '../src/Marquee';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

/**
 * The a11y risk in a marquee is duplicated content: the loop needs a second copy of every item,
 * and a naive implementation announces each logo twice and puts a second, unreachable set of
 * links in the tab order. These assert the clone stays out of both trees.
 */
describe('Marquee — axe-core', () => {
  it('a logo band has no violations', async () => {
    const { container } = render(
      <Marquee as="section" aria-label="Customers" fade>
        <img src="/a.svg" alt="Northwind" />
        <img src="/b.svg" alt="Acme" />
      </Marquee>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('a marquee of links has no violations and exposes each link exactly once', async () => {
    const { container } = render(
      <Marquee pauseOnHover>
        <a href="#one">One</a>
        <a href="#two">Two</a>
      </Marquee>,
    );

    expect(await axe(container)).toHaveNoViolations();
    expect(container.querySelectorAll('a')).toHaveLength(4); // 2 real + 2 inside the inert clone
    expect(container.querySelectorAll('[inert] a')).toHaveLength(2);
  });

  it('the reduced-motion scroll region has no violations', async () => {
    const { container } = render(
      <Marquee reduceMotion as="section" aria-label="Customers">
        <a href="#one">One</a>
        <a href="#two">Two</a>
      </Marquee>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
