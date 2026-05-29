import { Div, Typography } from 'apx-ds';

export default function Align() {
  return (
    <Div display="flex" flexDirection="column" gap={2}>
      <Typography align="left">Left aligned (default for LTR)</Typography>
      <Typography align="center">Centered</Typography>
      <Typography align="right">Right aligned</Typography>
      <Typography align="justify">
        Justified copy stretches the line so both edges reach the container — best for wide
        columns of running prose.
      </Typography>
    </Div>
  );
}
