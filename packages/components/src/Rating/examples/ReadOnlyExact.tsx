import { Div, Rating } from '@apx-ui/ds';

export default function ReadOnlyExact() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Rating value={3.71} readOnly precision="exact" showValue ariaLabel="Average rating" />
      <Rating value={4.92} readOnly precision="exact" showValue ariaLabel="Average rating" />
      <Rating value={1.04} readOnly precision="exact" showValue ariaLabel="Average rating" />
    </Div>
  );
}