import { HStack, VStack } from '@apx-ui/ds';

const VALUES = ['start', 'center', 'end', 'stretch', 'baseline'] as const;

export default function Align() {
  return (
    <VStack gap={3}>
      {VALUES.map((value) => (
        <div key={value}>
          <div className="mb-1 text-xs uppercase tracking-wide text-fg-muted">{value}</div>
          <HStack
            align={value}
            gap={2}
            className="h-20 w-full rounded-md border border-border bg-bg-paper p-2"
          >
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">
              Small
            </span>
            <span className="rounded-sm bg-primary px-2 py-2 text-base text-primary-contrast">
              Medium text
            </span>
            <span className="rounded-sm bg-primary px-2 py-3 text-lg text-primary-contrast">
              Large item
            </span>
          </HStack>
        </div>
      ))}
    </VStack>
  );
}
