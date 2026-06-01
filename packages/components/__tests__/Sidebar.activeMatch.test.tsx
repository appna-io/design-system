import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sidebar } from '../src/Sidebar';
import { renderWithTheme as render } from './utils';

describe('Sidebar — active-href matching', () => {
  it('marks the matching item with aria-current="page" (exact strategy, default)', () => {
    render(
      <Sidebar activeHref="/inbox">
        <Sidebar.Item href="/">Home</Sidebar.Item>
        <Sidebar.Item href="/inbox">Inbox</Sidebar.Item>
        <Sidebar.Item href="/settings">Settings</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBeNull();
  });

  it('exact strategy: trailing slashes are normalized', () => {
    render(
      <Sidebar activeHref="/inbox/" activeMatchStrategy="exact">
        <Sidebar.Item href="/inbox">Inbox</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page');
  });

  it('exact strategy: child route does NOT match the parent item', () => {
    render(
      <Sidebar activeHref="/inbox/42" activeMatchStrategy="exact">
        <Sidebar.Item href="/inbox">Inbox</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Inbox' }).getAttribute('aria-current')).toBeNull();
  });

  it('prefix strategy: child route DOES match the parent item', () => {
    render(
      <Sidebar activeHref="/inbox/42" activeMatchStrategy="prefix">
        <Sidebar.Item href="/inbox">Inbox</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page');
  });

  it('prefix strategy: boundary check prevents partial-word matches', () => {
    // `/p` must NOT match `/photos` — boundary check ensures this.
    render(
      <Sidebar activeHref="/photos" activeMatchStrategy="prefix">
        <Sidebar.Item href="/p">P</Sidebar.Item>
        <Sidebar.Item href="/photos">Photos</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'P' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'Photos' }).getAttribute('aria-current')).toBe('page');
  });

  it('explicit `active` prop overrides activeHref matching', () => {
    render(
      <Sidebar activeHref="/">
        <Sidebar.Item href="/" active={false}>
          Home (explicitly off)
        </Sidebar.Item>
        <Sidebar.Item href="/settings" active>
          Settings (explicitly on)
        </Sidebar.Item>
      </Sidebar>,
    );
    expect(
      screen.getByRole('link', { name: /Home/ }).getAttribute('aria-current'),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: /Settings/ }).getAttribute('aria-current'),
    ).toBe('page');
  });

  it('items without href are never active via matching', () => {
    render(
      <Sidebar activeHref="/inbox">
        <Sidebar.Item onClick={() => undefined}>Compose</Sidebar.Item>
      </Sidebar>,
    );
    expect(
      screen.getByRole('button', { name: 'Compose' }).getAttribute('aria-current'),
    ).toBeNull();
  });
});