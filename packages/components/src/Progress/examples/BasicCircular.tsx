import { CircularProgress, Div } from '@apx-ui/ds';

export default function BasicCircular() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <CircularProgress value={66} aria-label="Upload progress" />
      <CircularProgress value={66} showLabel aria-label="Upload progress with label" />
    </Div>
  );
}