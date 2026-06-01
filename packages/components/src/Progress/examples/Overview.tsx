import { Div, Progress, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo: indeterminate, 35%, and 80% progress bars with labels on the determinate ones.
 */
export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-sm">
      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography variant="caption" color="fg.muted">
          Uploading files…
        </Typography>
        <Progress indeterminate aria-label="Uploading files" />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography variant="caption" color="fg.muted">
          Profile setup
        </Typography>
        <Progress value={35} showLabel aria-label="Profile setup" />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5">
        <Typography variant="caption" color="fg.muted">
          Storage used
        </Typography>
        <Progress value={80} showLabel color="success" aria-label="Storage used" />
      </Div>
    </Div>
  );
}