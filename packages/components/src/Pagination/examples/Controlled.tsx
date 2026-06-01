import { useState } from 'react';
import { Div, Pagination, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const totalCount = 247;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(totalCount, (pageIndex + 1) * pageSize);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Showing rows <strong>{from}</strong>–<strong>{to}</strong> of{' '}
        <strong>{totalCount}</strong>. Current page index is{' '}
        <code>{pageIndex}</code>; page size is <code>{pageSize}</code>.
      </Typography>
      <Pagination
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onChange={(next) => {
          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Div>
  );
}