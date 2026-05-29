import { HStack, VStack } from 'apx-ds';

const VALUES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

export default function Justify() {
  return (
    <VStack gap={3}>
      {VALUES.map((value) => (
        <div key={value}>
          <div className="mb-1 text-xs uppercase tracking-wide text-fg-muted">{value}</div>
          <HStack
            justify={value}
            className="w-full rounded-md border border-border bg-bg-paper p-2"
          >
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">A</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">B</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">C</span>
          </HStack>
        </div>
      ))}
    </VStack>
  );
}
