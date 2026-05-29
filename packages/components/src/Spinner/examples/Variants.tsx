import { Spinner } from 'apx-ds';

export default function Variants() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Spinner variant="ring" />
      <Spinner variant="dots" />
      <Spinner variant="pulse" />
    </div>
  );
}
