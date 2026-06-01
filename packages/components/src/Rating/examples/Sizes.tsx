import { Div, Rating } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Rating defaultValue={4} size="sm" ariaLabel="Small rating" />
      <Rating defaultValue={4} size="md" ariaLabel="Medium rating" />
      <Rating defaultValue={4} size="lg" ariaLabel="Large rating" />
    </Div>
  );
}