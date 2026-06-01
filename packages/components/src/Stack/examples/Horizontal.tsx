import { Div, HStack, Typography } from '@apx-ui/ds';

export default function Horizontal() {
  return (
    <HStack gap={2} align="center">
      <Div className="rounded-md bg-primary px-3 py-2 text-primary-contrast">Logo</Div>
      <Typography color="fg.default">Acme Inc.</Typography>
      <Typography color="fg.muted">/ Dashboard</Typography>
    </HStack>
  );
}