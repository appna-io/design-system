import { Spinner } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <Spinner label="Loading users" labelPlacement="end" />
      <Spinner label="Saving" labelPlacement="bottom" />
      <Spinner label="Fetching invoices" labelPlacement="hidden" />
    </div>
  );
}
