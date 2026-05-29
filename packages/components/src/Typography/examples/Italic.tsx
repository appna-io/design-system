import { Div, Typography } from 'apx-ds';

export default function Italic() {
  return (
    <Div display="flex" flexDirection="column" gap={2}>
      <Typography italic>Italic body text — perfect for asides and citations.</Typography>
      <Typography italic decoration="underline">
        Italic + underline — used sparingly for emphasized terms in running prose.
      </Typography>
      <Typography transform="upper" weight="bold" letterSpacing="wider">
        Loud transformed header
      </Typography>
    </Div>
  );
}
