import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Sidebar } from '../src/Sidebar';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Sidebar — accessibility', () => {
  it('has no axe violations for a flat sidebar', async () => {
    const { container } = render(
      <Sidebar ariaLabel="Main">
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/inbox" badge={3} icon={<span aria-hidden>★</span>}>
          Inbox
        </Sidebar.Item>
      </Sidebar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with sections', async () => {
    const { container } = render(
      <Sidebar ariaLabel="Main">
        <Sidebar.Header>
          <span>Logo</span>
        </Sidebar.Header>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<span aria-hidden>★</span>}>
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Projects" collapsible defaultOpen>
          <Sidebar.Item href="/p/launch" icon={<span aria-hidden>★</span>}>
            Launch
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Spacer />
        <Sidebar.Footer>
          <span>Profile</span>
        </Sidebar.Footer>
      </Sidebar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with expandable items + sub-items', async () => {
    const { container } = render(
      <Sidebar ariaLabel="Main">
        <Sidebar.Item expandable defaultExpanded icon={<span aria-hidden>★</span>}>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
            <Sidebar.Item href="/docs/api">API</Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in rail (collapsed) mode', async () => {
    const { container } = render(
      <Sidebar ariaLabel="Main" collapsed>
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/inbox" badge={3} icon={<span aria-hidden>★</span>}>
          Inbox
        </Sidebar.Item>
      </Sidebar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with active item state', async () => {
    const { container } = render(
      <Sidebar ariaLabel="Main" activeHref="/inbox">
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/inbox" icon={<span aria-hidden>★</span>}>
          Inbox
        </Sidebar.Item>
      </Sidebar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations across every variant × size combination', async () => {
    for (const variant of ['default', 'bordered', 'floating', 'ghost'] as const) {
      for (const size of ['sm', 'md', 'lg'] as const) {
        const { container, unmount } = render(
          <Sidebar ariaLabel={`Test-${variant}-${size}`} variant={variant} size={size}>
            <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
              Home
            </Sidebar.Item>
          </Sidebar>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    }
  });
});
