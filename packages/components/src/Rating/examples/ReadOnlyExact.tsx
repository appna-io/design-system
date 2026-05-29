import { Rating } from 'apx-ds';

export default function ReadOnlyExact() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Rating value={3.71} readOnly precision="exact" showValue ariaLabel="Average rating" />
      <Rating value={4.92} readOnly precision="exact" showValue ariaLabel="Average rating" />
      <Rating value={1.04} readOnly precision="exact" showValue ariaLabel="Average rating" />
    </div>
  );
}
