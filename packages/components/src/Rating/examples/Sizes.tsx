import { Rating } from 'apx-ds';

export default function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Rating defaultValue={4} size="sm" ariaLabel="Small rating" />
      <Rating defaultValue={4} size="md" ariaLabel="Medium rating" />
      <Rating defaultValue={4} size="lg" ariaLabel="Large rating" />
    </div>
  );
}
