import { Div, Progress } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-sm">
      <Progress value={66} aria-label="Upload progress" />
    </Div>
  );
}