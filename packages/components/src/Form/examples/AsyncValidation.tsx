import { Button, Form, FormField, Input } from '@apx-ui/ds';

const TAKEN = new Set(['admin', 'root', 'ada', 'system']);

async function checkUsername(value: string, signal: AbortSignal): Promise<string | null> {
  await new Promise((r) => setTimeout(r, 500));
  if (signal.aborted) return null;
  if (!value) return 'Required';
  if (value.length < 3) return 'Minimum 3 characters';
  if (TAKEN.has(value.toLowerCase())) return 'Already taken';
  return null;
}

export default function AsyncValidation() {
  return (
    <Form
      initialValues={{ username: '' }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 250));
        alert(`Reserved ${String(values.username)}`);
      }}
    >
      <FormField
        name="username"
        label="Username"
        description="Try “admin” to trigger the server-side rejection."
        validateAsync={(value, { signal }) => checkUsername(String(value ?? ''), signal)}
        validateDebounceMs={300}
      >
        <Input placeholder="pick a username" />
      </FormField>
      <Button type="submit" variant="solid">Reserve</Button>
    </Form>
  );
}