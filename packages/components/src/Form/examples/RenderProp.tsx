import { Button, Form, Input } from 'apx-ds';

export default function RenderProp() {
  return (
    <Form
      initialValues={{ email: '' }}
      onSubmit={async (values) => alert(JSON.stringify(values))}
    >
      {(form) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        </div>
      )}
    </Form>
  );
}
