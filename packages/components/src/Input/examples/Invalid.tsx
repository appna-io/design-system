import { Div, Input, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="1.5" className="w-full max-w-sm text-sm">
      <label htmlFor="email-bad" className="text-fg">
        Email address
      </label>
      <Input
        id="email-bad"
        type="email"
        defaultValue="not-an-email"
        invalid
        aria-describedby="email-bad-error"
      />
      <Typography id="email-bad-error" variant="caption" color="danger">
        Please enter a valid email address.
      </Typography>
    </Div>
  );
}