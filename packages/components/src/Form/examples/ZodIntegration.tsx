import { Button, Form, FormField, Input } from '@apx-ui/ds';

/**
 * Zod (or Yup / Joi) integration is a one-liner in the `validate` callback. No bundled adapter —
 * consumers can pull whatever they prefer. Below is the canonical 8-line pattern; uncomment the
 * import when `zod` is installed.
 */

// import { z } from 'zod';
// const schema = z.object({
//   email: z.string().email('Enter a valid email'),
//   age: z.coerce.number().min(13, 'Must be 13 or older'),
// });

function manualValidate(values: { email: unknown; age: unknown }) {
  const errors: Record<string, string> = {};
  const email = String(values.email ?? '');
  const age = Number(values.age);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (Number.isNaN(age) || age < 13) errors.age = 'Must be 13 or older';
  return errors;
}

export default function ZodIntegration() {
  return (
    <Form
      initialValues={{ email: '', age: '' }}
      validate={manualValidate}
      // With zod:
      // validate={(values) => {
      //   const result = schema.safeParse(values);
      //   if (result.success) return {};
      //   return Object.fromEntries(
      //     result.error.issues.map((i) => [i.path.join('.'), i.message]),
      //   );
      // }}
      onSubmit={async (values) => alert(JSON.stringify(values))}
    >
      <FormField name="email" label="Email">
        <Input type="email" />
      </FormField>
      <FormField name="age" label="Age">
        <Input type="number" />
      </FormField>
      <Button type="submit" variant="solid">Submit</Button>
    </Form>
  );
}