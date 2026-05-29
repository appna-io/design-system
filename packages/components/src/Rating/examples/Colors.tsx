import { Rating } from '@apx-ui/ds';

export default function Colors() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Rating defaultValue={4} color="warning" ariaLabel="Warning (default gold)" />
      <Rating defaultValue={4} color="primary" ariaLabel="Primary" />
      <Rating defaultValue={4} color="success" ariaLabel="Success" />
      <Rating defaultValue={4} color="danger" ariaLabel="Danger" />
      <Rating defaultValue={4} color="neutral" ariaLabel="Neutral" />
    </div>
  );
}
