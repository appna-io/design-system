import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function Inline() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography
        as="p"
        variant="bodySmall"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: '2', margin: 0 }}
      >
        <Spinner size="sm" /> Loading content inline with text…
      </Typography>
      <Typography
        as="p"
        variant="bodySmall"
        className="text-success"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: '2', margin: 0 }}
      >
        <Spinner size="sm" /> Spinner inherits the surrounding text color (currentColor fallback)
      </Typography>
    </Div>
  );
}