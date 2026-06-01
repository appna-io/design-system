import { Div, Rating, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Rating defaultValue={4} ariaLabel="Rate this product" />
        <Typography variant="caption" color="fg.muted" align="center">
          Interactive
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Div display="flex" alignItems="center" gap="2">
          <Rating value={4.2} readOnly precision="exact" size="sm" ariaLabel="Average rating" />
          <Typography variant="bodySmall" color="fg.muted">
            4.2 (185 reviews)
          </Typography>
        </Div>
        <Typography variant="caption" color="fg.muted" align="center">
          Read-only average
        </Typography>
      </Div>
    </Div>
  );
}