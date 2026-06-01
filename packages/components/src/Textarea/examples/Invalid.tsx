import { Div, Textarea, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="1.5" className="w-full max-w-md text-sm">
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
      <Typography id="bio-bad-error" variant="caption" color="danger">
        Bio must be at least 10 characters.
      </Typography>
    </Div>
  );
}