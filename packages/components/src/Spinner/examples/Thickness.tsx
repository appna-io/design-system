import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function Thickness() {
  return (
    <Div display="flex" alignItems="center" gap="8">
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner thickness={1} size="xl" />
        <Typography variant="caption" color="fg.muted">
          thickness=1
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner thickness={2} size="xl" />
        <Typography variant="caption" color="fg.muted">
          thickness=2 (default)
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner thickness={3} size="xl" />
        <Typography variant="caption" color="fg.muted">
          thickness=3
        </Typography>
      </Div>
    </Div>
  );
}