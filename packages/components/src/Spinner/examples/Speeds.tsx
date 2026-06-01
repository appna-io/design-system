import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function Speeds() {
  return (
    <Div display="flex" alignItems="center" gap="8">
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner speed="slow" size="lg" />
        <Typography variant="caption" color="fg.muted">
          slow (1200ms)
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner speed="normal" size="lg" />
        <Typography variant="caption" color="fg.muted">
          normal (800ms)
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="1.5">
        <Spinner speed="fast" size="lg" />
        <Typography variant="caption" color="fg.muted">
          fast (500ms)
        </Typography>
      </Div>
    </Div>
  );
}