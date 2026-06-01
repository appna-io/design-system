import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Form, FormField } from '../src/Form';
import { Input } from '../src/Input/Input';
import { Checkbox } from '../src/Checkbox/Checkbox';
import { renderWithTheme as render } from './utils';

interface V extends Record<string, unknown> {
  email: string;
  agree: boolean;
}

const initial: V = { email: '', agree: false };

describe('<Form> + <FormField>', () => {
  it('renders a native <form noValidate> with no auto-open behavior', () => {
    const { container } = render(
      <Form<V> initialValues={initial} onSubmit={vi.fn()}>
        <FormField name="email" label="Email">
          <Input type="email" />
        </FormField>
      </Form>,
    );
    const form = container.querySelector('form')!;
    expect(form).toBeInTheDocument();
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  it('typing into a FormField updates the form value', async () => {
    const onSubmit = vi.fn();
    render(
      <Form<V> initialValues={initial} onSubmit={onSubmit}>
        <FormField name="email" label="Email">
          <Input type="email" />
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    await userEvent.type(input, 'ada@example.com');
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ email: 'ada@example.com' });
  });

  it('checkbox binding wires onCheckedChange', async () => {
    const onSubmit = vi.fn();
    render(
      <Form<V> initialValues={initial} onSubmit={onSubmit}>
        <FormField name="agree" binding="checkbox">
          <Checkbox>Agree</Checkbox>
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    await userEvent.click(screen.getByLabelText('Agree'));
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ agree: true });
  });

  it('central validate prevents submit + sets errors', async () => {
    const onSubmit = vi.fn();
    render(
      <Form<V>
        initialValues={initial}
        validate={(v) => ({ email: v.email ? undefined : 'Required' })}
        onSubmit={onSubmit}
      >
        <FormField name="email" label="Email">
          <Input />
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('per-field validator on FormField runs at submit', async () => {
    const onSubmit = vi.fn();
    render(
      <Form<V> initialValues={initial} onSubmit={onSubmit}>
        <FormField
          name="email"
          label="Email"
          validate={(value) => (String(value).includes('@') ? null : 'Bad email')}
        >
          <Input />
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'no-at');
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(screen.getByText('Bad email')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('error only shows after blur (default validateOn=submit-and-blur)', async () => {
    render(
      <>
        <Form<V>
          initialValues={initial}
          validate={() => ({ email: 'Required' })}
          onSubmit={vi.fn()}
        >
          <FormField name="email" label="Email">
            <Input />
          </FormField>
        </Form>
        <button>outside</button>
      </>,
    );
    expect(screen.queryByText('Required')).toBeNull();
    const input = screen.getByLabelText('Email');
    // userEvent.tab moves focus away naturally, which dispatches blur with the right
    // relatedTarget — more faithful to a real user than `fireEvent.blur`.
    input.focus();
    await userEvent.tab();
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('focusOnError focuses the first invalid field after failed submit', async () => {
    render(
      <Form<V>
        initialValues={initial}
        validate={() => ({ email: 'Required' })}
        onSubmit={vi.fn()}
      >
        <FormField name="email" label="Email">
          <Input />
        </FormField>
        <button type="submit">go</button>
      </Form>,
    );
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText('Email'));
    });
  });

  it('render-prop receives the live FormApi', () => {
    render(
      <Form<V> initialValues={initial} onSubmit={vi.fn()}>
        {(form) => (
          <span data-testid="dirty">{String(form.isDirty)}</span>
        )}
      </Form>,
    );
    expect(screen.getByTestId('dirty').textContent).toBe('false');
  });

  it('resetForm via render-prop restores initial values', async () => {
    render(
      <Form<V> initialValues={initial} onSubmit={vi.fn()}>
        {(form) => (
          <>
            <FormField name="email" label="Email">
              <Input />
            </FormField>
            <button type="button" onClick={() => form.resetForm()}>reset</button>
            <span data-testid="email">{String(form.values.email)}</span>
          </>
        )}
      </Form>,
    );
    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'hello');
    expect(screen.getByTestId('email').textContent).toBe('hello');
    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByTestId('email').textContent).toBe('');
  });

  it('isSubmitting flips during onSubmit', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolveSubmit = r;
        }),
    );
    render(
      <Form<V> initialValues={initial} onSubmit={onSubmit}>
        {(form) => (
          <>
            <button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Submitting…' : 'go'}
            </button>
          </>
        )}
      </Form>,
    );
    fireEvent.click(screen.getByText('go'));
    await waitFor(() => {
      expect(screen.getByText('Submitting…')).toBeInTheDocument();
    });
    resolveSubmit?.();
    await waitFor(() => {
      expect(screen.queryByText('Submitting…')).toBeNull();
    });
  });
});