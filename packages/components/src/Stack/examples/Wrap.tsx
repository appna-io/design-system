import { HStack } from 'apx-ds';

export default function Wrap() {
  return (
    <HStack wrap gap={2} className="max-w-md rounded-md border border-border p-3">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="rounded-md bg-bg-subtle px-3 py-1 text-sm"
        >
          Tag {i + 1}
        </span>
      ))}
    </HStack>
  );
}
