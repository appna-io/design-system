import { Combobox, Div } from '@apx-ui/ds';

const CITIES = [
  { value: 'sf', label: 'San Francisco' },
  { value: 'nyc', label: 'New York City' },
  { value: 'chi', label: 'Chicago' },
  { value: 'sea', label: 'Seattle' },
  { value: 'aus', label: 'Austin' },
  { value: 'den', label: 'Denver' },
];

/**
 * Quick-review demo: searchable select with a typed query and a visible filtered option list.
 */
export default function Overview() {
  return (
    <Div className="max-w-sm">
      <Combobox
        options={CITIES}
        placeholder="Search cities…"
        aria-label="Office location"
        defaultOpen
        defaultInputValue="S"
      />
    </Div>
  );
}