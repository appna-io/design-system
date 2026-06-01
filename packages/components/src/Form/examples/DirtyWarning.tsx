import { Button, Div, Form, FormField, Input, Typography } from '@apx-ui/ds';

export default function DirtyWarning() {
  return (
    <Form
      initialValues={{ title: 'Untitled' }}
      onSubmit={async (values) => {
        alert(`Saved: ${String(values.title)}`);
      }}
    >
      {(form) => (
        <>
          <FormField name="title" label="Title">
            <Input />
          </FormField>
          <Div display="flex" gap="2" alignItems="center">
            <Button type="submit" variant="solid" disabled={!form.isDirty}>
              {form.isDirty ? 'Save changes' : 'Saved'}
            </Button>
            {form.isDirty ? (
              <Typography variant="caption" color="warning">
                You have unsaved changes.
              </Typography>
            ) : null}
          </Div>
        </>
      )}
    </Form>
  );
}