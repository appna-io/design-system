import { Div, Field, Input, Typography } from '@apx-ui/ds';

export default function WithStartEndAdornment() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field
        label="Amount"
        startAdornment={
          <Typography as="span" variant="bodySmall" weight="medium">
            $
          </Typography>
        }
        endAdornment={
          <Typography as="span" variant="caption" color="fg.muted">
            USD
          </Typography>
        }
      >
        <Input type="number" name="amount" placeholder="0.00" />
      </Field>
      <Field
        label="Subdomain"
        startAdornment={
          <Typography as="span" variant="caption" color="fg.muted">
            https://
          </Typography>
        }
        endAdornment={
          <Typography as="span" variant="caption" color="fg.muted">
            .apx.dev
          </Typography>
        }
        helperText="Lowercase letters, numbers, and hyphens only."
      >
        <Input name="subdomain" placeholder="my-team" />
      </Field>
    </Div>
  );
}