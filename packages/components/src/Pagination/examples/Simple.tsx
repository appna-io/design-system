import { useState } from 'react';
import { Pagination } from 'apx-ds';

export default function Simple() {
  const [pageIndex, setPageIndex] = useState(2);
  return (
    <Pagination
      layout="simple"
      totalCount={100}
      pageSize={10}
      pageIndex={pageIndex}
      onChange={(next) => setPageIndex(next.pageIndex)}
    />
  );
}
