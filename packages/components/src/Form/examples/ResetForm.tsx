import { Button, Div, Form, FormField, Input } from '@apx-ui/ds';

export default function ResetForm() {
  return (
    <Form
      initialValues={{ name: 'Ada', city: 'London' }}
      onSubmit={async (values) => alert(JSON.stringify(values))}
    >
      {(form) => (
        <>
          <FormField name="name" label="Name">
            <Input />
          </FormField>
          <FormField name="city" label="City">
            <Input />
          </FormField>
          <Div display="flex" gap="2">
            <Button type="submit" variant="solid">Save</Button>
            <Button type="button" variant="ghost" onClick={() => form.resetForm()}>
              Reset to initial
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.resetForm({ values: { name: '', city: '' } })}
            >
              Reset to empty
            </Button>
          </Div>
        </>
      )}
    </Form>
  );
}