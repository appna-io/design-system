import { ColorPicker } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ColorPicker defaultValue="#FF6B6B" size="sm" ariaLabel="Small" />
      <ColorPicker defaultValue="#FF6B6B" size="md" ariaLabel="Medium" />
      <ColorPicker defaultValue="#FF6B6B" size="lg" ariaLabel="Large" />
    </div>
  );
}
