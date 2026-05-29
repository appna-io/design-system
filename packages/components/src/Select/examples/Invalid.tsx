import { Select } from 'apx-ds';

export default function Invalid() {
  return (
    <div className="flex flex-col gap-1 max-w-sm">
      <label htmlFor="country" className="text-sm font-medium">
        Country
      </label>
      <Select id="country" invalid placeholder="Select a country" aria-describedby="country-error">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="fr">France</Select.Item>
          <Select.Item value="de">Germany</Select.Item>
        </Select.Content>
      </Select>
      <p id="country-error" className="text-xs text-danger">
        Country is required.
      </p>
    </div>
  );
}
