import { Field, Input } from 'apx-ds';

export default function LabelPositionFloating() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field label="Email" labelPosition="floating">
        <Input type="email" name="email" placeholder=" " />
      </Field>
      <Field label="Password" labelPosition="floating">
        <Input type="password" name="password" placeholder=" " />
      </Field>
      <Field label="Project name" labelPosition="floating" helperText="Used in URLs and reports.">
        <Input name="project" placeholder=" " />
      </Field>
    </div>
  );
}
