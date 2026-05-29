import { Progress } from '@apx-ui/ds';

export default function Basic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Progress value={66} aria-label="Upload progress" />
    </div>
  );
}
