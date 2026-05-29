import { useState } from 'react';
import { Pagination } from '@apx-ui/ds';

/**
 * Stress test for `computePageWindow` — 1,000 pages. The window-aware
 * algorithm keeps the rendered button count constant regardless of the
 * total: first ellipsis last  + a sliding 3-button window around current.
 */
export default function ManyPages() {
  const [pageIndex, setPageIndex] = useState(489);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-muted">
        1,000 pages of 50 rows each (50,000 rows total). The window stays
        compact regardless of where you are; click the ellipsis-adjacent
        pages to jump.
      </p>
      <Pagination
        totalCount={50_000}
        pageIndex={pageIndex}
        pageSize={50}
        onChange={(next) => setPageIndex(next.pageIndex)}
        siblingCount={1}
        boundaryCount={1}
        hidePageSize
      />
    </div>
  );
}
