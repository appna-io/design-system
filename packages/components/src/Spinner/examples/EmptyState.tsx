import { Spinner } from '@apx-ui/ds';

export default function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        gap: 16,
        border: '1px dashed rgba(0,0,0,0.12)',
        borderRadius: 12,
      }}
    >
      <Spinner variant="ring" size={64} color="primary" label="Loading reports" labelPlacement="bottom" />
      <span style={{ fontSize: 13, opacity: 0.7 }}>
        Spinner sized at 64px works as the EmptyState graphic for a loading slot.
      </span>
    </div>
  );
}
