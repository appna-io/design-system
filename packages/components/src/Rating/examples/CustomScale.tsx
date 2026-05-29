import { Rating } from 'apx-ds';

export default function CustomScale() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Rating defaultValue={2} max={3} ariaLabel="Three-star scale" />
      <Rating defaultValue={7} max={10} ariaLabel="Ten-star scale" />
    </div>
  );
}
