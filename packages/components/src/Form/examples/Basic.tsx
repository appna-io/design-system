import { Button, Form, FormField, Input } from 'apx-ds';

export default function Basic() {
  return (
    <Form
      initialValues={{ email: '', name: '' }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 250));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <FormField name="name" label="Name">
        <Input placeholder="Ada Lovelace" />
      </FormField>
      <FormField name="email" label="Email">
        <Input type="email" placeholder="ada@example.com" />
      </FormField>
      <Button type="submit" variant="solid">Submit</Button>
    </Form>
  );
}
