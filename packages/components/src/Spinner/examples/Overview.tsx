import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Spinner size="sm" />
        <Typography variant="caption" color="fg.muted" align="center">
          Small
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Spinner size="md" color="primary" />
        <Typography variant="caption" color="fg.muted" align="center">
          Primary
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Spinner variant="dots" color="success" />
        <Typography variant="caption" color="fg.muted" align="center">
          Dots
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Spinner variant="pulse" color="info" size="lg" />
        <Typography variant="caption" color="fg.muted" align="center">
          Pulse
        </Typography>
      </Div>
    </Div>
  );
}