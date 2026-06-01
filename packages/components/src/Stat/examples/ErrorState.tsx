import { Div, Stat } from '@apx-ui/ds';

export default function ErrorState() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Stat label="Revenue" error="Failed to load" />
      <Stat label="Active users" error="API request timed out" variant="elevated" />
    </Div>
  );
}