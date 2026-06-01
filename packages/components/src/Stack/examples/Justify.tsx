import { Div, HStack, Typography, VStack } from '@apx-ui/ds';

const VALUES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

export default function Justify() {
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
            justify={value}
            className="w-full rounded-md border border-border bg-bg-paper p-2"
          >
            <Typography
              as="span"
              variant="caption"
              className="rounded-sm bg-primary px-2 py-1 text-primary-contrast"
            >
              A
            </Typography>
            <Typography
              as="span"
              variant="caption"
              className="rounded-sm bg-primary px-2 py-1 text-primary-contrast"
            >
              B
            </Typography>
            <Typography
              as="span"
              variant="caption"
              className="rounded-sm bg-primary px-2 py-1 text-primary-contrast"
            >
              C
            </Typography>
          </HStack>
        </Div>
      ))}
    </VStack>
  );
}