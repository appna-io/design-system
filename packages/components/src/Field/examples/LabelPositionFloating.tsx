import { Div, Field, Input } from '@apx-ui/ds';

export default function LabelPositionFloating() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field label="Email" labelPosition="floating">
        <Input type="email" name="email" placeholder=" " />
      </Field>
      <Field label="Password" labelPosition="floating">
        <Input type="password" name="password" placeholder=" " />
      </Field>
      <Field label="Project name" labelPosition="floating" helperText="Used in URLs and reports.">
        <Input name="project" placeholder=" " />
      </Field>
    </Div>
  );
}