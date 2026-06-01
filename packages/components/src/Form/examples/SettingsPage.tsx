import { Button, Div, Form, FormField, Input, Textarea } from '@apx-ui/ds';

interface SettingsValues extends Record<string, unknown> {
  displayName: string;
  bio: string;
  website: string;
}

export default function SettingsPage() {
  return (
    <Form<SettingsValues>
      initialValues={{
        displayName: 'Ada Lovelace',
        bio: 'Mathematician + first programmer.',
        website: 'https://example.com',
      }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 300));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <FormField name="displayName" label="Display name" required>
        <Input />
      </FormField>
      <FormField name="bio" label="Bio" description="Tell people a bit about yourself.">
        <Textarea rows={3} />
      </FormField>
      <FormField name="website" label="Website" helperText="Must start with https://">
        <Input type="url" />
      </FormField>
      <Div display="flex" gap="2">
        <Button type="submit" variant="solid">Save changes</Button>
        <Button type="reset" variant="ghost">Reset</Button>
      </Div>
    </Form>
  );
}