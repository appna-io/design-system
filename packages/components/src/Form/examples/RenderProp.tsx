import { Button, Div, Form, Input } from '@apx-ui/ds';

export default function RenderProp() {
  return (
    <Form
      initialValues={{ email: '' }}
      onSubmit={async (values) => alert(JSON.stringify(values))}
    >
      {(form) => (
        <Div display="flex" flexDirection="column" gap="3">
          <Input
            name="email"
            value={String(form.values.email ?? '')}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="email"
          />
          <Button type="submit" variant="solid" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Saving…' : 'Save'}
          </Button>
          <pre style={{ fontSize: 11, opacity: 0.7 }}>
            {JSON.stringify({ values: form.values, touched: form.touched, dirty: form.dirty }, null, 2)}
          </pre>
        </Div>
      )}
    </Form>
  );
}