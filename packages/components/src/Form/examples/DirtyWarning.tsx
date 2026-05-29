import { Button, Form, FormField, Input } from 'apx-ds';

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button type="submit" variant="solid" disabled={!form.isDirty}>
              {form.isDirty ? 'Save changes' : 'Saved'}
            </Button>
            {form.isDirty ? (
              <span style={{ fontSize: 12, color: 'var(--sds-color-warning-fg)' }}>
                You have unsaved changes.
              </span>
            ) : null}
          </div>
        </>
      )}
    </Form>
  );
}
