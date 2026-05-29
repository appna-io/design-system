import { useState } from 'react';
import { Pagination } from '@apx-ui/ds';

export default function PagesOnly() {
  const [pageIndex, setPageIndex] = useState(3);
  return (
    <Pagination
      layout="pages-only"
      totalCount={150}
      pageSize={15}
      pageIndex={pageIndex}
      onChange={(next) => setPageIndex(next.pageIndex)}
    />
  );
}
