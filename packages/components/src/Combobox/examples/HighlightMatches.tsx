import { Combobox, highlightMatch } from '@apx-ui/ds';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
  { value: 'elderberry', label: 'Elderberry' },
];

export default function HighlightMatches() {
  return (
    <div className="max-w-sm">
      <Combobox
        aria-label="Fruit"
        placeholder="Type to filter…"
        options={FRUITS}
        renderOption={({ option, query }) => (
          <span className="flex-1 truncate">
            {highlightMatch(option.label, query, 'bg-transparent text-primary font-semibold')}
          </span>
        )}
      />
    </div>
  );
}
