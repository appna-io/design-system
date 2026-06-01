import { Div, Pagination, Typography } from '@apx-ui/ds';
import type { PaginationSize } from '@apx-ui/ds';

const SIZES: PaginationSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {SIZES.map((size) => (
        <Div key={size} display="flex" flexDirection="column" gap="1">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            {size}
          </Typography>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            size={size}
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </Div>
      ))}
    </Div>
  );
}