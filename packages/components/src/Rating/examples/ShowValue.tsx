import { Div, Rating } from '@apx-ui/ds';

export default function ShowValue() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Rating value={4} readOnly showValue ariaLabel="Average rating" />
      <Rating value={3.5} readOnly precision={0.5} showValue ariaLabel="Half-step average" />
      <Rating value={4.27} readOnly precision="exact" showValue ariaLabel="Fractional average" />
    </Div>
  );
}