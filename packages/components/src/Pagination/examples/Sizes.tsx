import { Pagination } from '@apx-ui/ds';
import type { PaginationSize } from '@apx-ui/ds';

const SIZES: PaginationSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {size}
          </span>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            size={size}
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </div>
      ))}
    </div>
  );
}
