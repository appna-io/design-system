import {
  Button,
  Checkbox,
  Form,
  FormField,
  Input,
  NumberInput,
  Rating,
  Select,
  Switch,
  TagsInput,
  Textarea,
} from 'apx-ds';

interface Values extends Record<string, unknown> {
  name: string;
  bio: string;
  age: number | '';
  newsletter: boolean;
  notifications: boolean;
  language: string;
  rating: number;
  tags: string[];
}

export default function EveryControl() {
  return (
    <Form<Values>
      initialValues={{
        name: '',
        bio: '',
        age: '',
        newsletter: false,
        notifications: true,
        language: '',
        rating: 0,
        tags: [],
      }}
      onSubmit={async (values) => alert(JSON.stringify(values, null, 2))}
    >
      <FormField name="name" label="Name">
        <Input />
      </FormField>
      <FormField name="bio" label="Bio">
        <Textarea rows={2} />
      </FormField>
      <FormField name="age" label="Age">
        <NumberInput min={0} max={120} />
      </FormField>
      <FormField name="newsletter" binding="checkbox">
        <Checkbox>Subscribe to the newsletter</Checkbox>
      </FormField>
      <FormField name="notifications" binding="checkbox">
        <Switch>Push notifications</Switch>
      </FormField>
      <FormField name="language" label="Language" binding="value">
        <Select
          options={[
            { value: 'en', label: 'English' },
            { value: 'he', label: 'עברית' },
            { value: 'ar', label: 'العربية' },
          ]}
        />
      </FormField>
      <FormField name="rating" label="Rating" binding="value">
        <Rating />
      </FormField>
      <FormField name="tags" label="Tags" binding="value">
        <TagsInput />
      </FormField>
      <Button type="submit" variant="solid">Submit</Button>
    </Form>
  );
}
