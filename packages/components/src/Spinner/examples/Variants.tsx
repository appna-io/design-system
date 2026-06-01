import { Div, Spinner } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      <Spinner variant="ring" />
      <Spinner variant="dots" />
      <Spinner variant="pulse" />
    </Div>
  );
}