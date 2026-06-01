import { Div, Pagination, Typography } from '@apx-ui/ds';
import type { PaginationVariant } from '@apx-ui/ds';

const VARIANTS: PaginationVariant[] = ['ghost', 'outline', 'soft', 'solid'];

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="1">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            {variant}
          </Typography>
          <Pagination
            totalCount={100}
            pageSize={10}
            pageIndex={3}
            variant={variant}
            hidePageSize
            showRangeLabel={false}
            responsive={false}
          />
        </Div>
      ))}
    </Div>
  );
}