import { CircularProgress, Div, Progress } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-full max-w-sm">
      <Progress value={42} size="lg" showLabel aria-label="Upload progress" />
      <Progress
        value={88}
        size="lg"
        variant="soft"
        color="success"
        showLabel
        aria-label="Sync progress"
      />
      <Div display="flex" alignItems="center" gap="6">
        <CircularProgress value={42} size="lg" showLabel aria-label="Upload" />
        <CircularProgress
          value={88}
          size="lg"
          color="success"
          showLabel
          aria-label="Sync"
        />
      </Div>
    </Div>
  );
}