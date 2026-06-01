import { Div, Select, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="1" className="max-w-sm">
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
      <Typography id="country-error" variant="caption" color="danger">
        Country is required.
      </Typography>
    </Div>
  );
}