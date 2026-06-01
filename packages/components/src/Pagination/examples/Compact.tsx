import { useState } from 'react';
import { Pagination } from '@apx-ui/ds';

export default function Compact() {
  const [pageIndex, setPageIndex] = useState(2);
  return (
    <Pagination
      layout="compact"
      totalCount={500}
      pageSize={25}
      pageIndex={pageIndex}
      onChange={(next) => setPageIndex(next.pageIndex)}
    />
  );
}