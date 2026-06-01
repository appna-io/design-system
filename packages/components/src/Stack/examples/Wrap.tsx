import { HStack, Typography } from '@apx-ui/ds';

export default function Wrap() {
  return (
    <HStack wrap gap={2} className="max-w-md rounded-md border border-border p-3">
      {Array.from({ length: 14 }).map((_, i) => (
        <Typography
          key={i}
          as="span"
          variant="bodySmall"
          className="rounded-md bg-bg-subtle px-3 py-1"
        >
          Tag {i + 1}
        </Typography>
      ))}
    </HStack>
  );
}