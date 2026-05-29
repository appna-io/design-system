import { Field, Input } from '@apx-ui/ds';

export default function WithStartEndAdornment() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field
        label="Amount"
        startAdornment={<span className="text-sm font-medium">$</span>}
        endAdornment={<span className="text-xs text-fg-muted">USD</span>}
      >
        <Input type="number" name="amount" placeholder="0.00" />
      </Field>
      <Field
        label="Subdomain"
        startAdornment={<span className="text-xs text-fg-muted">https://</span>}
        endAdornment={<span className="text-xs text-fg-muted">.apx.dev</span>}
        helperText="Lowercase letters, numbers, and hyphens only."
      >
        <Input name="subdomain" placeholder="my-team" />
      </Field>
    </div>
  );
}
