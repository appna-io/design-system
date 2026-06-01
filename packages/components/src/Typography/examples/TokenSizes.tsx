import { Div, Typography } from '@apx-ui/ds';

const SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;

export default function TokenSizes() {
  return (
    <Div display="flex" flexDirection="column" gap={2}>
      {SIZES.map((size) => (
        <Typography key={size} fontSize={size} lineHeight="snug">
          fontSize=&quot;{size}&quot; → var(--sds-font-size-{size})
        </Typography>
      ))}
    </Div>
  );
}