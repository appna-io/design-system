import { Combobox } from 'apx-ds';

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
];

export default function Basic() {
  return (
    <div className="max-w-sm">
      <Combobox options={COUNTRIES} placeholder="Pick a country" aria-label="Country" />
    </div>
  );
}
