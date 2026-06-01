import { useMemo, useState } from 'react';
import { Div, Pagination, Typography } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="4">
      <Div as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <Div
            as="li"
            key={item.id}
            className="rounded-lg border border-border bg-bg-paper p-3"
          >
            <Typography as="h3" variant="bodySmall" weight="semibold" color="fg.default">
              {item.title}
            </Typography>
            <Typography variant="caption" color="fg.muted" className="mt-1">
              {item.description}
            </Typography>
          </Div>
        ))}
      </Div>
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
    </Div>
  );
}