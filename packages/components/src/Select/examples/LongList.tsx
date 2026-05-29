import { Select } from '@apx-ui/ds';

const cities = [
  'Amsterdam', 'Athens', 'Bangkok', 'Barcelona', 'Beijing', 'Berlin', 'Bogotá',
  'Boston', 'Brussels', 'Buenos Aires', 'Cairo', 'Cape Town', 'Chicago', 'Copenhagen',
  'Delhi', 'Dubai', 'Dublin', 'Edinburgh', 'Frankfurt', 'Geneva', 'Helsinki',
  'Hong Kong', 'Istanbul', 'Jakarta', 'Johannesburg', 'Karachi', 'Kuala Lumpur',
  'Lagos', 'Lima', 'Lisbon', 'London', 'Los Angeles', 'Madrid', 'Manila', 'Melbourne',
  'Mexico City', 'Miami', 'Milan', 'Montréal', 'Moscow', 'Mumbai', 'Munich',
  'Nairobi', 'New York', 'Oslo', 'Paris', 'Prague', 'Reykjavik', 'Rio de Janeiro',
  'Rome', 'San Francisco', 'Santiago', 'São Paulo', 'Seoul', 'Shanghai', 'Singapore',
  'Stockholm', 'Sydney', 'Taipei', 'Tehran', 'Tel Aviv', 'Tokyo', 'Toronto',
  'Vancouver', 'Vienna', 'Warsaw', 'Washington', 'Wellington', 'Zürich',
];

/**
 * 60+ items — the listbox keeps its `max-h-[var(--radix-select-content-available-height,_18rem)]`
 * cap and scrolls internally; keyboard nav auto-scrolls the highlighted item into view via the
 * `scrollIntoView({ block: 'nearest' })` call in `SelectContent`.
 */
export default function LongList() {
  return (
    <Select placeholder="Pick a city" aria-label="City">
      <Select.Trigger />
      <Select.Content>
        {cities.map((city) => (
          <Select.Item key={city} value={city}>
            {city}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
