import { Div, Progress, Typography, type ProgressRounded } from '@apx-ui/ds';

const ROUNDED: readonly ProgressRounded[] = ['sm', 'md', 'lg', 'full'];

export default function Rounded() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-sm">
      {ROUNDED.map((rounded) => (
        <Div key={rounded} display="flex" flexDirection="column" gap="1.5">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            rounded={rounded}
          </Typography>
          <Progress
            rounded={rounded}
            value={62}
            size="lg"
            aria-label={`Rounded ${rounded}`}
          />
        </Div>
      ))}
    </Div>
  );
}