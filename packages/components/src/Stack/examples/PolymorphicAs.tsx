import { Stack, VStack } from 'apx-ds';

export default function PolymorphicAs() {
  return (
    <VStack gap={4}>
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-fg-muted">as=&quot;nav&quot;</div>
        <Stack as="nav" direction="row" gap={4} aria-label="Primary">
          <a className="text-primary underline" href="#a">
            Docs
          </a>
          <a className="text-primary underline" href="#b">
            API
          </a>
          <a className="text-primary underline" href="#c">
            Blog
          </a>
        </Stack>
      </div>

      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-fg-muted">as=&quot;ul&quot;</div>
        <Stack as="ul" gap={1} className="list-disc pl-5">
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </Stack>
      </div>
    </VStack>
  );
}
