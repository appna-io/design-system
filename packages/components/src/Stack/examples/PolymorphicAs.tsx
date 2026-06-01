import { Div, Stack, Typography, VStack } from '@apx-ui/ds';

export default function PolymorphicAs() {
  return (
    <VStack gap={4}>
      <Div>
        <Typography
          variant="caption"
          color="fg.muted"
          className="mb-1 uppercase tracking-wide"
        >
          as=&quot;nav&quot;
        </Typography>
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
      </Div>

      <Div>
        <Typography
          variant="caption"
          color="fg.muted"
          className="mb-1 uppercase tracking-wide"
        >
          as=&quot;ul&quot;
        </Typography>
        <Stack as="ul" gap={1} className="list-disc pl-5">
          <Typography as="li">One</Typography>
          <Typography as="li">Two</Typography>
          <Typography as="li">Three</Typography>
        </Stack>
      </Div>
    </VStack>
  );
}