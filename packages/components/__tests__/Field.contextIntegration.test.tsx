import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '../src/Checkbox/Checkbox';
import { Field } from '../src/Field';
import { Input } from '../src/Input/Input';
import { NumberInput } from '../src/NumberInput';
import { Radio, RadioGroup } from '../src/Radio';
import { Rating } from '../src/Rating';
import { Switch } from '../src/Switch/Switch';
import { TagsInput } from '../src/TagsInput';
import { Textarea } from '../src/Textarea/Textarea';
import { renderWithTheme as render } from './utils';

/**
 * Verifies that every form control that consumes `useFormFieldA11y` picks up FieldContext
 * **without any source-code changes** to that control. The hook gained Field-awareness in
 * Phase 49 — these tests are the regression net that keeps that promise honest as we ship
 * new controls (TagsInput today; DatePicker / ColorPicker / FileUpload tomorrow).
 */
describe('<Field /> — context integration with form controls', () => {
  it('Input picks up id, required, describedBy, invalid from FieldContext', () => {
    render(
      <Field
        label="Email"
        required
        htmlFor="my-email"
        description="Desc"
        error="bad email"
      >
        <Input placeholder="email" />
      </Field>,
    );

    const input = screen.getByPlaceholderText('email');
    expect(input).toHaveAttribute('id', 'my-email');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('Textarea picks up id + invalid from FieldContext', () => {
    render(
      <Field label="Bio" error="too short" htmlFor="bio-x">
        <Textarea placeholder="bio" />
      </Field>,
    );

    const textarea = screen.getByPlaceholderText('bio');
    expect(textarea).toHaveAttribute('id', 'bio-x');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('Checkbox picks up id + required + describedBy from FieldContext', () => {
    render(
      <Field label="Accept terms" required description="Read first." htmlFor="terms">
        <Checkbox>I agree</Checkbox>
      </Field>,
    );

    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('id', 'terms');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('Switch picks up id + invalid from FieldContext', () => {
    render(
      <Field label="2FA" error="Required" htmlFor="2fa-x">
        <Switch />
      </Field>,
    );

    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('id', '2fa-x');
    expect(sw).toHaveAttribute('aria-invalid', 'true');
  });

  it('Radio (inside RadioGroup) picks up describedBy from a fieldset Field', () => {
    render(
      <Field as="fieldset" label="Theme" description="Auto-syncs to OS." required>
        <RadioGroup name="theme" defaultValue="light">
          <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
        </RadioGroup>
      </Field>,
    );

    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    // The fieldset wraps the group; the legend carries the label
    const fieldset = screen.getByRole('group', { name: /Theme/i });
    expect(fieldset.tagName).toBe('FIELDSET');
  });

  it('NumberInput picks up id + required from FieldContext', () => {
    render(
      <Field label="Team size" required htmlFor="size-x">
        <NumberInput defaultValue={3} />
      </Field>,
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('id', 'size-x');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('Rating picks up invalid from FieldContext', () => {
    render(
      <Field label="Rating" error="bad" htmlFor="rating-x">
        <Rating defaultValue={3} />
      </Field>,
    );

    // Rating composes its own `aria-describedby` from its private description/helper/error ids
    // (it doesn't forward the shared hook's describedBy onto the role=slider). It DOES forward
    // `aria-invalid` though, which is what the shared hook gives us from FieldContext.
    const ratingSlider = screen.getByRole('slider');
    expect(ratingSlider).toHaveAttribute('aria-invalid', 'true');
  });

  it('TagsInput picks up id + invalid from FieldContext', () => {
    render(
      <Field label="Tags" error="Pick at least one" htmlFor="tags-x">
        <TagsInput />
      </Field>,
    );

    // TagsInput exposes its inner input as a combobox (aria-autocomplete="list").
    const tagsInput = screen.getByRole('combobox');
    expect(tagsInput.getAttribute('id')).toBe('tags-x');
    expect(tagsInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not break standalone controls (no FieldContext) — Input still self-wires id', () => {
    render(<Input placeholder="standalone" required invalid />);

    const input = screen.getByPlaceholderText('standalone');
    expect(input.id).toBeTruthy();
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
