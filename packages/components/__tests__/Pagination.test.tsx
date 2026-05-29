import { DirectionProvider } from '@apx-ui/engine';
import { fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '../src/Pagination';
import type { PaginationProps } from '../src/Pagination';
import { renderWithTheme as render } from './utils';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function renderRtl(ui: Parameters<typeof render>[0]) {
  return render(<DirectionProvider dir="rtl">{ui}</DirectionProvider>);
}

function getPageButton(pageLabel: number) {
  const nav = screen.getByRole('navigation');
  return within(nav).getByRole('button', { name: new RegExp(`^Page ${pageLabel}(,|$)`) });
}

/* -------------------------------------------------------------------------- */
/*  Rendering — root / aria                                                    */
/* -------------------------------------------------------------------------- */

describe('Pagination — root + aria', () => {
  it('renders a <nav> with the default "Pagination" aria-label', () => {
    render(<Pagination totalCount={100} pageSize={10} pageIndex={0} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('respects an explicit aria-label', () => {
    render(
      <Pagination
        totalCount={100}
        pageSize={10}
        pageIndex={0}
        aria-label="Results pagination"
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Results pagination' })).toBeInTheDocument();
  });

  it('reflects mode + layout + variant + color in data-attrs (for theming)', () => {
    render(
      <Pagination
        totalCount={100}
        pageSize={10}
        pageIndex={0}
        layout="pages-only"
        variant="solid"
        color="danger"
        size="lg"
        shape="pill"
      />,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('data-pagination', '');
    expect(nav).toHaveAttribute('data-mode', 'page');
    expect(nav).toHaveAttribute('data-layout', 'pages-only');
    expect(nav).toHaveAttribute('data-variant', 'solid');
    expect(nav).toHaveAttribute('data-color', 'danger');
    expect(nav).toHaveAttribute('data-size', 'lg');
    expect(nav).toHaveAttribute('data-shape', 'pill');
  });
});

/* -------------------------------------------------------------------------- */
/*  Layouts                                                                    */
/* -------------------------------------------------------------------------- */

describe('Pagination — layouts', () => {
  it('full: renders first / prev / page list / next / last + range label + size picker', () => {
    render(<Pagination totalCount={120} pageSize={10} pageIndex={3} layout="full" />);
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    expect(screen.getByText('31–40 of 120')).toBeInTheDocument();
    expect(screen.getByLabelText('Rows per page')).toBeInTheDocument();
  });

  it('full: hides the size picker when hidePageSize is true', () => {
    render(<Pagination totalCount={100} pageSize={10} pageIndex={0} hidePageSize />);
    expect(screen.queryByLabelText('Rows per page')).toBeNull();
  });

  it('full: hides First / Last buttons when showFirstLast is false', () => {
    render(<Pagination totalCount={100} pageSize={10} pageIndex={0} showFirstLast={false} />);
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('full: hides the range label when showRangeLabel is false', () => {
    render(<Pagination totalCount={100} pageSize={10} pageIndex={0} showRangeLabel={false} />);
    expect(screen.queryByText('1–10 of 100')).toBeNull();
  });

  it('compact: renders only prev / next + "Page X of Y" status', () => {
    render(
      <Pagination totalCount={120} pageSize={10} pageIndex={3} layout="compact" />,
    );
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByText('Page 4 of 12')).toBeInTheDocument();

    // No first/last/range/size in compact
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    expect(screen.queryByText(/31–40 of 120/)).toBeNull();
    expect(screen.queryByLabelText('Rows per page')).toBeNull();
  });

  it('pages-only: renders just the page-number list', () => {
    render(
      <Pagination totalCount={50} pageSize={10} pageIndex={0} layout="pages-only" />,
    );
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Previous page')).toBeNull();
    expect(screen.queryByLabelText('Next page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    expect(screen.queryByText(/of 50/)).toBeNull();
    expect(screen.queryByLabelText('Rows per page')).toBeNull();

    // 5 page buttons for 50/10
    expect(screen.getByRole('button', { name: /^Page 1,/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Page 5$/ })).toBeInTheDocument();
  });

  it('simple: renders only prev / next', () => {
    render(<Pagination totalCount={100} pageSize={10} pageIndex={0} layout="simple" />);
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    expect(screen.queryByText(/of 100/)).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  Interactions                                                               */
/* -------------------------------------------------------------------------- */

describe('Pagination — interactions (uncontrolled)', () => {
  it('clicking a page button fires onChange and moves the current page', () => {
    const onChange = vi.fn();
    render(
      <Pagination totalCount={100} defaultPageSize={10} onChange={onChange} layout="full" />,
    );

    fireEvent.click(getPageButton(3));
    expect(onChange).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 10 });

    // Current marker moved to page 3 (aria-current=page on the new button).
    const updated = getPageButton(3);
    expect(updated).toHaveAttribute('aria-current', 'page');
  });

  it('first / prev / next / last buttons emit the right pageIndex', () => {
    const onChange = vi.fn();
    render(
      <Pagination
        totalCount={100}
        defaultPageSize={10}
        defaultPageIndex={5}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 4, pageSize: 10 });

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 5, pageSize: 10 });

    fireEvent.click(screen.getByLabelText('First page'));
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 10 });

    fireEvent.click(screen.getByLabelText('Last page'));
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 9, pageSize: 10 });
  });

  it('disables first/prev at page 0 and last/next at the last page', () => {
    const { rerender } = render(<Pagination totalCount={30} pageSize={10} pageIndex={0} />);
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Last page')).not.toBeDisabled();

    rerender(<Pagination totalCount={30} pageSize={10} pageIndex={2} />);
    expect(screen.getByLabelText('First page')).not.toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Last page')).toBeDisabled();
  });
});

describe('Pagination — interactions (controlled)', () => {
  function Controlled(props: { initialPage?: number }) {
    const [page, setPage] = useState(props.initialPage ?? 0);
    return (
      <Pagination
        totalCount={50}
        pageSize={10}
        pageIndex={page}
        onChange={({ pageIndex }) => setPage(pageIndex)}
      />
    );
  }

  it('a controlled wrapper threads pageIndex through onChange', () => {
    render(<Controlled />);
    fireEvent.click(getPageButton(3));
    const updated = getPageButton(3);
    expect(updated).toHaveAttribute('aria-current', 'page');
  });
});

/* -------------------------------------------------------------------------- */
/*  Cursor mode                                                                */
/* -------------------------------------------------------------------------- */

describe('Pagination — cursor mode', () => {
  it('renders only prev / next, hides first/last/range/size/page-list', () => {
    render(
      <Pagination
        mode="cursor"
        hasPreviousPage={true}
        hasNextPage={true}
        onPrevious={() => {}}
        onNext={() => {}}
      />,
    );

    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    expect(screen.queryByLabelText('Rows per page')).toBeNull();
    // No numbered page buttons in cursor mode.
    expect(screen.queryByRole('button', { name: /^Page 1/ })).toBeNull();
  });

  it('prev / next fire the consumer callbacks', () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <Pagination
        mode="cursor"
        hasPreviousPage={true}
        hasNextPage={true}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );
    fireEvent.click(screen.getByLabelText('Previous page'));
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('disables prev / next via hasPreviousPage / hasNextPage', () => {
    render(
      <Pagination mode="cursor" hasPreviousPage={false} hasNextPage={false} />,
    );
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });
});

/* -------------------------------------------------------------------------- */
/*  Page-number window + ARIA wiring                                           */
/* -------------------------------------------------------------------------- */

describe('Pagination — page list', () => {
  it('marks the current page with aria-current="page"', () => {
    render(<Pagination totalCount={50} pageSize={10} pageIndex={2} layout="pages-only" />);
    const current = screen.getByRole('button', { name: /^Page 3, current page/ });
    expect(current).toHaveAttribute('aria-current', 'page');

    const other = screen.getByRole('button', { name: /^Page 1$/ });
    expect(other).not.toHaveAttribute('aria-current');
  });

  it('renders an ellipsis aria-hidden for hidden page ranges', () => {
    render(
      <Pagination totalCount={100} pageSize={10} pageIndex={4} layout="pages-only" />,
    );
    const nav = screen.getByRole('navigation');
    // 1, ..., 4, 5, 6, ..., 10 — two ellipsis spans.
    const ellipses = nav.querySelectorAll('[data-pagination-ellipsis]');
    expect(ellipses.length).toBeGreaterThanOrEqual(2);
    ellipses.forEach((e) => expect(e.getAttribute('aria-hidden')).toBe('true'));
  });

  it('honors siblingCount + boundaryCount overrides', () => {
    render(
      <Pagination
        totalCount={100}
        pageSize={10}
        pageIndex={4}
        siblingCount={2}
        boundaryCount={1}
        layout="pages-only"
      />,
    );
    // [1, ..., 3, 4, 5, 6, 7, ..., 10] — page 7 should be present (it isn't with siblingCount=1).
    expect(screen.getByRole('button', { name: /^Page 7$/ })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Page-size picker (Select integration)                                      */
/* -------------------------------------------------------------------------- */

describe('Pagination — page-size picker', () => {
  it('emits onChange with the new pageSize and resets pageIndex to 0', () => {
    const onChange = vi.fn();
    render(
      <Pagination
        totalCount={200}
        defaultPageSize={10}
        defaultPageIndex={5}
        pageSizeOptions={[10, 25, 50]}
        onChange={onChange}
      />,
    );

    // Open the Select trigger by label, then pick "25". userEvent isn't strictly
    // needed for this — the Select supports keyboard + fireEvent.click.
    const trigger = screen.getByLabelText('Rows per page');
    fireEvent.click(trigger);
    const option = screen.getByRole('option', { name: '25' });
    fireEvent.click(option);

    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 25 });
  });
});

/* -------------------------------------------------------------------------- */
/*  i18n + RTL                                                                 */
/* -------------------------------------------------------------------------- */

describe('Pagination — i18n', () => {
  it('partial `translations` prop overrides matching keys, falls through for the rest', () => {
    render(
      <Pagination
        totalCount={100}
        pageSize={10}
        pageIndex={0}
        translations={{
          paginationLabel: 'Browse pages',
          paginationNextPage: 'Forward',
          paginationOfTotal: (s, e, t) => `[${s}/${e}/${t}]`,
        }}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Browse pages' })).toBeInTheDocument();
    expect(screen.getByLabelText('Forward')).toBeInTheDocument();
    expect(screen.getByText('[1/10/100]')).toBeInTheDocument();
    // Non-overridden key keeps the English default.
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
  });
});

describe('Pagination — RTL', () => {
  it('sets data-dir="rtl" when nested under <DirectionProvider dir="rtl">', () => {
    renderRtl(<Pagination totalCount={100} pageSize={10} pageIndex={0} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-dir', 'rtl');
  });

  it('keeps logical Previous / Next labels in RTL (button labels do not flip)', () => {
    // Only the chevron icons flip; ARIA labels stay logical so SR users get a
    // direction-agnostic instruction.
    renderRtl(<Pagination totalCount={100} pageSize={10} pageIndex={0} />);
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Edge cases                                                                 */
/* -------------------------------------------------------------------------- */

describe('Pagination — edge cases', () => {
  it('handles totalCount=0: range "0–0 of 0", everything disabled', () => {
    render(<Pagination totalCount={0} pageSize={10} pageIndex={0} />);
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Last page')).toBeDisabled();
  });

  it('handles totalCount smaller than pageSize: single page, no ellipsis', () => {
    render(<Pagination totalCount={3} pageSize={10} pageIndex={0} layout="pages-only" />);
    expect(screen.getByRole('button', { name: /^Page 1, current page/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Page 2/ })).toBeNull();
  });

  it('accepts ResponsiveValue for size and resolves to the base scalar', () => {
    render(
      <Pagination
        totalCount={100}
        pageSize={10}
        pageIndex={0}
        size={{ base: 'lg', md: 'md' } as PaginationProps['size']}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'lg');
  });
});
