import { Button, Field, Input, useForm } from 'apx-ds';

export default function HeadlessHook() {
  const form = useForm<{ email: string; password: string } & Record<string, unknown>>({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'Required';
      if (!values.password) errors.password = 'Required';
      return errors;
    },
    onSubmit: async (values) => alert(JSON.stringify(values)),
  });

  return (
    <form noValidate onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field
        label="Email"
        error={form.touched.email ? form.errors.email : undefined}
        required
      >
        <Input
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
      </Field>
      <Field
        label="Password"
        error={form.touched.password ? form.errors.password : undefined}
        required
      >
        <Input
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
      </Field>
      <Button type="submit" variant="solid" disabled={form.isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
