import { Badge, Field, Select } from 'apx-ds';

export default function WithLabelAddon() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field
        label="Plan"
        labelAddon={
          <Badge color="success" size="sm">
            Pro
          </Badge>
        }
        helperText="Upgrade or downgrade anytime."
      >
        <Select placeholder="Pick a plan">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="starter">Starter</Select.Item>
            <Select.Item value="pro">Pro</Select.Item>
            <Select.Item value="enterprise">Enterprise</Select.Item>
          </Select.Content>
        </Select>
      </Field>
      <Field
        label="Region"
        labelAddon={
          <Badge color="info" size="sm">
            New
          </Badge>
        }
      >
        <Select placeholder="Pick a region">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="us-east-1">us-east-1</Select.Item>
            <Select.Item value="eu-west-1">eu-west-1</Select.Item>
            <Select.Item value="ap-south-1">ap-south-1</Select.Item>
          </Select.Content>
        </Select>
      </Field>
    </div>
  );
}
