import { useState } from 'react';
import {
  Checkbox,
  Combobox,
  Field,
  Input,
  NumberInput,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Switch,
  TagsInput,
  Textarea,
} from '@apx-ui/ds';

/**
 * Verifies that every form control that uses the shared `useFormFieldA11y` hook lights up
 * through Field's context — no per-control code change required. The 10 controls below cover
 * the full text-like / boolean / numeric / specialty matrix.
 */
export default function EveryControl() {
  const [tags, setTags] = useState<string[]>(['design-system', 'react']);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <Field label="Full name" required helperText="As shown on your ID.">
        <Input name="name" placeholder="Jane Doe" />
      </Field>

      <Field label="Bio" helperText="A short description shown on your profile.">
        <Textarea name="bio" rows={3} placeholder="A few sentences about you…" />
      </Field>

      <Field label="Country" helperText="Used to localize date and currency formats.">
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

      <Field label="Timezone" helperText="Auto-detected; pick to override.">
        <Combobox
          placeholder="Search timezones…"
          options={[
            { value: 'utc', label: 'UTC' },
            { value: 'america/new_york', label: 'America/New_York' },
            { value: 'europe/london', label: 'Europe/London' },
            { value: 'asia/jerusalem', label: 'Asia/Jerusalem' },
            { value: 'asia/tokyo', label: 'Asia/Tokyo' },
          ]}
        />
      </Field>

      <Field as="fieldset" label="Notifications" helperText="Pick at least one channel.">
        <div className="flex flex-col gap-1">
          <Checkbox name="notify-email" defaultChecked>
            Email
          </Checkbox>
          <Checkbox name="notify-sms">SMS</Checkbox>
          <Checkbox name="notify-push">Push notifications</Checkbox>
        </div>
      </Field>

      <Field label="Two-factor authentication" helperText="Requires an authenticator app.">
        <Switch name="2fa" />
      </Field>

      <Field as="fieldset" label="Theme" helperText="Choose your preferred appearance.">
        <RadioGroup name="theme" defaultValue="system">
          <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
          <Radio value="system">System</Radio>
        </RadioGroup>
      </Field>

      <Field label="Team size" helperText="Used to recommend a plan.">
        <NumberInput name="teamSize" min={1} max={500} defaultValue={5} />
      </Field>

      <Field label="Feedback rating" helperText="How was your experience?">
        <Rating name="rating" defaultValue={4} />
      </Field>

      <Field label="Interests" helperText="Press Enter or comma to add.">
        <TagsInput name="interests" value={tags} onChange={(next) => setTags([...next])} />
      </Field>
    </div>
  );
}
