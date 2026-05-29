import { Button, Form, FormField, Input } from 'apx-ds';

export default function PerFieldValidator() {
  return (
    <Form
      initialValues={{ age: '' }}
      onSubmit={async (values) => {
        alert(`Got age = ${String(values.age)}`);
      }}
    >
      <FormField
        name="age"
        label="Age"
        validate={(value) => {
          const n = Number(value);
          if (!value) return 'Required';
          if (Number.isNaN(n)) return 'Must be a number';
          if (n < 13) return 'Must be 13 or older';
          if (n > 150) return 'That cannot be right';
          return null;
        }}
      >
        <Input type="number" min={0} />
      </FormField>
      <Button type="submit" variant="solid">Continue</Button>
    </Form>
  );
}
