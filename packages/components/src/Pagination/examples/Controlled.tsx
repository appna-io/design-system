import { useState } from 'react';
import { Pagination } from 'apx-ds';

export default function Controlled() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const totalCount = 247;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(totalCount, (pageIndex + 1) * pageSize);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-muted">
        Showing rows <strong>{from}</strong>–<strong>{to}</strong> of{' '}
        <strong>{totalCount}</strong>. Current page index is{' '}
        <code>{pageIndex}</code>; page size is <code>{pageSize}</code>.
      </p>
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
    </div>
  );
}
