import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { AppShell } from '../src/AppShell';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('AppShell — a11y', () => {
  it('has no violations for a minimal shell', async () => {
    const { container } = render(
      <AppShell>
        <h1>Page</h1>
      </AppShell>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations with header + sidebar + footer', async () => {
    const { container } = render(
      <AppShell
        header={<div role="navigation" aria-label="Top">top</div>}
        sidebar={<nav aria-label="Side">side</nav>}
        footer={<div>© 2026</div>}
      >
        <h1>Page</h1>
      </AppShell>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations in inset layout', async () => {
    const { container } = render(
      <AppShell
        layout="inset"
        header={<div>top</div>}
        sidebar={<nav aria-label="Side">side</nav>}
        aside={<div>aside</div>}
      >
        <h1>Page</h1>
      </AppShell>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when sidebar is collapsed', async () => {
    const { container } = render(
      <AppShell
        header={<div>top</div>}
        sidebar={<nav aria-label="Side">side</nav>}
        defaultSidebarCollapsed
      >
        <h1>Page</h1>
      </AppShell>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});