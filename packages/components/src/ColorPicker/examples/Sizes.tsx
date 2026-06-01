import { ColorPicker, Div } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" alignItems="center" gap="3">
      <ColorPicker defaultValue="#FF6B6B" size="sm" ariaLabel="Small" />
      <ColorPicker defaultValue="#FF6B6B" size="md" ariaLabel="Medium" />
      <ColorPicker defaultValue="#FF6B6B" size="lg" ariaLabel="Large" />
    </Div>
  );
}