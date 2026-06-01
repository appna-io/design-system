import { Div, Pagination, Typography } from '@apx-ui/ds';
import type { PaginationShape } from '@apx-ui/ds';

const SHAPES: PaginationShape[] = ['square', 'rounded', 'pill'];

export default function Shapes() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {SHAPES.map((shape) => (
        <Div key={shape} display="flex" flexDirection="column" gap="1">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            {shape}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}