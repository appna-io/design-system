import { Button, Form, FormField, Input } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Form
      initialValues={{ name: '', email: '', role: '' }}
      validate={(v) => {
        const errors: Record<string, string> = {};
        if (!v.name.trim()) errors.name = 'Name is required';
        if (!v.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
          errors.email = 'Enter a valid email';
        }
        if (!v.role.trim()) errors.role = 'Role is required';
        return errors;
      }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 400));
        alert(`Submitted: ${values.name} (${values.role})`);
      }}
    >
      <FormField name="name" label="Full name" required>
        <Input placeholder="Maya Singh" />
      </FormField>
      <FormField name="email" label="Work email" required>
        <Input type="email" placeholder="maya@northwind.io" />
      </FormField>
      <FormField name="role" label="Role" required>
        <Input placeholder="Product designer" />
      </FormField>
      <Button type="submit" variant="solid">
        Create account
      </Button>
    </Form>
  );
}