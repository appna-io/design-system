import { Button, HStack, Typography, VStack } from '@apx-ui/ds';

export default function Overview() {
  return (
    <VStack
      gap={3}
      className="max-w-sm rounded-lg border border-border bg-bg-paper p-4"
    >
      <Typography as="h3" variant="bodySmall" weight="semibold" color="fg.default">
        Deployment summary
      </Typography>
      <Typography variant="bodySmall" color="fg.muted">
        Your latest build is live in production. Review the rollout details below.
      </Typography>
      <HStack gap={2} justify="end">
        <Button variant="ghost" size="sm">
          Dismiss
        </Button>
        <Button size="sm">View logs</Button>
      </HStack>
    </VStack>
  );
}