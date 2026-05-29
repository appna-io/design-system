import { Input } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5 text-sm">
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
      <p id="email-bad-error" className="text-xs text-danger">
        Please enter a valid email address.
      </p>
    </div>
  );
}
