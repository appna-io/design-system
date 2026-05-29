import { HStack, Spacer, VStack } from '@apx-ui/ds';

export default function Nested() {
  return (
    <VStack
      gap={3}
      className="max-w-md rounded-lg border border-border bg-bg-paper p-4"
    >
      <HStack gap={3} align="center">
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary" />
        <VStack gap={0.5}>
          <strong className="text-fg-default">Ada Lovelace</strong>
          <span className="text-xs text-fg-muted">ada@example.com</span>
        </VStack>
        <Spacer />
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          Follow
        </button>
      </HStack>

      <p className="text-fg-default">
        Stack vocabularies compose: an <code>HStack</code> inside a <code>VStack</code> covers most
        card-row patterns in product UIs without reaching for raw flex utilities.
      </p>

      <HStack gap={2} justify="end">
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          Dismiss
        </button>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-contrast"
        >
          Confirm
        </button>
      </HStack>
    </VStack>
  );
}
