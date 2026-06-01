import { CircularProgress, Div, Progress, Typography, type ProgressSize } from '@apx-ui/ds';

const SIZES: readonly ProgressSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
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
        {SIZES.map((size) => (
          <Progress key={size} size={size} value={50} aria-label={`Linear ${size}`} />
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
        <Div display="flex" alignItems="center" gap="6">
          {SIZES.map((size) => (
            <CircularProgress
              key={size}
              size={size}
              value={50}
              aria-label={`Circular ${size}`}
            />
          ))}
        </Div>
      </Div>
    </Div>
  );
}