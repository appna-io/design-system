import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field } from '../src/Field';
import { Input } from '../src/Input/Input';
import { renderWithTheme as render } from './utils';

describe('<Field /> — compound API', () => {
  it('renders Field.Label / Description / Helper around the control in JSX order', () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Description>Long-form guidance.</Field.Description>
        <Input placeholder="Type" />
        <Field.Helper>Lowercase only.</Field.Helper>
      </Field>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Long-form guidance.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type')).toBeInTheDocument();
    expect(screen.getByText('Lowercase only.')).toBeInTheDocument();
  });

  it('Field.Label is associated to the control via htmlFor + id (compound API)', () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Input placeholder="Type" />
      </Field>,
    );

    const label = screen.getByText('Email').closest('label');
    const input = screen.getByPlaceholderText('Type');
    expect(label?.getAttribute('for')).toBe(input.getAttribute('id'));
  });

  it('suppresses prop-driven label when Field.Label is rendered explicitly', () => {
    render(
      <Field label="From prop">
        <Field.Label>From subpart</Field.Label>
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.queryByText('From prop')).not.toBeInTheDocument();
    expect(screen.getByText('From subpart')).toBeInTheDocument();
  });

  it('Field.Error has role="alert" and is wired into aria-describedby', () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Input placeholder="Type" />
        <Field.Error>Boom!</Field.Error>
      </Field>,
    );

    const error = screen.getByText('Boom!');
    expect(error).toHaveAttribute('role', 'alert');
    const input = screen.getByPlaceholderText('Type');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('Field.Helper is suppressed when Field.Error is present', () => {
    render(
      <Field>
        <Input placeholder="Type" />
        <Field.Helper>Helper text</Field.Helper>
        <Field.Error>Error text</Field.Error>
      </Field>,
    );

    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders the same DOM IDs in compound and prop-driven modes', () => {
    const { container: propsContainer } = render(
      <Field label="Email" description="Desc" htmlFor="email-x">
        <Input />
      </Field>,
    );
    const { container: compoundContainer } = render(
      <Field htmlFor="email-x">
        <Field.Label>Email</Field.Label>
        <Field.Description>Desc</Field.Description>
        <Input />
      </Field>,
    );

    const propsInput = propsContainer.querySelector('input');
    const compoundInput = compoundContainer.querySelector('input');
    expect(propsInput?.id).toBe(compoundInput?.id);
    expect(propsInput?.id).toBe('email-x');
  });

  it('Field.Description uses the same id whether rendered via prop or subpart', () => {
    const { container: propsContainer } = render(
      <Field label="Email" description="Desc">
        <Input />
      </Field>,
    );
    const { container: compoundContainer } = render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Description>Desc</Field.Description>
        <Input />
      </Field>,
    );

    const propsDesc = propsContainer.querySelector('p[data-field-description]');
    const compoundDesc = compoundContainer.querySelector('p[data-field-description]');
    expect(propsDesc?.id).toBeTruthy();
    expect(compoundDesc?.id).toBeTruthy();
    // The compound version's id ties to the inner input's aria-describedby
    const compoundInput = compoundContainer.querySelector('input');
    expect(compoundInput?.getAttribute('aria-describedby')).toContain(compoundDesc?.id ?? '');
  });

  it('Field.Control renders a row wrapper with data-field-control', () => {
    const { container } = render(
      <Field>
        <Field.Label>x</Field.Label>
        <Field.Control>
          <Input placeholder="Type" />
        </Field.Control>
      </Field>,
    );

    const controls = container.querySelectorAll('[data-field-control]');
    expect(controls.length).toBeGreaterThan(0);
  });
});
