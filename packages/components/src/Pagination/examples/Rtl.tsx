import { useState } from 'react';
import { DirectionProvider } from '@apx-ui/engine';
import { Pagination, hePaginationTranslations } from 'apx-ds';

/**
 * `<DirectionProvider dir="rtl">` flips the chevron icons + flow direction;
 * `hePaginationTranslations` provides the Hebrew label set. The two are
 * independent — you can use either without the other (e.g. RTL with custom
 * translations, or LTR with the Hebrew bundle on a multilingual switch).
 */
export default function Rtl() {
  const [pageIndex, setPageIndex] = useState(3);
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="flex flex-col gap-3">
        <p className="text-sm text-fg-muted">
          הדפדוף יציג חצים בכיוון הפוך ותווית טווח בעברית.
        </p>
        <Pagination
          totalCount={120}
          pageSize={10}
          pageIndex={pageIndex}
          onChange={(next) => setPageIndex(next.pageIndex)}
          translations={hePaginationTranslations}
          color="primary"
          variant="soft"
        />
      </div>
    </DirectionProvider>
  );
}
