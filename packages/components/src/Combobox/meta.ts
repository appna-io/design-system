import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'combobox',
  displayName: 'Combobox',
  description:
    "Searchable-select primitive — `<Select>` with a typeable input that filters its option list as the user types. Single + multi modes, async loading with debounce + AbortController, creatable items, grouped options, full ARIA Combobox + Listbox pattern. Reuses Input's form-control shell, Select's listbox surface, and `_shared/useListKeyboard` (its third consumer).",
  category: 'Forms',
  tags: ['combobox', 'autocomplete', 'search', 'multi-select', 'tag-input', 'creatable'],
};
