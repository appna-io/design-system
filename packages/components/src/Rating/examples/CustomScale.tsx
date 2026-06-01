import { Div, Rating } from '@apx-ui/ds';

export default function CustomScale() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Rating defaultValue={2} max={3} ariaLabel="Three-star scale" />
      <Rating defaultValue={7} max={10} ariaLabel="Ten-star scale" />
    </Div>
  );
}