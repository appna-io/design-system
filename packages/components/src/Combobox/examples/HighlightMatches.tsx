import { Combobox, Div, Typography, highlightMatch } from '@apx-ui/ds';

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
    <Div className="max-w-sm">
      <Combobox
        aria-label="Fruit"
        placeholder="Type to filter…"
        options={FRUITS}
        renderOption={({ option, query }) => (
          <Typography as="span" className="flex-1 truncate">
            {highlightMatch(option.label, query, 'bg-transparent text-primary font-semibold')}
          </Typography>
        )}
      />
    </Div>
  );
}