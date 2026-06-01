import { ColorSwatch, Div } from '@apx-ui/ds';

export default function ColorSwatchSizes() {
  return (
    <Div display="flex" alignItems="center" gap="3">
      <ColorSwatch value="#6c5ce7" size="sm" />
      <ColorSwatch value="#6c5ce7" size="md" />
      <ColorSwatch value="#6c5ce7" size="lg" />
    </Div>
  );
}