import { HStack, VStack } from 'apx-ds';

const GAPS = [0, 1, 2, 4, 6, 8] as const;

export default function Gap() {
  return (
    <VStack gap={4}>
      {GAPS.map((gap) => (
        <div key={gap}>
          <div className="mb-1 text-xs uppercase tracking-wide text-fg-muted">gap={gap}</div>
          <HStack gap={gap}>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">A</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">B</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">C</span>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-contrast">D</span>
          </HStack>
        </div>
      ))}
    </VStack>
  );
}
