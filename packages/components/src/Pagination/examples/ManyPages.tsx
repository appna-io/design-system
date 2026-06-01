import { useState } from 'react';
import { Div, Pagination, Typography } from '@apx-ui/ds';

/**
 * Stress test for `computePageWindow` — 1,000 pages. The window-aware
 * algorithm keeps the rendered button count constant regardless of the
 * total: first ellipsis last  + a sliding 3-button window around current.
 */
export default function ManyPages() {
  const [pageIndex, setPageIndex] = useState(489);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        1,000 pages of 50 rows each (50,000 rows total). The window stays
        compact regardless of where you are; click the ellipsis-adjacent
        pages to jump.
      </Typography>
      <Pagination
        totalCount={50_000}
        pageIndex={pageIndex}
        pageSize={50}
        onChange={(next) => setPageIndex(next.pageIndex)}
        siblingCount={1}
        boundaryCount={1}
        hidePageSize
      />
    </Div>
  );
}