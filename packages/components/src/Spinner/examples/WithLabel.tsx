import { Div, Spinner } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <Div display="flex" alignItems="center" gap="8">
      <Spinner label="Loading users" labelPlacement="end" />
      <Spinner label="Saving" labelPlacement="bottom" />
      <Spinner label="Fetching invoices" labelPlacement="hidden" />
    </Div>
  );
}