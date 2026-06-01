import { Button, Form, FormField, Input } from '@apx-ui/ds';

export default function ServerErrors() {
  return (
    <Form
      initialValues={{ email: 'ada@example.com', code: '' }}
      onSubmit={async (values, helpers) => {
        await new Promise((r) => setTimeout(r, 300));
        // Pretend the server rejected the code.
        helpers.setErrors({
          code: 'That code is invalid or expired',
        });
      }}
    >
      <FormField name="email" label="Email" required>
        <Input type="email" />
      </FormField>
      <FormField name="code" label="Verification code" required>
        <Input inputMode="numeric" placeholder="6 digits" />
      </FormField>
      <Button type="submit" variant="solid">Verify</Button>
    </Form>
  );
}