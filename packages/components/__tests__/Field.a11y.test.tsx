import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '../src/Checkbox/Checkbox';
import { Field, type FieldLabelPosition, type FieldSize } from '../src/Field';
import { Input } from '../src/Input/Input';
import { Select } from '../src/Select';
import { Textarea } from '../src/Textarea/Textarea';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const LABEL_POSITIONS: FieldLabelPosition[] = ['top', 'start', 'floating', 'hidden'];
const SIZES: FieldSize[] = ['sm', 'md', 'lg'];

describe('<Field /> — axe', () => {
  it('default passes axe', async () => {
    const { container } = render(
      <Field label="Email" helperText="Hint">
        <Input type="email" placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('required passes axe', async () => {
    const { container } = render(
      <Field label="Name" required>
        <Input placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('optional passes axe', async () => {
    const { container } = render(
      <Field label="Phone" optional>
        <Input placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('with description + helper passes axe', async () => {
    const { container } = render(
      <Field label="API key" description="Treat like a password" helperText="Press Cmd+V">
        <Input type="password" placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('error state passes axe', async () => {
    const { container } = render(
      <Field label="Email" error="Invalid email address">
        <Input type="email" placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('fieldset + legend passes axe', async () => {
    const { container } = render(
      <Field as="fieldset" label="Notifications" helperText="Pick one">
        <Checkbox>Email</Checkbox>
        <Checkbox>SMS</Checkbox>
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('floating label passes axe', async () => {
    const { container } = render(
      <Field label="Email" labelPosition="floating">
        <Input type="email" placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('hidden label passes axe', async () => {
    const { container } = render(
      <Field label="Search" labelPosition="hidden">
        <Input type="search" placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('compound API passes axe', async () => {
    const { container } = render(
      <Field required>
        <Field.Label>Email</Field.Label>
        <Field.Description>Used for billing</Field.Description>
        <Input type="email" placeholder=" " />
        <Field.Error>Boom</Field.Error>
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Textarea inside Field passes axe', async () => {
    const { container } = render(
      <Field label="Bio" helperText="A short bio.">
        <Textarea placeholder=" " />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Select inside Field passes axe', async () => {
    const { container } = render(
      <Field label="Country" required>
        <Select placeholder="Pick a country">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="us">United States</Select.Item>
            <Select.Item value="il">Israel</Select.Item>
          </Select.Content>
        </Select>
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  for (const labelPosition of LABEL_POSITIONS) {
    for (const size of SIZES) {
      it(`axe matrix: labelPosition=${labelPosition}, size=${size}`, async () => {
        const { container } = render(
          <Field label="Email" labelPosition={labelPosition} size={size} helperText="Hint">
            <Input type="email" placeholder=" " size={size} />
          </Field>,
        );
        expect(await axe(container)).toHaveNoViolations();
      });
    }
  }
});

describe('<Field /> — semantic structure', () => {
  it('label is a <label> with htmlFor matching the input id', () => {
    const { container } = render(
      <Field label="Email">
        <Input type="email" placeholder=" " />
      </Field>,
    );
    const label = container.querySelector('label');
    const input = container.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('as="fieldset" renders a <fieldset>/<legend> pair', () => {
    const { container } = render(
      <Field as="fieldset" label="Group">
        <Checkbox>A</Checkbox>
        <Checkbox>B</Checkbox>
      </Field>,
    );
    expect(container.querySelector('fieldset')).not.toBeNull();
    expect(container.querySelector('legend')).not.toBeNull();
  });

  it('required indicator is aria-hidden, aria-required is on the control', () => {
    const { container } = render(
      <Field label="Name" required>
        <Input placeholder=" " />
      </Field>,
    );
    const indicator = container.querySelector('[data-field-required-indicator]');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('input')?.getAttribute('aria-required')).toBe('true');
  });

  it('separator between description and helper composes aria-describedby in order', () => {
    const { container } = render(
      <Field label="x" description="Desc" helperText="Help">
        <Input placeholder=" " />
      </Field>,
    );
    const input = container.querySelector('input')!;
    const describedBy = input.getAttribute('aria-describedby')!;
    const description = container.querySelector('[data-field-description]')!;
    const helper = container.querySelector('[data-field-helper]')!;
    expect(describedBy.indexOf(description.id)).toBeLessThan(describedBy.indexOf(helper.id));
  });
});
