import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function TrackOpacity() {
  return (
    <Div display="flex" alignItems="center" gap="8">
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner trackOpacity={0} size="xl" />
        <Typography variant="caption" color="fg.muted">
          trackOpacity=0 (trackless)
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner trackOpacity={0.2} size="xl" />
        <Typography variant="caption" color="fg.muted">
          trackOpacity=0.2 (default)
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner trackOpacity={0.5} size="xl" />
        <Typography variant="caption" color="fg.muted">
          trackOpacity=0.5
        </Typography>
      </Div>
    </Div>
  );
}