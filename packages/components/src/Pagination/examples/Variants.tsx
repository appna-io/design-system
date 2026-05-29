import { Pagination } from 'apx-ds';
import type { PaginationVariant } from 'apx-ds';

const VARIANTS: PaginationVariant[] = ['ghost', 'outline', 'soft', 'solid'];

export default function Variants() {
  return (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {variant}
          </span>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            variant={variant}
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </div>
      ))}
    </div>
  );
}
