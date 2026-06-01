import { Div, Spinner, Typography } from '@apx-ui/ds';

const COLORS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const;

export default function Colors() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="6">
      {COLORS.map((color) => (
        <Div key={color} display="flex" flexDirection="column" alignItems="center" gap="1.5">
          <Spinner color={color} size="lg" />
          <Typography variant="caption" color="fg.muted">
            {color}
          </Typography>
        </Div>
      ))}
    </Div>
  );
}