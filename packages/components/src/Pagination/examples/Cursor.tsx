import { useState } from 'react';
import { Div, Pagination, Typography } from '@apx-ui/ds';

/**
 * Simulates a server that only exposes prev / next cursors and never reports
 * a total count. Pagination renders in `cursor` mode: page-list, range
 * label, first / last buttons all hidden; prev / next disable via the
 * supplied `hasPreviousPage` / `hasNextPage` flags.
 */
export default function Cursor() {
  const [cursor, setCursor] = useState<{ prev: string | null; next: string | null }>({
    prev: null,
    next: 'cursor:page-2',
  });
  const [pageLabel, setPageLabel] = useState(1);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Currently on cursor-driven page <strong>{pageLabel}</strong>. The
        server returns the next / previous cursor with each response.
      </Typography>
      <Pagination
        mode="cursor"
        hasPreviousPage={cursor.prev !== null}
        hasNextPage={cursor.next !== null}
        onPrevious={() => {
          setPageLabel((p) => Math.max(1, p - 1));
          setCursor(() => ({
            prev: pageLabel - 1 > 1 ? `cursor:page-${pageLabel - 2}` : null,
            next: `cursor:page-${pageLabel}`,
          }));
        }}
        onNext={() => {
          setPageLabel((p) => p + 1);
          setCursor(() => ({
            prev: `cursor:page-${pageLabel - 1}`,
            next: pageLabel < 5 ? `cursor:page-${pageLabel + 1}` : null,
          }));
        }}
      />
    </Div>
  );
}