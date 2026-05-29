import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../src/Field';
import { Input } from '../src/Input/Input';
import { renderWithTheme as render } from './utils';

describe('<Field /> — prop-driven rendering', () => {
  it('renders a label, an Input, and a helper paragraph', () => {
    render(
      <Field label="Email" helperText="We'll never share this.">
        <Input placeholder="Type here" />
      </Field>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    expect(screen.getByText("We'll never share this.")).toBeInTheDocument();
  });

  it('associates the label with the inner control via htmlFor + id', () => {
    render(
      <Field label="Email">
        <Input placeholder="Type" />
      </Field>,
    );

    const label = screen.getByText('Email').closest('label');
    const input = screen.getByPlaceholderText('Type');
    expect(label).not.toBeNull();
    expect(label?.getAttribute('for')).toBe(input.getAttribute('id'));
    expect(input.getAttribute('id')).toBeTruthy();
  });

  it('honors a consumer-provided htmlFor on Field', () => {
    render(
      <Field label="Email" htmlFor="my-email">
        <Input placeholder="Type" />
      </Field>,
    );

    const input = screen.getByPlaceholderText('Type');
    expect(input.getAttribute('id')).toBe('my-email');
    expect(screen.getByText('Email').closest('label')?.getAttribute('for')).toBe('my-email');
  });

  it('renders a required indicator and sets aria-required when required', () => {
    render(
      <Field label="Name" required>
        <Input placeholder="Type" />
      </Field>,
    );

    const indicator = screen.getByText('*');
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByPlaceholderText('Type')).toHaveAttribute('aria-required', 'true');
  });

  it('hides the required indicator when hideRequiredIndicator', () => {
    render(
      <Field label="Name" required hideRequiredIndicator>
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type')).toHaveAttribute('aria-required', 'true');
  });

  it('renders the (optional) text when optional', () => {
    render(
      <Field label="Phone" optional>
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.getByText('(optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type')).not.toHaveAttribute('aria-required');
  });

  it('renders the description and wires it into aria-describedby', () => {
    render(
      <Field label="Email" description="Long-form guidance.">
        <Input placeholder="Type" />
      </Field>,
    );

    const description = screen.getByText('Long-form guidance.');
    const input = screen.getByPlaceholderText('Type');
    expect(description.tagName).toBe('P');
    expect(description.id).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toContain(description.id);
  });

  it('replaces helperText with error when error is set', () => {
    render(
      <Field label="Email" helperText="hint" error="boom">
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.queryByText('hint')).not.toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Type');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders <fieldset><legend> when as="fieldset"', () => {
    render(
      <Field as="fieldset" label="Group">
        <input data-testid="inner" />
      </Field>,
    );

    const fieldset = screen.getByTestId('inner').closest('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = fieldset?.querySelector('legend');
    expect(legend?.textContent).toContain('Group');
  });

  it('applies disabled to a fieldset and propagates via context', () => {
    render(
      <Field as="fieldset" label="Group" disabled>
        <input data-testid="inner" />
      </Field>,
    );

    const fieldset = screen.getByTestId('inner').closest('fieldset');
    expect(fieldset).toHaveAttribute('disabled');
  });

  it('renders startAdornment and endAdornment around the control row', () => {
    render(
      <Field label="Amount" startAdornment={<span>$</span>} endAdornment={<span>USD</span>}>
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders labelAddon next to the label text', () => {
    render(
      <Field label="Plan" labelAddon={<span data-testid="badge">Pro</span>}>
        <Input placeholder="Type" />
      </Field>,
    );

    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('applies labelWidth when labelPosition="start"', () => {
    const { container } = render(
      <Field label="Email" labelPosition="start" labelWidth="160px">
        <Input placeholder="Type" />
      </Field>,
    );

    const labelColumn = container.querySelector('[data-field-root]')?.firstElementChild as HTMLElement;
    expect(labelColumn?.style.width).toBe('160px');
  });

  it('renders a sr-only label when labelPosition="hidden"', () => {
    render(
      <Field label="Search" labelPosition="hidden">
        <Input placeholder="Type" />
      </Field>,
    );

    const label = screen.getByText('Search').closest('label');
    expect(label?.className).toContain('sr-only');
  });

  it('forwards arbitrary HTML attributes to the root div', () => {
    const { container } = render(
      <Field label="x" data-testid="root" aria-label="custom-field">
        <Input />
      </Field>,
    );
    const root = container.querySelector('[data-testid="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('aria-label', 'custom-field');
  });

  it('warns in dev when both required and optional are set', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Field label="x" required optional>
        <Input />
      </Field>,
    );
    expect(consoleSpy.mock.calls.some(([msg]) => String(msg).includes('mutually exclusive'))).toBe(
      true,
    );
    consoleSpy.mockRestore();
  });

  it('propagates value/onChange through to the inner control', () => {
    const onChange = vi.fn();
    render(
      <Field label="Email">
        <Input value="hello" onChange={onChange} />
      </Field>,
    );

    const input = screen.getByDisplayValue('hello');
    fireEvent.change(input, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('omits aria-describedby when no description / helper / error renders', () => {
    render(
      <Field label="Email">
        <Input placeholder="x" />
      </Field>,
    );
    expect(screen.getByPlaceholderText('x')).not.toHaveAttribute('aria-describedby');
  });
});
