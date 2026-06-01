import { Combobox, Div } from '@apx-ui/ds';

export default function Grouped() {
  return (
    <Div className="max-w-sm">
      <Combobox
        aria-label="Country"
        placeholder="Pick a country"
        options={[
          {
            type: 'group',
            label: 'Americas',
            children: [
              { value: 'us', label: 'United States' },
              { value: 'br', label: 'Brazil' },
              { value: 'ca', label: 'Canada' },
              { value: 'mx', label: 'Mexico' },
            ],
          },
          {
            type: 'group',
            label: 'Europe',
            children: [
              { value: 'uk', label: 'United Kingdom' },
              { value: 'de', label: 'Germany' },
              { value: 'fr', label: 'France' },
              { value: 'es', label: 'Spain' },
            ],
          },
          {
            type: 'group',
            label: 'Asia',
            children: [
              { value: 'jp', label: 'Japan' },
              { value: 'in', label: 'India' },
              { value: 'kr', label: 'South Korea' },
            ],
          },
        ]}
      />
    </Div>
  );
}