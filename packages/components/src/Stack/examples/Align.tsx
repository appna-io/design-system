import { Div, HStack, Typography, VStack } from '@apx-ui/ds';

const VALUES = ['start', 'center', 'end', 'stretch', 'baseline'] as const;

export default function Align() {
  return (
    <VStack gap={3}>
      {VALUES.map((value) => (
        <Div key={value}>
          <Typography
            variant="caption"
            color="fg.muted"
            className="mb-1 uppercase tracking-wide"
          >
            {value}
          </Typography>
          <HStack
            align={value}
            gap={2}
            className="h-20 w-full rounded-md border border-border bg-bg-paper p-2"
          >
            <Typography
              as="span"
              variant="caption"
              className="rounded-sm bg-primary px-2 py-1 text-primary-contrast"
            >
              Small
            </Typography>
            <Typography
              as="span"
              variant="bodySmall"
              className="rounded-sm bg-primary px-2 py-2 text-primary-contrast"
            >
              Medium text
            </Typography>
            <Typography
              as="span"
              className="rounded-sm bg-primary px-2 py-3 text-lg text-primary-contrast"
            >
              Large item
            </Typography>
          </HStack>
        </Div>
      ))}
    </VStack>
  );
}