import { useState } from 'react';
import { Pagination } from 'apx-ds';

export default function PageSize() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-muted">
        The page-size picker is a real <code>{`<Select>`}</code> from the DS.
        Changing the size resets to page 1 — the same convention DataGrid uses.
      </p>
      <Pagination
        totalCount={325}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onChange={(next) => {
          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />
    </div>
  );
}
