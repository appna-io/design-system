import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'field',
  displayName: 'Field',
  description:
    "Form-field composition wrapper that pairs a label, optional description, a single form control, and helper / error text. Four label positions (top / start / floating / hidden), required / optional indicators, fieldset / legend semantics for grouped controls, label addons, and start/end adornments. Integrates with every form control via FieldContext — zero source-code changes to any existing control.",
  category: 'Forms',
  tags: ['field', 'form', 'label', 'helper', 'error', 'fieldset', 'a11y', 'compound'],
};