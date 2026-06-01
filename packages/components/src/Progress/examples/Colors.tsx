import { CircularProgress, Div, Progress, Typography, type ProgressColor } from '@apx-ui/ds';

const COLORS: readonly ProgressColor[] = [
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
    <Div display="flex" flexDirection="column" gap="6" className="w-full max-w-md">
      <Div display="flex" flexDirection="column" gap="3">
        <Typography
          as="span"
          variant="caption"
          weight="medium"
          color="fg.muted"
          className="uppercase tracking-wide"
        >
          Linear
        </Typography>
        {COLORS.map((color) => (
          <Div key={color} display="flex" alignItems="center" gap="3">
            <Typography as="span" variant="caption" color="fg.muted" className="w-20">
              {color}
            </Typography>
            <Progress
              variant="soft"
              color={color}
              value={62}
              className="flex-1"
              aria-label={`${color} progress`}
            />
          </Div>
        ))}
      </Div>
      <Div display="flex" flexDirection="column" gap="3">
        <Typography
          as="span"
          variant="caption"
          weight="medium"
          color="fg.muted"
          className="uppercase tracking-wide"
        >
          Circular
        </Typography>
        <Div display="flex" alignItems="center" className="flex-wrap gap-4">
          {COLORS.map((color) => (
            <CircularProgress
              key={color}
              color={color}
              value={62}
              showLabel
              aria-label={`${color} circular progress`}
            />
          ))}
        </Div>
      </Div>
    </Div>
  );
}