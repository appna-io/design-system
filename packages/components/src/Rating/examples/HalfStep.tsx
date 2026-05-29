import { Rating } from '@apx-ui/ds';

export default function HalfStep() {
  return (
    <Rating
      defaultValue={3.5}
      precision={0.5}
      ariaLabel="Rate with half-stars"
      showValue
    />
  );
}
