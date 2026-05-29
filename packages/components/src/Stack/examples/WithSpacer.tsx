import { HStack, Spacer } from 'apx-ds';

export default function WithSpacer() {
  return (
    <HStack gap={2} align="center" className="w-full rounded-lg border border-border p-3">
      <strong>Document</strong>
      <span className="text-fg-muted">/ edited just now</span>
      <Spacer />
      <button
        type="button"
        className="rounded-md border border-border px-3 py-1.5 text-sm"
      >
        Share
      </button>
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-contrast"
      >
        Publish
      </button>
    </HStack>
  );
}
