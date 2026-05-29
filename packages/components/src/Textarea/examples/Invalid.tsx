import { Textarea } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <div className="flex w-full max-w-md flex-col gap-1.5 text-sm">
      <label htmlFor="bio-bad" className="text-fg">
        Bio (10+ characters)
      </label>
      <Textarea
        id="bio-bad"
        defaultValue="too short"
        invalid
        aria-describedby="bio-bad-error"
        rows={3}
      />
      <p id="bio-bad-error" className="text-xs text-danger">
        Bio must be at least 10 characters.
      </p>
    </div>
  );
}
