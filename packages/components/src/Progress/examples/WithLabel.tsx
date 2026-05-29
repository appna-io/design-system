import { CircularProgress, Progress } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress value={42} size="lg" showLabel aria-label="Upload progress" />
      <Progress
        value={88}
        size="lg"
        variant="soft"
        color="success"
        showLabel
        aria-label="Sync progress"
      />
      <div className="flex items-center gap-6">
        <CircularProgress value={42} size="lg" showLabel aria-label="Upload" />
        <CircularProgress
          value={88}
          size="lg"
          color="success"
          showLabel
          aria-label="Sync"
        />
      </div>
    </div>
  );
}
