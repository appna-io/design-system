import { Div, Field, Input } from '@apx-ui/ds';

export default function WithLabelIcon() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field
        label={
          <>
            <MailGlyph /> Email
          </>
        }
        helperText="We'll send a confirmation link."
      >
        <Input type="email" name="email" />
      </Field>
      <Field
        label={
          <>
            <LockGlyph /> Password
          </>
        }
        required
      >
        <Input type="password" name="password" />
      </Field>
    </Div>
  );
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}