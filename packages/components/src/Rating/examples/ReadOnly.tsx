import { Div, Rating } from '@apx-ui/ds';

export default function ReadOnly() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Rating value={4} readOnly ariaLabel="4 of 5 stars" />
      <Rating value={2.5} readOnly precision={0.5} ariaLabel="2.5 of 5 stars" />
    </Div>
  );
}