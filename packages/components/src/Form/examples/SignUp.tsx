import { Button, Checkbox, Form, FormField, Input } from 'apx-ds';

interface SignupValues extends Record<string, unknown> {
  email: string;
  password: string;
  terms: boolean;
}

export default function SignUp() {
  return (
    <Form<SignupValues>
      initialValues={{ email: '', password: '', terms: false }}
      validate={(values) => {
        const errors: Partial<Record<keyof SignupValues, string>> = {};
        if (!values.email) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
          errors.email = 'Enter a valid email';
        if (!values.password) errors.password = 'Password is required';
        else if (values.password.length < 8)
          errors.password = 'At least 8 characters';
        if (!values.terms) errors.terms = 'You must accept the terms';
        return errors;
      }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 400));
        alert(`Welcome, ${values.email}!`);
      }}
    >
      <FormField name="email" label="Email" required>
        <Input type="email" placeholder="ada@example.com" />
      </FormField>
      <FormField name="password" label="Password" required helperText="At least 8 characters">
        <Input type="password" />
      </FormField>
      <FormField name="terms" binding="checkbox">
        <Checkbox>I accept the terms and privacy policy</Checkbox>
      </FormField>
      <Button type="submit" variant="solid">Create account</Button>
    </Form>
  );
}
