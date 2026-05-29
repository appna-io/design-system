import { Spinner } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
      <Spinner size={64} />
    </div>
  );
}
