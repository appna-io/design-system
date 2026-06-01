import { Div, HStack, Spacer, Typography, VStack } from '@apx-ui/ds';

export default function Nested() {
  return (
    <VStack
      gap={3}
      className="max-w-md rounded-lg border border-border bg-bg-paper p-4"
    >
      <HStack gap={3} align="center">
        <Div className="h-10 w-10 shrink-0 rounded-full bg-primary" />
        <VStack gap={0.5}>
          <Typography as="strong" weight="semibold" color="fg.default">
            Ada Lovelace
          </Typography>
          <Typography variant="caption" color="fg.muted">
            ada@example.com
          </Typography>
        </VStack>
        <Spacer />
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          Follow
        </button>
      </HStack>

      <Typography color="fg.default">
        Stack vocabularies compose: an <code>HStack</code> inside a <code>VStack</code> covers most
        card-row patterns in product UIs without reaching for raw flex utilities.
      </Typography>

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