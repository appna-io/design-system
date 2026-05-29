import { HStack } from 'apx-ds';

export default function Horizontal() {
  return (
    <HStack gap={2} align="center">
      <div className="rounded-md bg-primary px-3 py-2 text-primary-contrast">Logo</div>
      <span className="text-fg-default">Acme Inc.</span>
      <span className="text-fg-muted">/ Dashboard</span>
    </HStack>
  );
}
