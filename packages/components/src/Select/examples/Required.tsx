import { useState } from 'react';

import { Button, Select, Typography } from '@apx-ui/ds';

export default function Required() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-3 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(String(data.get('plan') ?? ''));
      }}
    >
      <label className="text-sm font-medium" htmlFor="plan">
        Plan
      </label>
      <Select id="plan" name="plan" required placeholder="Select a plan">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="pro">Pro</Select.Item>
          <Select.Item value="enterprise">Enterprise</Select.Item>
        </Select.Content>
      </Select>
      <Button type="submit" variant="solid">
        Subscribe
      </Button>
      {submitted ? (
        <Typography variant="bodySmall" color="fg.muted">
          Submitted: <code>{submitted}</code>
        </Typography>
      ) : null}
    </form>
  );
}