import { Field, Input, Select } from '@apx-ui/ds';

export default function LabelPositionStart() {
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Field labelPosition="start" labelWidth="140px" label="Full name" required>
        <Input name="name" />
      </Field>
      <Field labelPosition="start" labelWidth="140px" label="Email" helperText="We'll never share this.">
        <Input type="email" name="email" />
      </Field>
      <Field labelPosition="start" labelWidth="140px" label="Country">
        <Select placeholder="Pick a country">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="us">United States</Select.Item>
            <Select.Item value="ca">Canada</Select.Item>
            <Select.Item value="il">Israel</Select.Item>
            <Select.Item value="jp">Japan</Select.Item>
          </Select.Content>
        </Select>
      </Field>
    </div>
  );
}
