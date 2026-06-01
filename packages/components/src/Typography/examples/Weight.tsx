import { Div, Typography } from '@apx-ui/ds';

export default function Weight() {
  return (
    <Div display="flex" flexDirection="column" gap={2}>
      <Typography weight="normal">Normal (400)</Typography>
      <Typography weight="medium">Medium (500)</Typography>
      <Typography weight="semibold">Semibold (600)</Typography>
      <Typography weight="bold">Bold (700)</Typography>
      <Typography weight={500}>Raw numeric weight (500) — bypasses the token table</Typography>
    </Div>
  );
}