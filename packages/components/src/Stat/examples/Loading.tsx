import { Div, Stat } from '@apx-ui/ds';

export default function Loading() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Stat label="Revenue" loading />
      <Stat label="Active users" loading variant="elevated" />
      <Stat label="Conversion" loading size="lg" />
    </Div>
  );
}