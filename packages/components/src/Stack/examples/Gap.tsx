import { Div, HStack, Typography, VStack } from '@apx-ui/ds';

const GAPS = [0, 1, 2, 4, 6, 8] as const;

export default function Gap() {
  return (
    <VStack gap={4}>
      {GAPS.map((gap) => (
        <Div key={gap}>
          <Typography
            variant="caption"
            color="fg.muted"
            className="mb-1 uppercase tracking-wide"
          >
            gap={gap}
          </Typography>
          <HStack gap={gap}>
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
            <Typography
              as="span"
              variant="caption"
              className="rounded-sm bg-primary px-2 py-1 text-primary-contrast"
            >
              D
            </Typography>
          </HStack>
        </Div>
      ))}
    </VStack>
  );
}