import { EmptyState } from '@apx-ui/ds';

export default function Loading() {
  return (
    <EmptyState
      variant="loading"
      title="Loading workspace"
      description="This usually takes a few seconds."
    />
  );
}
