import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Form, FormField } from '../src/Form';
import { Input } from '../src/Input/Input';
import { Checkbox } from '../src/Checkbox/Checkbox';
import { Textarea } from '../src/Textarea/Textarea';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('<Form> — axe', () => {
  it('basic signup form has no violations', async () => {
    const { container } = render(
      <Form
        initialValues={{ email: '', password: '', agree: false }}
        onSubmit={vi.fn()}
      >
        <FormField name="email" label="Email" required>
          <Input type="email" />
        </FormField>
        <FormField name="password" label="Password" required>
          <Input type="password" />
        </FormField>
        <FormField name="agree" binding="checkbox">
          <Checkbox>I agree</Checkbox>
        </FormField>
        <button type="submit">Sign up</button>
      </Form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('form with errors + helpers has no violations', async () => {
    const { container } = render(
      <Form
        initialValues={{ email: 'bad' }}
        validate={() => ({ email: 'Invalid email' })}
        onSubmit={vi.fn()}
      >
        <FormField name="email" label="Email" helperText="we never spam" required>
          <Input type="email" />
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('settings page with multiple control types has no violations', async () => {
    const { container } = render(
      <Form
        initialValues={{ name: 'Ada', bio: '', notify: true }}
        onSubmit={vi.fn()}
      >
        <FormField name="name" label="Name">
          <Input />
        </FormField>
        <FormField name="bio" label="Bio" description="Optional short bio.">
          <Textarea rows={3} />
        </FormField>
        <FormField name="notify" binding="checkbox">
          <Checkbox>Notifications</Checkbox>
        </FormField>
        <button type="submit">Save</button>
      </Form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
