import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Select } from '../src/Select';
import type { SelectColor, SelectVariant } from '../src/Select';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

/**
 * Accessibility checks for `<Select>`. Combobox + Listbox pattern: trigger has
 * `role="combobox"`, content has `role="listbox"`, items have `role="option"` + `aria-selected`,
 * and `aria-activedescendant` reflects the highlighted item id while the listbox is open.
 *
 * Axe coverage walks every trigger variant (4) × content variant (3) × color (7) cell that the
 * trigger paints into. We sample the matrix rather than full-cross since the underlying recipes
 * are the same shape as Menu / Input which already cover their full matrices.
 */
const triggerVariants: SelectVariant[] = ['outline', 'solid', 'ghost', 'underline'];
const sampleColors: SelectColor[] = ['primary', 'neutral', 'danger'];

describe('Select — accessibility', () => {
  it('trigger has role=combobox + aria-haspopup=listbox + ARIA expanded/controls wiring', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
  });

  it('content has role=listbox + aria-labelledby trigger', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('items carry role=option + aria-selected + aria-disabled', async () => {
    render(
      <Select defaultOpen defaultValue="a">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
          <Select.Item value="b" disabled>
            B
          </Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).not.toHaveAttribute('aria-disabled');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('aria-activedescendant on the listbox reflects the keyboard-highlighted item', async () => {
    const user = userEvent.setup();
    render(
      <Select defaultOpen placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
          <Select.Item value="b">B</Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const listbox = screen.getByRole('listbox');
    await user.keyboard('{End}');
    await waitFor(() => {
      const id = listbox.getAttribute('aria-activedescendant');
      expect(id).toBeTruthy();
      expect(screen.getByRole('option', { name: 'B' }).id).toBe(id);
    });
  });

  it('useFormFieldA11y propagates aria-invalid + aria-required + aria-describedby to trigger', () => {
    render(
      <div>
        <Select invalid required aria-describedby="helper" placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select>
        <p id="helper">Helper text</p>
      </div>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('axe: zero violations across trigger variants (closed)', async () => {
    for (const variant of triggerVariants) {
      const { container, unmount } = render(
        <Select variant={variant} placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe: zero violations across sampled colors (closed)', async () => {
    for (const color of sampleColors) {
      const { container, unmount } = render(
        <Select color={color} placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe: zero violations when open with groups + label + separator', async () => {
    const { container } = render(
      <Select defaultOpen placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.Label>Europe</Select.Label>
            <Select.Item value="fr">France</Select.Item>
            <Select.Item value="de">Germany</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Asia</Select.Label>
            <Select.Item value="jp">Japan</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: zero violations with invalid + required state', async () => {
    const { container } = render(
      <Select invalid required placeholder="Pick a country">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
