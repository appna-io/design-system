import { Div, Spinner } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
      <Spinner size={64} />
    </Div>
  );
}