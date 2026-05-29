import { Pagination } from 'apx-ds';
import type { PaginationShape } from 'apx-ds';

const SHAPES: PaginationShape[] = ['square', 'rounded', 'pill'];

export default function Shapes() {
  return (
    <div className="flex flex-col gap-4">
      {SHAPES.map((shape) => (
        <div key={shape} className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {shape}
          </span>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            shape={shape}
            variant="outline"
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </div>
      ))}
    </div>
  );
}
