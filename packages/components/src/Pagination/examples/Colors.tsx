import { Pagination } from '@apx-ui/ds';
import type { PaginationColor } from '@apx-ui/ds';

const COLORS: PaginationColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="flex flex-col gap-4">
      {COLORS.map((color) => (
        <div key={color} className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {color}
          </span>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            color={color}
            variant="soft"
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </div>
      ))}
    </div>
  );
}
