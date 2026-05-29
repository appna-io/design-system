import { useMemo, useState } from 'react';
import { Pagination } from 'apx-ds';

/**
 * The realistic shape: a card list paired with `<Pagination>` underneath.
 * The list itself can be any list — `<ul>`, a CSS grid, virtualized scroller
 * — Pagination only cares about `totalCount` + `pageIndex` + `pageSize`.
 */
const ALL_ITEMS = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  title: `Article #${i + 1}`,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
}));

export default function WithListAbove() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const visible = useMemo(
    () => ALL_ITEMS.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [pageIndex, pageSize],
  );

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border bg-bg-paper p-3"
          >
            <h3 className="text-sm font-semibold text-fg-default">{item.title}</h3>
            <p className="mt-1 text-xs text-fg-muted">{item.description}</p>
          </li>
        ))}
      </ul>
      <Pagination
        totalCount={ALL_ITEMS.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onChange={(next) => {
          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
        pageSizeOptions={[6, 12, 24]}
        variant="ghost"
        color="primary"
      />
    </div>
  );
}
