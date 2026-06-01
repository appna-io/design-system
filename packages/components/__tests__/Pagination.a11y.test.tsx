import { DirectionProvider } from '@apx-ui/engine';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Pagination } from '../src/Pagination';
import type {
  PaginationColor,
  PaginationLayout,
  PaginationShape,
  PaginationSize,
  PaginationVariant,
} from '../src/Pagination';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

/* -------------------------------------------------------------------------- */
/*  Smoke tests across the layouts + cursor mode + RTL                         */
/* -------------------------------------------------------------------------- */

describe('Pagination — a11y (smoke)', () => {
  it('default `full` layout in LTR has no violations', async () => {
    const { container } = render(
      <Pagination totalCount={100} pageSize={10} pageIndex={3} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('`compact` layout has no violations', async () => {
    const { container } = render(
      <Pagination totalCount={100} pageSize={10} pageIndex={3} layout="compact" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('`pages-only` layout has no violations', async () => {
    const { container } = render(
      <Pagination totalCount={100} pageSize={10} pageIndex={3} layout="pages-only" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('`simple` layout has no violations', async () => {
    const { container } = render(
      <Pagination totalCount={100} pageSize={10} pageIndex={3} layout="simple" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('cursor mode has no violations', async () => {
    const { container } = render(
      <Pagination
        mode="cursor"
        hasPreviousPage={true}
        hasNextPage={true}
        onPrevious={() => {}}
        onNext={() => {}}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled boundaries (page 0 / last page) have no violations', async () => {
    const { container: first } = render(
      <Pagination totalCount={30} pageSize={10} pageIndex={0} />,
    );
    expect(await axe(first)).toHaveNoViolations();

    const { container: last } = render(
      <Pagination totalCount={30} pageSize={10} pageIndex={2} />,
    );
    expect(await axe(last)).toHaveNoViolations();
  });

  it('RTL `full` layout has no violations', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Pagination totalCount={100} pageSize={10} pageIndex={3} />
      </DirectionProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('RTL `compact` layout has no violations', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Pagination totalCount={100} pageSize={10} pageIndex={3} layout="compact" />
      </DirectionProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* -------------------------------------------------------------------------- */
/*  Full visual matrix — 4 × 7 × 3 × 3 = 252 cells                             */
/* -------------------------------------------------------------------------- */

const VARIANTS: PaginationVariant[] = ['ghost', 'outline', 'soft', 'solid'];
const COLORS: PaginationColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];
const SIZES: PaginationSize[] = ['sm', 'md', 'lg'];
const SHAPES: PaginationShape[] = ['square', 'rounded', 'pill'];

/**
 * The plan's acceptance criterion calls for a full 4 × 7 × 3 × 3 = 252 axe
 * matrix. Each cell renders Pagination at page 3 of 10 (so a current marker,
 * surrounding pages, and at least one ellipsis are all in the tree) with the
 * size picker hidden (the Select's portal would add un-rendered ARIA tree
 * structure unrelated to the cell under test).
 *
 * One `it` per cell so a single failing combination shows up by name in the
 * test report (e.g. `outline/danger/sm/pill axe-clean`).
 */
describe('Pagination — a11y matrix (variant × color × size × shape, 252 cells)', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      for (const size of SIZES) {
        for (const shape of SHAPES) {
          it(`${variant}/${color}/${size}/${shape} axe-clean`, async () => {
            const { container } = render(
              <Pagination
                totalCount={100}
                pageSize={10}
                pageIndex={3}
                variant={variant}
                color={color}
                size={size}
                shape={shape}
                hidePageSize
              />,
            );
            const results = await axe(container);
            expect(results).toHaveNoViolations();
          });
        }
      }
    }
  }
});

/* -------------------------------------------------------------------------- */
/*  Layout × direction sweep — 4 layouts × {ltr, rtl} = 8 cells                */
/* -------------------------------------------------------------------------- */

const LAYOUTS: PaginationLayout[] = ['full', 'compact', 'pages-only', 'simple'];

describe('Pagination — a11y layout × direction', () => {
  for (const layout of LAYOUTS) {
    for (const dir of ['ltr', 'rtl'] as const) {
      it(`${layout}/${dir} axe-clean`, async () => {
        const { container } = render(
          <DirectionProvider dir={dir}>
            <Pagination
              totalCount={100}
              pageSize={10}
              pageIndex={3}
              layout={layout}
              hidePageSize
            />
          </DirectionProvider>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    }
  }
});