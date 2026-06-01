import { Div, Pagination, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="4">
      {COLORS.map((color) => (
        <Div key={color} display="flex" flexDirection="column" gap="1">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            {color}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}