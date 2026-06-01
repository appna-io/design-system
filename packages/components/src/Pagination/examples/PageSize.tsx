import { useState } from 'react';
import { Div, Pagination, Typography } from '@apx-ui/ds';

export default function PageSize() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        The page-size picker is a real <code>{`<Select>`}</code> from the DS.
        Changing the size resets to page 1 — the same convention DataGrid uses.
      </Typography>
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
    </Div>
  );
}