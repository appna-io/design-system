/**
 * Drawer — logical `side` under RTL.
 *
 * Validates that:
 *   1. `start` / `end` resolve to the correct physical edge in each direction, observed through
 *      `data-side` (the attribute every downstream concern — recipe class, slide motion — is
 *      derived from, so asserting it covers all three).
 *   2. Physical sides are inert to direction: a `side="right"` drawer stays on the right in RTL,
 *      which is the escape hatch consumers reach for when they mean a fixed edge.
 *   3. A responsive `side` object resolves per breakpoint, so `{ base: 'bottom', md: 'end' }`
 *      keeps its vertical base and only flips the logical entry.
 *   4. The recipe still gets the physical value — the logical grammar must not leak into the
 *      `side` × `size` compound matrix.
 *
 * JSDOM has no layout engine, so we assert the resolved edge and the recipe token rather than
 * pixel offsets — the same approach `DataGrid.rtl.test.tsx` takes for pinned columns.
 */

import { DirectionProvider } from '@apx-ui/engine';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { Drawer } from '../src/Drawer';
import { resolveDrawerSide, resolveResponsiveDrawerSide } from '../src/Drawer/Drawer.side';
import type { DrawerContentProps } from '../src/Drawer';
import { renderWithTheme as render } from './utils';

function queryDialog(): HTMLElement | null {
  return screen.queryByRole('dialog');
}

type SideProps = Omit<DrawerContentProps, 'children'>;

function drawerIn(dir: 'ltr' | 'rtl', contentProps: SideProps): ReactElement {
  return (
    <DirectionProvider dir={dir}>
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content {...contentProps}>
          <Drawer.Body>content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </DirectionProvider>
  );
}

/** Render, open, and hand back the dialog node. */
async function openDrawer(
  dir: 'ltr' | 'rtl',
  contentProps: SideProps,
): Promise<{ dialog: HTMLElement; unmount: () => void }> {
  const user = userEvent.setup();
  const { unmount } = render(drawerIn(dir, contentProps));
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await waitFor(() => expect(queryDialog()).toBeInTheDocument());
  return { dialog: queryDialog()!, unmount };
}

describe('Drawer — logical side resolution', () => {
  const cases: Array<{ dir: 'ltr' | 'rtl'; side: 'start' | 'end'; expected: string }> = [
    { dir: 'ltr', side: 'start', expected: 'left' },
    { dir: 'ltr', side: 'end', expected: 'right' },
    { dir: 'rtl', side: 'start', expected: 'right' },
    { dir: 'rtl', side: 'end', expected: 'left' },
  ];

  for (const { dir, side, expected } of cases) {
    it(`resolves side="${side}" to "${expected}" in ${dir}`, async () => {
      const { dialog, unmount } = await openDrawer(dir, { side });
      expect(dialog).toHaveAttribute('data-side', expected);
      unmount();
    });
  }

  it('leaves physical sides untouched in RTL', async () => {
    for (const side of ['left', 'right', 'top', 'bottom'] as const) {
      const { dialog, unmount } = await openDrawer('rtl', { side });
      expect(dialog).toHaveAttribute('data-side', side);
      unmount();
    }
  });

  it('passes the resolved physical side to the recipe, not the logical one', async () => {
    // `end` in RTL is the left edge — a horizontal side, so the width axis (`max-w-*`) must win.
    // If the logical value leaked through, no compound row would match and the class would carry
    // neither axis.
    const { dialog, unmount } = await openDrawer('rtl', { side: 'end', size: 'lg' });
    expect(dialog.className).toMatch(/max-w-md/);
    expect(dialog.className).not.toMatch(/max-h-/);
    unmount();
  });
});

describe('resolveDrawerSide', () => {
  it('maps the logical pair against direction and passes physical values through', () => {
    expect(resolveDrawerSide('start', 'ltr')).toBe('left');
    expect(resolveDrawerSide('end', 'ltr')).toBe('right');
    expect(resolveDrawerSide('start', 'rtl')).toBe('right');
    expect(resolveDrawerSide('end', 'rtl')).toBe('left');

    for (const side of ['left', 'right', 'top', 'bottom'] as const) {
      expect(resolveDrawerSide(side, 'ltr')).toBe(side);
      expect(resolveDrawerSide(side, 'rtl')).toBe(side);
    }
  });
});

describe('resolveResponsiveDrawerSide', () => {
  it('resolves each breakpoint entry and keeps the object shape', () => {
    expect(resolveResponsiveDrawerSide({ base: 'bottom', md: 'end' }, 'rtl')).toEqual({
      base: 'bottom',
      md: 'left',
    });
    expect(resolveResponsiveDrawerSide({ base: 'start', lg: 'end' }, 'ltr')).toEqual({
      base: 'left',
      lg: 'right',
    });
  });

  it('passes a primitive through as a primitive', () => {
    expect(resolveResponsiveDrawerSide('end', 'rtl')).toBe('left');
    expect(resolveResponsiveDrawerSide('top', 'rtl')).toBe('top');
  });

  it('leaves undefined alone so the recipe default still applies', () => {
    expect(resolveResponsiveDrawerSide(undefined, 'rtl')).toBeUndefined();
  });
});
